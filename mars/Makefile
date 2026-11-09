# /var/www/gs/mars/Makefile
CXX = g++
CXXFLAGS = -Wall -std=c++17 -pthread

INC = -I./core -I./cubos -I/usr/include

LIB = -lyaml-cpp -L/usr/lib/x86_64-linux-gnu/ -L/usr/local/lib \
      -lmariadb -lmariadbcpp \
      -pthread -lssl -lcrypto \
      -lboost_system -lboost_thread

VPATH = core core/build cubos cubos/build

SOURCES = core/Maria.cpp core/Yaml.cpp core/FS.cpp core/Ws.cpp

# === CUBOS:START ===
CUBO_SOURCES = cubos/aggregator.cpp
# === CUBOS:END ===

OBJECTS = core/build/Maria.o core/build/Yaml.o core/build/FS.o core/build/Ws.o

# === CUBOS:START ===
CUBO_OBJECTS = cubos/build/aggregator.o
# === CUBOS:END ===

TARGET = main

all: create_build_dirs $(TARGET)

create_build_dirs:
	mkdir -p core/build cubos/build

$(TARGET): main.o $(OBJECTS) $(CUBO_OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LIB)

main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

core/build/%.o: core/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)

# === CUBOS:START ===
cubos/build/%.o: cubos/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(INC)
# === CUBOS:END ===

clean:
	rm -f $(OBJECTS) $(CUBO_OBJECTS) $(TARGET) main.o
	rm -rf core/build cubos/build

build: all
quick:
	$(MAKE) -j$$(nproc)
info:
	@echo "=== Mars ==="
	@echo "  target:  $(TARGET)"
	@echo "  sources: $(SOURCES)"
	@echo "  cubos:   $(CUBO_SOURCES)"