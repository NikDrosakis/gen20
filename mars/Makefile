# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17  # Added -v for verbose output

# Define paths
INC_DIR = /usr/include
LIB_DIR = /usr/lib/x86_64-linux-gnu

# Explicit include paths
INC =  -I./core  # Core includes

WS_INCLUDE = -I/usr/include # Simplified include path

# Compiler flags MUST be after include paths
CXXFLAGS += $(WS_INCLUDE)
INC += $(WS_INCLUDE)

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB = -lyaml-cpp \
      $(MYSQL_LIB_DIR) \
      -lmariadbcpp \
      -pthread -lssl -lcrypto -L/usr/lib/x86_64-linux-gnu # Manual linker specification

# Source and object files
SOURCES = core/Maria.cpp core/Yaml.cpp core/FS.cpp core/Cubo.cpp core/Ws.cpp main.cpp
OBJECTS = core/build/Maria.o core/build/Yaml.o core/build/FS.o core/build/Ws.o core/build/Cubo.o

# Executable name
TARGET = main

# Ensure build directories exist and compile all sources
all: $(TARGET)

# Link object files into the final executable
$(TARGET): main.o $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LIB)

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

core/build/Ws.o: core/Ws.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/Cubo.o: core/Cubo.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/FS.o: core/FS.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

clean:
	rm -f $(OBJECTS) $(TARGET) core/build/*.o main.o