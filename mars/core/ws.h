#ifndef WS_H
#define WS_H

#include <string>
#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_no_tls_client.hpp>

class WebSocketClient {
private:
    websocketpp::client<websocketpp::config::asio_client> client;
    websocketpp::connection_hdl connection_handle;

public:
    WebSocketClient();
    ~WebSocketClient();

    void connect();
    void sendMessage();
    void close();
};

#endif // WS_H
