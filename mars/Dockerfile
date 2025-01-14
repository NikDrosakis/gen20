# Use Debian as the base image
FROM debian:latest

# Set working directory
WORKDIR /app

# Copy project files into the container
COPY . .

# Install dependencies (build tools, C++ libraries, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    g++ \
    make \
    yaml-cpp-dev \
    nlohmann-json3-dev \
    hiredis-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Build the project
RUN make

# Set the default command to run when the container starts
CMD ["./main", "plan"]
