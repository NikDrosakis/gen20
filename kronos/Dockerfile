FROM python:3.9
WORKDIR /app

# Copy requirements.txt first
COPY store/requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]