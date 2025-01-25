#ifndef CORE_WS_H
#define CORE_WS_H

#include <string>
#include <functional>
#include "Rethink.h"
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
    void on_message(websocketpp::connection_hdl hdl, websocketpp::client<websocketpp::config::asio_client>::message_ptr msg);

private:
    std::string url_;
    MyRethinkDB* rethink_;
    rdb_cursor_t* changefeed_cursor_;
    void startChangefeedListener();
};

#endif