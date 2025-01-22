#!/bin/bash
sudo apt install build-essential
sudo apt install libmariadb-dev
sudo apt install libmariadb3
sudo apt update
sudo apt install libhiredis-dev
sudo apt install libyaml-cpp-dev
sudo apt-get install libwebsocketpp-dev
sudo apt-get install libboost-all-dev
apt install nlohmann-json3-dev

#compile and run
g++ --version
make
make install

g++ -Wall -std=c++17 -I/usr/include/yaml-cpp -c Yaml.cpp -o Yaml.o
g++ Gredis.o Maria.o main.o Yaml.o -o main -lhiredis -lyaml-cpp -lmariadbclient

#verify
g++ Gredis.o Maria.o main.o Yaml.o -o main -lhiredis -lyaml-cpp -lmariadbclient -L/usr/lib/x86_64-linux-gnu

#rethink
sudo apt install librethinkdb-dev libboost-all-dev libprotobuf-dev protobuf-compiler libssl-dev
git clone https://github.com/AtnNn/librethinkdbxx.git
cd librethinkdbxx
mkdir build
cd build
sudo apt install git cmake g++ make libboost-all-dev libprotobuf-dev protobuf-compiler libssl-dev


make run
make clean

