# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17 # Add -v for debugging

# Explicit include paths
INC = -I/usr/include -I/usr/include/yaml-cpp -I/usr/include/mariadb -I/usr/include/mariadb/conncpp -I./core

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB = -lhiredis -lyaml-cpp $(MYSQL_LIB_DIR) -lmariadbcpp -lssl -lcrypto -pthread

# Source and object files
SOURCES = core/Gredis.cpp core/Maria.cpp core/Yaml.cpp main.cpp core/ws.cpp
OBJECTS = $(SOURCES:%.cpp=core/build/%.o)
OBJECTS := $(filter-out core/build/main.o,$(OBJECTS))

# Executable name
TARGET = main

# Ensure build directories exist and compile all sources
all: $(TARGET)

# Link object files into the final executable
$(TARGET): main.o $(OBJECTS)
	$(CXX) $(CXXFLAGS) main.o $(OBJECTS) -o $(TARGET) $(LIB)

# Rule to compile .cpp files to object files in the core/build directory
core/build/%.o: core/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# Clean up object files and the target executable
clean:
	rm -f $(OBJECTS) $(TARGET) core/build/*.o main.o