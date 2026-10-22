# Use an official GCC image as a base
FROM gcc:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy the source code into the container
COPY . .

# Make the install script executable
RUN chmod +x install.sh

# Execute the install script
RUN ./install.sh


# Command to run the compiled program
CMD ["./main"]