#include <iostream>
#include <fstream>
#include "core/Maria.h"
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include "core/Yaml.h"
#include "core/ws.h"
#include "core/Gredis.h"
#include <thread>
#include <map>
#include <hiredis/hiredis.h>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
    // Commented out the arguments section for now
    // if (argc < 3) {
    //     std::cerr << "Usage: " << argv[0] << " <manifest_file> <table>" << std::endl;
    //     return 1;
    // }

 // Example Use Gredis class
    Gredis gredis;
    std::cout << "Setting keys in Redis..." << std::endl;
    gredis.set("key1", "value1");
    gredis.set("key2", "value2");
    gredis.set("key3", "value3");

    // Retrieve and print all keys
    std::vector<std::string> keys = gredis.keys();
    std::cout << "Keys in Redis:" << std::endl;
    for (const auto &key : keys) {
        std::cout << key << std::endl;
    }
    gredis.close();

    // Connect & send message to WebSocket (Ermis)
    try {
        WebSocketClient ws_client;
        std::cout << "Connecting to WebSocket..." << std::endl;
        ws_client.connect();
        std::cout << "Sending WebSocket message..." << std::endl;
        ws_client.sendMessage();

        // Give time for messages to send/receive
        std::this_thread::sleep_for(std::chrono::seconds(1));
        std::cout << "Closing WebSocket..." << std::endl;
        ws_client.close();
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << std::endl;
    }

    // Commented out YAML handling code
    // std::string filename = argv[1];
    // std::string table = argv[2];
    // Yaml yamlHandler("localhost", "root", "n130177!", "gen_admin");
    // std::thread watcher(&Yaml::watchAndSyncManifest, &yamlHandler, filename, table);
    // watcher.join();

    // Use MariaDB (example query)
    Maria db("gen_admin");
    if (db.connect()) {
        std::map<int, std::string> params_fa;
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
