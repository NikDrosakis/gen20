CXX = g++
CXXFLAGS = -Wall -std=c++17 -I/usr/include/yaml-cpp -I/usr/include/mariadb


# Add -pthread for threading support, and make sure to link the correct MariaDB client library
LDFLAGS = -lhiredis -lyaml-cpp -lmariadb -pthread

SOURCES = Gredis.cpp Maria.cpp main.cpp Yaml.cpp
OBJECTS = $(SOURCES:.cpp=.o)
TARGET = main

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LDFLAGS)

.cpp.o:
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)
