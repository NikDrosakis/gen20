# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17 # Add -v for verbose output

# Define paths
INC_DIR = /usr/include
LIB_DIR = /usr/lib

# Explicit include paths
INC = -I$(INC_DIR) \
      -I$(INC_DIR)/yaml-cpp \
      -I$(INC_DIR)/mariadb \
      -I$(INC_DIR)/mariadb/conncpp \
      -I./core

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB = -lhiredis \
      -lyaml-cpp \
      $(MYSQL_LIB_DIR) \
      -lmariadbcpp \
      -lssl \
      -lcrypto \
      -pthread

# Source and object files
SOURCES = core/Maria.cpp core/Yaml.cpp core/FS.cpp core/Cubo.cpp main.cpp
OBJECTS = core/build/Maria.o core/build/Yaml.o core/build/FS.o core/build/Cubo.o

# Executable name
TARGET = main

# Ensure build directories exist and compile all sources
all: $(TARGET)

# Link object files into the final executable
$(TARGET): main.o $(OBJECTS)
	$(CXX) $(CXXFLAGS) main.o $(OBJECTS) -o $(TARGET) $(LIB)

# Rule to compile main.cpp to main.o
main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# Specific rules to compile .cpp files to object files in the core/build directory
core/build/Gredis.o: core/Gredis.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/Maria.o: core/Maria.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/Yaml.o: core/Yaml.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/Cubo.o: core/Cubo.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/FS.o: core/FS.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# Clean up object files and the target executable
clean:
	rm -f $(OBJECTS) $(TARGET) core/build/*.o main.o