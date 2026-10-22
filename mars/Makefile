# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17 -pthread

# Define paths
INC_DIR = /usr/include
LIB_DIR = /usr/lib/x86_64-linux-gnu

# Explicit include paths
INC = -I./core -I/usr/include

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB = -lyaml-cpp -L/usr/lib/x86_64-linux-gnu/ -L/usr/local/lib \
      -lmariadb -lmariadbcpp \
      -pthread -lssl -lcrypto

# Source and object files
VPATH = core core/build

SOURCES = core/Maria.cpp core/Yaml.cpp core/FS.cpp core/Cubo.cpp core/Ws.cpp

OBJECTS = core/build/Maria.o core/build/Yaml.o core/build/FS.o core/build/Ws.o core/build/Cubo.o

# Executable name
TARGET = main

# Ensure build directory exists and compile all sources
all: create_build_dir $(TARGET)

create_build_dir:
	mkdir -p core/build

# Link object files into the final executable
$(TARGET): main.o $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LIB)

# Rule to compile main.cpp to main.o
main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# Specific rules to compile .cpp files to object files in the core/build directory
core/build/%.o: core/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

clean:
	rm -f $(OBJECTS) $(TARGET) core/build/*.o main.o
