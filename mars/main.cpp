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
    cubos::register_all();
    // === CUBOS:END ===

    // WS to god
    try {
        net::io_context ioc;
        Ws ws(ioc, "wss://gen20.net/god/v1/messaging/ws?userid=mars%3A1");

        ws.setOnMessageHandler([](const std::string& message) {
            std::cout << "Received: " << message << std::endl;

            try {
                auto j = nlohmann::json::parse(message);
                std::string type = j.value("type", "");
                std::string uid = j.value("userid", j.value("uid", ""));
                std::string text = j.value("c", j.value("msg", ""));

                if (type == "message") {
                    std::cout << "Message from " << uid << ": " << text << std::endl;
                }
            } catch (const std::exception& e) {
                std::cerr << "JSON parse error: " << e.what() << std::endl;
            }
        });

        ws.connect([&ws](bool success) {
            if (success) {
                std::cout << "Connected to GOD!" << std::endl;

                // Στείλε "online" — ίδιο format με kronos/sol
                nlohmann::json hello = {
                    {"system", "mars"},
                    {"type", "message"},
                    {"cid", "god:1-mars:1"},
                    {"userid", "mars:1"},
                    {"to", "god:1"},
                    {"cast", "one"},
                    {"c", "mars online"},
                    {"timestamp", std::time(nullptr)}
                };

                ws.sendMessage(hello.dump());
                std::cout << "Sent: " << hello.dump() << std::endl;
            } else {
                std::cerr << "Failed to connect to GOD!" << std::endl;
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
  //  Maria maria("gen_admin");
   // if (maria.connect()) {
     //   std::map<int, std::string> params_fa;
       // auto results = maria.fa("SELECT * FROM systems", params_fa);
   // }

    return 0;
}