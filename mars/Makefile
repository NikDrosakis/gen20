# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -std=c++17  # Add other compiler flags here

# Explicit include paths
INC = -I/usr/include -I/usr/include/yaml-cpp -I/usr/include/mariadb -I/usr/include/mariadb/conncpp

# Get the correct lib path from mariadb_config
MYSQL_LIB_DIR := $(shell mariadb_config --libs)

# Library directories and dependencies for linking
LIB =  -lhiredis -lyaml-cpp $(MYSQL_LIB_DIR) -lmariadbcpp -lssl -lcrypto -pthread

# Source and object files
SOURCES = Gredis.cpp Maria.cpp main.cpp Yaml.cpp
OBJECTS = $(SOURCES:.cpp=.o)

# Executable name
TARGET = main

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LIB)

.cpp.o:
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

clean:
	rm -f $(OBJECTS) $(TARGET)