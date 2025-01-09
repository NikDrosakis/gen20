#include <iostream>
#include <fstream>
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>

void readYamlAndConvertToJson(const std::string& filename) {
    try {
        // Load the YAML file
        YAML::Node config = YAML::LoadFile(filename);

        if (config.IsNull()) {
            std::cerr << "Error: Could not read YAML file: " << filename << std::endl;
            return;
        }

        // Check for 'actions' key
        if (!config["actions"]) {
            std::cerr << "Error: 'actions' key not found in YAML file" << std::endl;
            return;
        }

        // Prepare a JSON array to hold the actions
        nlohmann::json actions_json = nlohmann::json::array();

        // Loop through the actions in the YAML file and convert to JSON
        for (const auto& action : config["actions"]) {
            nlohmann::json action_json = {
                {"id", action["id"].as<int>()},
                {"name", action["name"].as<std::string>()},
                {"type", action["type"].as<std::string>()},
                {"endpoint", action["endpoint"].as<std::string>()},
                {"exe_mode", action["exe_mode"].as<std::string>()},
                {"systemsid", action["systemsid"].as<int>()},
                {"actiongrpid", action["actiongrpid"].as<int>()},
                {"schedule", action["schedule"].as<std::string>()},
                {"status", action["status"].as<std::string>()}
            };
            actions_json.push_back(action_json);
        }

        // Output the JSON to the console
        std::cout << actions_json.dump(4) << std::endl; // Pretty print with 4 spaces

    } catch (const std::exception& e) {
        std::cerr << "Error reading YAML file: " << e.what() << std::endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Error: Please provide a YAML file base name as an argument" << std::endl;
        return 1;
    }
    // Get the filename from the command-line argument
    std::string filename = argv[1] + std::string(".yml");
    // Call the function to read and convert the YAML file to JSON
    readYamlAndConvertToJson(filename);

    return 0;
}