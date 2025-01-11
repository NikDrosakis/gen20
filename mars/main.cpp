#include <iostream>
#include <fstream>
#include "Maria.h"
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include "Yaml.h"
#include <thread>
#include <map>

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <manifest_file> <table>" << std::endl;
        return 1;
    }

    Yaml yamlHandler("localhost", "root", "n130177!", "gen_admin");
    std::string filename = argv[1];
    std::string table = argv[2];

    std::thread watcher(&Yaml::watchAndSyncManifest, &yamlHandler, filename, table);
    watcher.join();

    Maria db("gen_admin");

    if (db.connect()) {
        std::map<int, std::string> params_f = {{1, "1"}}; // Corrected params for db.f
        auto result = db.f("SELECT * FROM systems WHERE id = ?", params_f);
        if (!result.empty()) {
            for (const auto &pair : result) {
                std::cout << pair.first << ": " << pair.second << std::endl;
            }
        } else {
            std::cout << "Query failed or no result." << std::endl;
        }

        std::map<int, std::string> params_fa; // Corrected params for db.fa
        auto results = db.fa("SELECT * FROM systems", params_fa);
        for (const auto &row : results) {
            for (const auto &pair : row) {
                std::cout << pair.first << ": " << pair.second << " ";
            }
            std::cout << std::endl;
        }
    }

    return 0;
}