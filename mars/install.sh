#install
sudo apt install build-essential
sudo apt install libmariadb-dev
sudo apt update
sudo apt install libhiredis-dev
sudo apt install libyaml-cpp-dev
apt install nlohmann-json3-dev

#compile and run
g++ --version
make
make install

g++ -Wall -std=c++17 -I/usr/include/yaml-cpp -c Yaml.cpp -o Yaml.o
g++ Gredis.o Maria.o main.o Yaml.o -o main -lhiredis -lyaml-cpp -lmariadbclient

#verify
g++ Gredis.o Maria.o main.o Yaml.o -o main -lhiredis -lyaml-cpp -lmariadbclient -L/usr/lib/x86_64-linux-gnu

make run
make clean

