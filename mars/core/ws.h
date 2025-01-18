#ifndef WS_H
#define WS_H

#include <string>
#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_no_tls_client.hpp>

class WebSocketClient {
private:
    websocketpp::client<websocketpp::config::asio_client> ws_client;
    websocketpp::connection_hdl connection_handle;
    std::string server_url;

public:
    WebSocketClient();  // Default constructor
    WebSocketClient(std::string url);  // Parameterized constructor
    ~WebSocketClient();  // Destructor

    void connect();
    void sendMessage();
    void close();
    void on_message(websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg);
};

#endif // WS_H
