#include "Ws.h"
#include <iostream>
#include <thread>

Ws::Ws(net::io_context& io_context, const std::string& url)
    : url_(url), io_context_(io_context), ctx_(ssl::context::tlsv12_client),
      ws_(io_context_, ctx_) {  // Initialize ws_ with io_context_ and ctx_
    // Set up SSL context
    ctx_.set_verify_mode(ssl::verify_peer);
    ctx_.set_default_verify_paths();
}

Ws::~Ws() {
    close();
    std::cout << "Ws object destroyed." << std::endl;
}

void Ws::connect(std::function<void(bool)> callback) {
    try {
        // Existing connection logic...
        // After the connection is successful, allow sending messages.
        if (callback) callback(true);
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        if (callback) callback(false);
    }
}

void Ws::sendMessage(const std::string& message) {
    try {
        // Construct the JSON message
        json payload = {
            {"system", "Mars"},
            {"domaffect", "*"},
            {"type", "open"},
            {"verba", message},
            {"userid", "1"},
            {"to", "1"},
            {"cast", "one"}
        };

        // Log the JSON message
        std::string json_message = payload.dump();
        std::cout << "Sending JSON: " << json_message << std::endl;

        // Send the JSON message
        ws_.write(net::buffer(json_message));
    } catch (const std::exception& e) {
        std::cerr << "Send error: " << e.what() << std::endl;
    }
}

void Ws::setOnMessageHandler(std::function<void(const std::string&)> handler) {
    on_message_handler_ = handler;
}

void Ws::readMessage() {
    auto buffer = std::make_shared<beast::flat_buffer>();
    ws_.async_read(*buffer, [this, buffer](beast::error_code ec, std::size_t bytes_transferred) {
        if (!ec) {
            std::string message = beast::buffers_to_string(buffer->data());
            std::cout << "Received: " << message << std::endl;  // Log received messages
            if (on_message_handler_) {
                on_message_handler_(message);
            }
            // Continue reading messages
            readMessage();
        } else {
            std::cerr << "Read error: " << ec.message() << std::endl;
        }
    });
}
void Ws::close() {
    try {
        ws_.close(websocket::close_code::normal);
    } catch (const std::exception& e) {
        std::cerr << "Close error: " << e.what() << std::endl;
    }
}