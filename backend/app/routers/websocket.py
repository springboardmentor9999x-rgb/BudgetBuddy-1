import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError

from app.database import SessionLocal
from app.configs.settings import Settings
from app.crud.user import get_user_by_email
from app.core.ws_manager import ws_manager
from app.services.notification_service import evaluate_initial_user_notifications

logger = logging.getLogger("budgetbuddy.websocket")

router = APIRouter()


def authenticate_token(token: str, db) -> tuple[int, str] | None:
    """Validate JWT access token and return (user_id, email) or None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, Settings.SECRET_KEY, algorithms=[Settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        user = get_user_by_email(db, email)
        if not user:
            return None
        return user.id, user.email
    except JWTError:
        return None


@router.websocket("/ws/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for subscribing to global real-time notifications.
    Supports JWT auth via cookie 'access_token', query param '?token=...',
    or initial JSON message {'type': 'auth', 'token': '...'}.
    """
    db = SessionLocal()
    user_id = None

    try:
        # 1. Try extracting token from query params or cookies
        token = websocket.query_params.get("token") or websocket.cookies.get("access_token")
        auth_result = authenticate_token(token, db) if token else None

        if auth_result:
            user_id, email = auth_result
            await ws_manager.connect(websocket, user_id)
        else:
            # If not in query/cookies, accept and wait for initial auth payload
            await websocket.accept()
            try:
                raw = await websocket.receive_text()
                data = json.loads(raw)
                if data.get("type") == "auth" and data.get("token"):
                    auth_result = authenticate_token(data.get("token"), db)
                    if auth_result:
                        user_id, email = auth_result
                        if user_id not in ws_manager.active_connections:
                            ws_manager.active_connections[user_id] = set()
                        ws_manager.active_connections[user_id].add(websocket)
                    else:
                        await websocket.send_json({"type": "error", "message": "Invalid authentication token"})
                        await websocket.close(code=1008)
                        return
                else:
                    await websocket.send_json({"type": "error", "message": "Authentication required"})
                    await websocket.close(code=1008)
                    return
            except Exception as e:
                logger.warning(f"WebSocket auth handshake failed: {e}")
                await websocket.close(code=1008)
                return

        # 2. Connection successfully established & authenticated
        await websocket.send_json({
            "type": "info",
            "title": "Connected",
            "message": "Real-time notification stream active",
            "dedupKey": "ws:connected",
            "showToast": False,
        })

        # 3. Dispatch initial state evaluation
        try:
            await evaluate_initial_user_notifications(db, user_id)
        except Exception as e:
            logger.error(f"Error evaluating initial notifications for user {user_id}: {e}")

        # 4. Message loop for keep-alive / ping-pong
        while True:
            msg_text = await websocket.receive_text()
            try:
                msg_data = json.loads(msg_text)
                msg_type = msg_data.get("type")
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                if msg_text.strip().lower() == "ping":
                    await websocket.send_text("pong")

    except WebSocketDisconnect:
        if user_id:
            ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Unexpected WebSocket error for user {user_id}: {e}")
        if user_id:
            ws_manager.disconnect(websocket, user_id)
    finally:
        db.close()
