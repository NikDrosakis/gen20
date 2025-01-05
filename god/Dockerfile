# Use the official Go image as the base image
FROM golang:1.21-alpine

# Set the working directory inside the container
WORKDIR /app

# Install Go dependencies
RUN go mod tidy

# Copy the rest of the Go application code
COPY . .

# Build the Go application
RUN go build -o main .

# Expose the port the application will run on
EXPOSE 3007

# Command to run the application
CMD ["./main"]

