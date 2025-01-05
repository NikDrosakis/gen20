CXX = g++
CXXFLAGS = -Wall -std=c++17
CXXFLAGS += -I/usr/include/yaml-cpp
LDFLAGS = -lhiredis -lyaml-cpp -lmariadbclient
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
