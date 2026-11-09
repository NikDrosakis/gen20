#include <iostream>
#include <fstream>
#include "Maria.h"
#include <yaml-cpp/yaml.h>
#include <nlohmann/json.hpp>
#include "Yaml.h"
#include "Ws.h"
#include <thread>
#include <map>
#include <string>
#include <vector>
#include <chrono>
#include <functional>
#include <boost/asio/io_context.hpp>

// === CUBOS:START === (auto-generated)
#include "cubos/aggregator.h"
// === CUBOS:END ===

int main(int argc, char* argv[]) {
    // === CUBOS:START === (auto-generated)
    // Register cubos (πριν το WS/Maria — γρήγορο)
    cubos::register_all();
    // === CUBOS:END ===

    // WS to ermis
    try {
        net::io_context ioc;
        Ws ws(ioc, "wss://gen20.get:3010/?userid=mars");

        ws.setOnMessageHandler([](const std::string& message) {
            std::cout << "Received: " << message << std::endl;
        });

        ws.connect([&ws](bool success) {
            if (success) {
                std::cout << "Connected to the server!" << std::endl;
                ws.sendMessage("Mars pings");
            } else {
                std::cerr << "Failed to connect to the server!" << std::endl;
            }
        });

        std::thread ioc_thread([&ioc]() {
            ioc.run();
        });

        ioc_thread.join();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    // Maria
    Maria maria("gen_admin");
    if (maria.connect()) {
        std::map<int, std::string> params_fa;
        auto results = maria.fa("SELECT * FROM systems", params_fa);
        // ...
    }

    return 0;
}