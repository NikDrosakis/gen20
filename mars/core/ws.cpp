#include <iostream>
#include <string>
#include <map>
#include <json/json.h>
#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_no_tls_client.hpp>
#include <websocketpp/common/thread.hpp>
#include <cstdlib>

class WebSocketClient {
private:
    typedef websocketpp::client<websocketpp::config::asio_client> client;
    typedef websocketpp::config::asio_client::message_type::ptr message_ptr;

    client ws_client;
    websocketpp::connection_hdl hdl;
    std::string server_url;

public:
    WebSocketClient(std::string url = "wss://vivalibro.com:3010/?userid=god") {
        server_url = url;

        // Initialize WebSocket client
        ws_client.init_asio();
        ws_client.set_message_handler([this](websocketpp::connection_hdl hdl, message_ptr msg) {
            this->on_message(hdl, msg);
        });
    }

    // Connect to WebSocket server
    void connect() {
        websocketpp::uri uri(server_url);
        websocketpp::lib::error_code ec;
        auto con = ws_client.get_connection(uri.str(), ec);

        if (ec) {
            std::cerr << "Error connecting to WebSocket: " << ec.message() << std::endl;
            exit(1);
        }

        hdl = con->get_handle();
        ws_client.connect(con);
    }

    // Send a structured message via WebSocket
    void sendMessage() {
        // Create message structure
        Json::Value message;
        message["system"] = "Mars";
        message["domaffect"] = "*";
        message["type"] = "open";
        message["verba"] = "PING";
        message["userid"] = "1";
        message["to"] = "1";
        message["cast"] = "one";

        // Convert to JSON string
        Json::StreamWriterBuilder writer;
        std::string json_message = Json::writeString(writer, message);

        // Send the message
        try {
            ws_client.send(hdl, json_message, websocketpp::frame::opcode::text);
            std::cout << "Sent message: " << json_message << std::endl;
        } catch (websocketpp::exception const& e) {
            std::cerr << "Send error: " << e.what() << std::endl;
        }
    }

    // Close the WebSocket connection gracefully
    void close() {
        ws_client.close(hdl, websocketpp::close::status::normal, "Normal closure");
    }

private:
    void on_message(websocketpp::connection_hdl hdl, message_ptr msg) {
        std::cout << "Received message: " << msg->get_payload() << std::endl;
    }
};
