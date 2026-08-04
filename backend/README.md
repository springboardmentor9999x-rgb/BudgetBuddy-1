# 💰 Budget Buddy Backend

A RESTful backend for **Budget Buddy**, a personal finance management application that helps users track income, expenses, budgets, savings goals, and financial reports.

Built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**, following a clean and modular architecture.

---
### Create a Virtual Environment

```bash
uv init . # current directory (e.g., /backend)
uv sync # sets up the virtual environment (.venv)
```
### 📦 Requirements

Create a `requirements.txt` file with the following dependencies:

```text
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv
alembic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pydantic[email]
```

Install them using pip:

```bash
uv add -r requirements.txt
```




### Activate the Virtual Environment

#### Linux / macOS
```bash
source .venv/bin/activate
```

#### Windows (PowerShell)
```powershell
.venv\Scripts\Activate.ps1
```
---