FROM python:3.11
WORKDIR /kronos

# Copy requirements.txt first
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the application will run on
EXPOSE 3006

# Run the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3006"]
