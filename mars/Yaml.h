#ifndef YAML_H
#define YAML_H

#include <mariadb/mysql.h>
#include <string>
#include <iostream>
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include <filesystem>
#include <stdexcept>
#include <chrono>
#include <thread>

class Yaml {
public:
    Yaml(const std::string& dbHost, const std::string& dbUser, const std::string& dbPass, const std::string& dbName);
    ~Yaml();

    void readYamlAndConvertToJson(const std::string& filename);
    void watchAndSyncManifest(const std::string& filename, const std::string& tableName);

private:
    MYSQL* conn;

    void connectToDatabase(const std::string& dbHost, const std::string& dbUser, const std::string& dbPass, const std::string& dbName);
    void syncWithDatabase(const YAML::Node& yamlData, const std::string& tableName);

    // Added function declarations
    nlohmann::json handleSequence(const YAML::Node& node);
    nlohmann::json handleMap(const YAML::Node& node);

    std::string getSqlType(const YAML::Node& node);
};

#endif
