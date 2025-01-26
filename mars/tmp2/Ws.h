#ifndef CORE_WS_H
#define CORE_WS_H

#include <string>
#include <functional>
#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_client.hpp>

class WebSocketClient {
public:
    WebSocketClient();
    WebSocketClient(std::string url);
    ~WebSocketClient();

    void connect();
    void sendMessage();
    void close();

    // Message handler
    void on_message(websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg);

    websocketpp::client<websocketpp::config::asio_client> ws_client;

private:
    std::string url_;
    websocketpp::connection_hdl connection_handle;
};

#endif