# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17  # Add other compiler flags here

# Explicit include paths
INC = -I/usr/include -I/usr/include/yaml-cpp -I/usr/include/mariadb -I/usr/include/mariadb/conncpp -I./core

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB = -lhiredis -lyaml-cpp $(MYSQL_LIB_DIR) -lmariadbcpp -lssl -lcrypto -pthread

# Source and object files
SOURCES = core/Gredis.cpp core/Maria.cpp core/Yaml.cpp index.cpp
OBJECTS = $(SOURCES:core/%.cpp=core/build/%.o)

# Executable name
TARGET = main

# Ensure build directories exist and compile all sources
all: core/build $(TARGET)

# Link object files into the final executable
$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LIB)

# Rule to create build directories
core/build:
	mkdir -p core/build

# Rule to compile .cpp files to object files in the core/build directory
core/build/%.o: core/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# Clean up object files and the target executable
clean:
	rm -rf core/build $(TARGET)
