#ifndef CUBO_H
#define CUBO_H

#include <string>
#include <map>
#include <fstream>
#include <sstream>
#include <iostream>
#include <stdexcept>
#include <yaml-cpp/yaml.h>
#include "Maria.h" // Include Maria.h for database interaction

class Cubo {
private:
    Maria maria;
public:
    // Constructor that accepts a database name
    Cubo(const std::string& dbname) : maria(dbname) {
        // Additional initialization if needed

    }
     bool setupCubo(const std::string& name);
};

#endif // CUBO_H
