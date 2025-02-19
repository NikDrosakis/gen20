#ifndef WS_H
#define WS_H

#include <boost/beast/core.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ssl/stream.hpp>
#include <boost/asio/strand.hpp>
#include <nlohmann/json.hpp>
#include <iostream>
#include <functional>

namespace net = boost::asio;
namespace beast = boost::beast;
namespace ssl = net::ssl;
namespace websocket = beast::websocket;
using tcp = net::ip::tcp;
using json = nlohmann::json;

class Ws {
public:
    Ws(net::io_context& io_context, const std::string& url);
    ~Ws();

    void connect(std::function<void(bool)> callback);
    void sendMessage(const std::string& message);
    void setOnMessageHandler(std::function<void(const std::string&)> handler);
    void close(std::function<void()> callback = nullptr);

private:
    void readMessage();

    std::string url_;
    net::io_context& io_context_;
    ssl::context ctx_;
    websocket::stream<beast::ssl_stream<tcp::socket>> ws_;
    tcp::resolver resolver_;
    std::function<void(const std::string&)> on_message_handler_;
};

#endif // WS_H