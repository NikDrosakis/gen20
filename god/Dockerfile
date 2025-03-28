# Use the official Golang image from the Docker hub
FROM golang:1.23-alpine

# Set the working directory
WORKDIR /god

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download Go dependencies
RUN go mod tidy

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o main .

# Expose the port your app will run on
EXPOSE 3008

# Command to run the app
CMD ["./main"]
