# Use the official Rust image as the base
FROM rust:latest

# Set the working directory
WORKDIR /usr/src/rus_api

# Copy the current directory into the container
COPY . .

# Build the API
RUN cargo build --release

# Expose port 3005
EXPOSE 3005

# Command to run the API
CMD ["./target/release/rus_api"]
