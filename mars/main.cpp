#include <iostream>
#include <fstream>
#include "core/Maria.h"
#include "core/Cubo.h"
#include "core/FS.h"
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include "core/Yaml.h"
#include "core/Ws.h"
//#include "core/Gredis.h"
#include <thread>
#include <map>
//#include <hiredis/hiredis.h>
#include <string>
#include <vector>
#include <chrono>
#include <functional>
#include <boost/asio/io_context.hpp>
#include "core/server.h"

int main(int argc, char* argv[]) {

  RunServer();
    // Commented out the arguments section for now
    // if (argc < 3) {
    //     std::cerr << "Usage: " << argv[0] << " <manifest_file> <table>" << std::endl;
    //     return 1;
    // }

 // Example Use Gredis class
 /*
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
*/

    // Connect & send message to WebSocket (Ermis)

    try {
        // Create an io_context
        net::io_context ioc;

        // Create a WebSocket client
        Ws ws(ioc, "wss://vivalibro.com:3010/?userid=mars");

        // Set up the message handler
        ws.setOnMessageHandler([](const std::string& message) {
            std::cout << "Received: " << message << std::endl;
        });

        // Connect to the server
        ws.connect([](bool success) {
            if (success) {
                std::cout << "Connected to the server!" << std::endl;
            } else {
                std::cerr << "Failed to connect to the server!" << std::endl;
            }
        });

        // Send a message
        ws.sendMessage("PING");

        // Run the io_context in a separate thread
        std::thread ioc_thread([&ioc]() {
            ioc.run();
        });

        // Keep the main thread alive
        ioc_thread.join();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
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
        /*
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
        */
         // Binlog processing
                std::string binlogFile = "/var/log/mysql/mysql-bin.000001"; // Replace with your binlog file
                std::function<void(const std::string&)> binlogCallback = [&](const std::string& event) {
              //      std::cout << "Binlog Event: " << event << std::endl;
                    // Process the binlog event and write to the filesystem
                    // Example:
                    std::string fileContent = "Data from binlog: " + event;
                    fs.writeFile("/var/www/gs/manifest/first_binlog_output.txt", fileContent);
                };
                std::thread binlogThread([&]() { // Capture all by reference
                    maria.consumeBinlog(binlogFile, binlogCallback);
                });

        // Filesystem monitoring
        std::string watchDirectory = "/var/www/gs/gaia/cubos/test2/"; // Replace with your watch directory
       std::function<void(const std::string&)> fsCallback = [&](const std::string& event) {
           std::cout << "Filesystem Event: " << event << std::endl;

           // Extract file path from the event string
           size_t pos = event.find(": ");
           if (pos == std::string::npos) {
               std::cerr << "Invalid event format: " << event << std::endl;
               return;
           }
           std::string eventPath = event.substr(pos + 2);
           std::cout << "Extracted Event Path: " << eventPath << std::endl; // Log the extracted path

           // Specific setup.yaml logic
           if (eventPath == "setup.yml") {
                Cubo cubo("gen_vivalibrocom");
               if (!cubo.setupCubo("test")) {
                   std::cerr << "Failed to process setup for: test" << std::endl;
               } else {
                   std::cout << "Setup processed successfully for: test" << std::endl;
               }
           }
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