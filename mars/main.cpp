#include <iostream>
#include <fstream>
#include "core/Maria.h"
#include "core/FS.h"
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
#include <chrono>
#include <functional>

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
    Maria maria("gen_admin");
    mars::FS fs; // Declare fs using the namespace
    if (maria.connect()) {
        std::map<int, std::string> params_fa;
        auto results = maria.fa("SELECT * FROM systems", params_fa);

        for (const auto &row : results) {
            for (const auto &pair : row) {
                std::cout << pair.first << ": " << pair.second << " ";
            }
            std::cout << std::endl;
        }

        // Binlog processing
        std::string binlogFile = "/var/log/mysql/mysql-bin.000001"; // Replace with your binlog file
        std::function<void(const std::string&)> binlogCallback = [&](const std::string& event) {
            std::cout << "Binlog Event: " << event << std::endl;
            // Process the binlog event and write to the filesystem
            // Example:
            std::string fileContent = "Data from binlog: " + event;
            fs.writeFile("/tmp/binlog_output.txt", fileContent);
        };
        std::thread binlogThread([&]() { // Capture all by reference
            maria.consumeBinlog(binlogFile, binlogCallback);
        });

        // Filesystem monitoring
        std::string watchDirectory = "/tmp/watch_dir"; // Replace with your watch directory
        std::function<void(const std::string&)> fsCallback = [&](const std::string& event) {
            std::cout << "Filesystem Event: " << event << std::endl;
            // Process the filesystem event and update MariaDB
            // Example:
            std::string fileContent;
            fs.readFile("/tmp/watch_dir/some_file.txt", fileContent);
            std::string sql = "INSERT INTO your_table (data) VALUES ('" + fileContent + "')";
            maria.q(sql, {});
        };
        fs.monitorChanges(watchDirectory, fsCallback);

        // Keep main thread alive
        while (true) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

        binlogThread.join();
    }

    return 0;
}