# config.py
import os

class Config:
    DB_URL = os.getenv("DB_URL", "mariadb://dros:n130177!@localhost:3306/gen_vivalibrocom")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_key")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-svcacct-fL6ZuXVYLsPT9dqIoGthgBFJNf7y5IItA2jT2GBy-rV_EDJpO7T3BlbkFJ0VJ_hWb5Y-3cY0YKki5qvVLRMcB11UbH69TVq3GW3Vhn2rouMA")
    CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "your_claude_key")
    TASK_CRON_SCHEDULE = "0 2 * * *"  # Example cron schedule (2 AM daily)
    PHP_ENDPOINT = os.getenv("PHP_ENDPOINT", "https://vivalibro.com/apy/v1/")

config = Config()
