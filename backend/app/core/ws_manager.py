from fastapi import WebSocket
import logging
from typing import Dict, Set

logger = logging.getLogger("budgetbuddy.websocket")


class WebSocketManager:
    """Manages active WebSocket connections per user to support multi-device/multi-tab real-time sync."""

    def __init__(self):
        # Maps user_id -> Set of active WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept WebSocket handshake and register the connection for the user."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Active sessions for user: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Unregister a disconnected WebSocket connection."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected a WebSocket session.")

    async def send_personal_message(self, message: dict, user_id: int):
        """Send a JSON payload to all active WebSocket sessions of a specific user."""
        if user_id not in self.active_connections:
            return

        dead_connections = set()
        for connection in list(self.active_connections[user_id]):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to user {user_id}: {e}")
                dead_connections.add(connection)

        # Cleanup any broken connections
        for dead_conn in dead_connections:
            self.active_connections[user_id].discard(dead_conn)
        if user_id in self.active_connections and not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected users."""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

    def is_user_connected(self, user_id: int) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0


ws_manager = WebSocketManager()
