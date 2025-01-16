#include "ws.h"
#include <iostream>
#include <cstdlib>
#include <nlohmann/json.hpp>

WebSocketClient::WebSocketClient() {
    // Default constructor initializes with default URL
    server_url = "wss://vivalibro.com:3010/?userid=god";
    ws_client.init_asio();
    ws_client.set_message_handler([this](websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg) {
        on_message(hdl, msg);
    });
}

WebSocketClient::WebSocketClient(std::string url) {
    // Parameterized constructor allows setting custom URL
    server_url = url;
    ws_client.init_asio();
    ws_client.set_message_handler([this](websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg) {
        on_message(hdl, msg);
    });
}

WebSocketClient::~WebSocketClient() {
    // Destructor does any necessary cleanup (if any)
}

void WebSocketClient::connect() {
    websocketpp::uri uri(server_url);
    websocketpp::lib::error_code ec;
    auto con = ws_client.get_connection(uri.str(), ec);

    if (ec) {
        std::cerr << "Error connecting to WebSocket: " << ec.message() << std::endl;
        exit(1);
    }

    connection_handle = con->get_handle();
    ws_client.connect(con);
}

void WebSocketClient::sendMessage() {
    // Create message structure
    nlohmann::json message;
    message["system"] = "Mars";
    message["domaffect"] = "*";
    message["type"] = "open";
    message["verba"] = "PING";
    message["userid"] = "1";
    message["to"] = "1";
    message["cast"] = "one";

    // Convert to JSON string
    std::string json_message = message.dump();

    // Send the message
    try {
        ws_client.send(connection_handle, json_message, websocketpp::frame::opcode::text);
        std::cout << "Sent message: " << json_message << std::endl;
    } catch (websocketpp::exception const& e) {
        std::cerr << "Send error: " << e.what() << std::endl;
    }
}

void WebSocketClient::close() {
    ws_client.close(connection_handle, websocketpp::close::status::normal, "Normal closure");
}

void WebSocketClient::on_message(websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg) {
    std::cout << "Received message: " << msg->get_payload() << std::endl;
}
