#include <iostream>
#include <fstream>
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include "Yaml.h"

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <manifest_file>" << std::endl;
        return 1;
    }

    Yaml yamlHandler("localhost", "root", "n130177!", "gen_admin");
    std::string filename = argv[1];
    std::string table = argv[2];

    std::thread watcher(&Yaml::watchAndSyncManifest, &yamlHandler, filename, table);
    watcher.join();

    return 0;
}
