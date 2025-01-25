#include "Cubo.h"

bool Cubo::setupCubo(const std::string& name) {
    try {
        std::string cuboDir = "/var/www/gs/gaia/cubos/" + name + "/";
        std::string setupPath = cuboDir + "setup.yaml";

        // Check if setup.yaml exists
        std::ifstream setupFile(setupPath);
        if (!setupFile.is_open()) {
            throw std::runtime_error("Setup file not found for cubo: " + name);
        }

        // Parse setup.yaml
        YAML::Node setup = YAML::LoadFile(setupPath);

        // Check if the main cubo key (e.g., test2_cubo) exists
        if (!setup[name]) {
            throw std::runtime_error("Invalid or missing cubo: " + name);
        }

        // Access the "mains" key inside the specific cubo (e.g., test2_cubo)
        YAML::Node cuboNode = setup[name];  // Get the cubo section (e.g., test2_cubo)
        YAML::Node mains = cuboNode["mains"]; // Access the "mains" key

        if (!mains || !mains.IsSequence()) {
            throw std::runtime_error("Invalid or missing mains data for cubo: " + name);
        }

        std::cout << "Mains for cubo " << name << ":" << std::endl;
        for (const auto& main : mains) {
            std::cout << " - " << main.as<std::string>() << std::endl;
        }

        // Access the "sql" key (even though it may be empty)
        YAML::Node sql = cuboNode["sql"];
        if (sql) {
            std::cout << "SQL for cubo " << name << ": " << sql.as<std::string>() << std::endl;
        } else {
            std::cout << "No SQL data provided for cubo " << name << "." << std::endl;
        }

        std::string publicdb = "gen_vivalibrocom"; // Your public database name
        std::string cuboName = name;

        // Step 1: Process SQL scripts
        if (setup["sql"]) {
            for (const auto& sqlFile : setup["sql"]) {
                std::string sqlFilePath = cuboDir + "sql/" + sqlFile.as<std::string>() + ".sql";
                std::ifstream sqlStream(sqlFilePath);
                if (sqlStream.is_open()) {
                    std::stringstream sqlBuffer;
                    sqlBuffer << sqlStream.rdbuf();

                    // Prepare parameters if needed, or use an empty map for no parameters
                    std::map<int, std::string> params;
                    maria.q(sqlBuffer.str(), params); // Use the q function here
                } else {
                    throw std::runtime_error("SQL file not found: " + sqlFilePath);
                }
            }
        }

        // Step 2: Insert cubo metadata into `maingrp`
        std::map<std::string, std::string> maingrpData = {
            {"cuboid", std::to_string(maria.lastInsertId())}, // Assuming you have a cubo ID
            {"name", cuboName},
            {"description", setup["description"] ? setup["description"].as<std::string>() : ""}
        };
        if (!maria.inse(publicdb + ".maingrp", maingrpData)) {
            throw std::runtime_error("Failed to insert into maingrp");
        }
        int insertedGrpId = maria.lastInsertId();

        // Step 3: Insert `mains` components into `main` table
        if (setup["mains"]) {
            for (const auto& main : setup["mains"]) {
                std::map<std::string, std::string> mainData = {
                    {"maingrpid", std::to_string(insertedGrpId)},
                    {"name", main.as<std::string>()}
                };
                if (!maria.inse(publicdb + ".main", mainData)) {
                    throw std::runtime_error("Failed to insert into main");
                }
                int insertedMainId = maria.lastInsertId();

                // Step 4: Insert into `maincubo` table
                std::map<std::string, std::string> mainCuboData = {
                    {"mainid", std::to_string(insertedMainId)},
                    {"area", "m"},
                    {"cuboid", std::to_string(insertedGrpId)},
                    {"name", cuboName}
                };
                if (!maria.inse(publicdb + ".maincubo", mainCuboData)) {
                    throw std::runtime_error("Failed to insert into maincubo");
                }
            }
        }

        // Step 5: Insert links for admin.php if it exists
        std::string adminFilePath = cuboDir + "admin.php";
        std::ifstream adminFile(adminFilePath);
        if (adminFile.is_open()) {
            std::map<std::string, std::string> linksData = {
                {"title", cuboName},
                {"page", "/cubos/" + name + "/admin.php"}
            };
            if (!maria.inse(publicdb + ".links", linksData)) {
                throw std::runtime_error("Failed to insert into links");
            }
        }

        return true; // Operation successful
    } catch (const std::exception& e) {
        std::cerr << "Error in setupCubo: " << e.what() << std::endl;
        return false;
    }
}
