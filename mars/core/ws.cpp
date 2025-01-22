#include "core/ws.h"
#include "Rethink.h" // Include RethinkDB header
#include <iostream>
#include <cstdlib>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

typedef websocketpp::client<websocketpp::config::asio_client> client;

WebSocketClient::WebSocketClient() : url_("ws://localhost:8080") {
    rethink_ = new MyRethinkDB("localhost", 28015, "chat", "messages");
    if (!rethink_->connect()) {
        std::cerr << "Failed to connect to RethinkDB." << std::endl;
        exit(1);
    }
    changefeed_cursor_ = rethink_->startChangefeed();
    if (!changefeed_cursor_) {
        std::cerr << "Failed to start changefeed." << std::endl;
        exit(1);
    }
}

WebSocketClient::WebSocketClient(std::string url) : url_(url) {
    rethink_ = new MyRethinkDB("localhost", 28015, "chat", "messages");
    if (!rethink_->connect()) {
        std::cerr << "Failed to connect to RethinkDB." << std::endl;
        exit(1);
    }
    changefeed_cursor_ = rethink_->startChangefeed();
    if (!changefeed_cursor_) {
        std::cerr << "Failed to start changefeed." << std::endl;
        exit(1);
    }
}

WebSocketClient::~WebSocketClient() {
    if(rethink_){
        delete rethink_;
    }
    if(changefeed_cursor_){
        rdb_cursor_close(changefeed_cursor_);
    }
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
    // Start the changefeed listener
    startChangefeedListener();
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
        // Save the message to RethinkDB
        rethink_->upsertMessage("1", json_message);
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

void WebSocketClient::startChangefeedListener() {
    std::thread([this]() {
        rdb_datum_t* datum;
        if (!rethink_) return;
        while ((datum = rdb_cursor_next(changefeed_cursor_))) {
            if (datum) {
                 std::cout << "Received changefeed data: " << rdb_string(datum) << std::endl;
                // Send the message to all connected clients
                // ... You'll need to add logic to track connected clients and send messages to them.
                rdb_datum_free(datum);
            }
        }
    }).detach();
}