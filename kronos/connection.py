from config import settings  # Importing the configuration
import mysql.connector
# Database Connection Setup
def get_db_connection():
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASS,
        database=settings.MARIA,
        use_unicode=True,
        charset="utf8mb4",
        collation="utf8mb4_general_ci"
    )