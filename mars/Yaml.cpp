#include "Yaml.h"
#include <mariadb/mysql.h>  // Use MariaDB-specific header

Yaml::Yaml(const std::string& dbHost, const std::string& dbUser, const std::string& dbPass, const std::string& dbName) {
    connectToDatabase(dbHost, dbUser, dbPass, dbName);
}

Yaml::~Yaml() {
    if (conn) {
        mysql_close(conn);  // MariaDB close connection
    }
}

void Yaml::connectToDatabase(const std::string& dbHost, const std::string& dbUser, const std::string& dbPass, const std::string& dbName) {
    conn = mysql_init(nullptr);  // MariaDB init function
    if (!conn) {
        throw std::runtime_error("MySQL initialization failed");
    }

    if (!mysql_real_connect(conn, dbHost.c_str(), dbUser.c_str(), dbPass.c_str(), dbName.c_str(), 0, nullptr, 0)) {
        throw std::runtime_error("Database connection failed: " + std::string(mysql_error(conn)));
    }
}

void Yaml::readYamlAndConvertToJson(const std::string& filename) {
    try {
        // Load the YAML file
        YAML::Node config = YAML::LoadFile(filename);

        // Convert YAML data to JSON
        nlohmann::json jsonData = nlohmann::json::object();

        for (auto it = config.begin(); it != config.end(); ++it) {
            std::string key = it->first.as<std::string>();

            // Check the type of the value and handle accordingly
            if (it->second.IsScalar()) {
                jsonData[key] = it->second.as<std::string>();
            } else if (it->second.IsSequence()) {
                // Handle sequence types (arrays)
                jsonData[key] = handleSequence(it->second);
            } else if (it->second.IsMap()) {
                // Handle map types (nested objects)
                jsonData[key] = handleMap(it->second);
            } else {
                // Default case, store as a string if unsure
                jsonData[key] = it->second.as<std::string>();
            }
        }

        // Print the resulting JSON
        std::cout << "Converted YAML to JSON:\n" << jsonData.dump(4) << std::endl;

    } catch (const YAML::Exception& e) {
        std::cerr << "Error reading YAML file: " << e.what() << std::endl;
    }
}

nlohmann::json Yaml::handleSequence(const YAML::Node& node) {
    nlohmann::json sequenceJson = nlohmann::json::array();
    for (const auto& item : node) {
        sequenceJson.push_back(item.as<std::string>());
    }
    return sequenceJson;
}

nlohmann::json Yaml::handleMap(const YAML::Node& node) {
    nlohmann::json mapJson = nlohmann::json::object();
    for (auto it = node.begin(); it != node.end(); ++it) {
        mapJson[it->first.as<std::string>()] = it->second.as<std::string>();
    }
    return mapJson;
}

void Yaml::watchAndSyncManifest(const std::string& filename, const std::string& tableName) {
    std::filesystem::path filePath = filename;
    auto lastWriteTime = std::filesystem::last_write_time(filePath);

    while (true) {
        auto currentWriteTime = std::filesystem::last_write_time(filePath);
        if (currentWriteTime != lastWriteTime) {
            std::cout << "File modified: " << filename << std::endl;
            YAML::Node yamlData = YAML::LoadFile(filename);
            syncWithDatabase(yamlData, tableName);
            lastWriteTime = currentWriteTime;
        }
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}

void Yaml::syncWithDatabase(const YAML::Node& yamlData, const std::string& tableName) {
    for (auto it = yamlData.begin(); it != yamlData.end(); ++it) {
        std::string key = it->first.as<std::string>();
        auto value = it->second;

        std::string query = "SELECT * FROM " + tableName + " WHERE name = '" + key + "'";
        if (mysql_query(conn, query.c_str())) {
            throw std::runtime_error("Query failed: " + std::string(mysql_error(conn)));
        }

        MYSQL_RES* result = mysql_store_result(conn);
        if (result && mysql_num_rows(result) > 0) {
            // UPDATE existing row
            std::string updateQuery = "UPDATE " + tableName + " SET ";
            for (auto subIt = value.begin(); subIt != value.end(); ++subIt) {
                updateQuery += subIt->first.as<std::string>() + " = '" + subIt->second.as<std::string>() + "', ";
            }
            updateQuery.pop_back();
            updateQuery.pop_back();
            updateQuery += " WHERE name = '" + key + "'";
            mysql_query(conn, updateQuery.c_str());
        } else {
            // INSERT new row
            std::string columns = "name";
            std::string values = "'" + key + "'";
            for (auto subIt = value.begin(); subIt != value.end(); ++subIt) {
                columns += ", " + subIt->first.as<std::string>();
                values += ", '" + subIt->second.as<std::string>() + "'";
            }
            std::string insertQuery = "INSERT INTO " + tableName + " (" + columns + ") VALUES (" + values + ")";
            mysql_query(conn, insertQuery.c_str());
        }

        mysql_free_result(result);
    }
}
