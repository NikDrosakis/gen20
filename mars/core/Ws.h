#ifndef CORE_WS_H
#define CORE_WS_H

#include <string>
#include <functional>
#include <nlohmann/json.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <boost/asio/ssl.hpp>
#include <boost/asio/ip/tcp.hpp>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = net::ssl;
using tcp = net::ip::tcp;
using json = nlohmann::json;

class Ws {
private:
    std::string url_;
    net::io_context& io_context_;
    ssl::context ctx_;
    websocket::stream<ssl::stream<tcp::socket>> ws_;
    std::function<void(const std::string&)> on_message_handler_;  // Add this line

    void readMessage();

public:
    Ws(net::io_context& io_context, const std::string& url = "wss://vivalibro.com:3010/?userid=mars");
    ~Ws();

    void connect(std::function<void(bool)> callback);
    void sendMessage(const std::string& message);
    void setOnMessageHandler(std::function<void(const std::string&)> handler);
    void close();
};

#endif