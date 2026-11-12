#include "Ws.h"
#include <iostream>
#include <string>

Ws::Ws(net::io_context& io_context, const std::string& url)
    : url_(url), io_context_(io_context), ctx_(ssl::context::tlsv12_client),
      ws_(boost::asio::make_strand(io_context_), ctx_),
      resolver_(boost::asio::make_strand(io_context_)) {
    ctx_.set_verify_mode(ssl::verify_peer);
    ctx_.set_default_verify_paths();
}

Ws::~Ws() {
    close();
    std::cout << "Ws object destroyed." << std::endl;
}

void Ws::connect(std::function<void(bool)> callback) {
    try {
        std::string rest = url_;
        bool is_secure = false;

        if (rest.rfind("wss://", 0) == 0) {
            rest = rest.substr(6);
            is_secure = true;
        } else if (rest.rfind("ws://", 0) == 0) {
            rest = rest.substr(5);
            is_secure = false;
        } else {
            std::cerr << "Invalid URL scheme: " << url_ << std::endl;
            if (callback) callback(false);
            return;
        }

        std::string host, path, port;

        auto slash = rest.find('/');
        if (slash == std::string::npos) {
            host = rest;
            path = "/";
        } else {
            host = rest.substr(0, slash);
            path = rest.substr(slash);
        }

        auto colon = host.find(':');
        if (colon != std::string::npos) {
            port = host.substr(colon + 1);
            host = host.substr(0, colon);
        } else {
            port = is_secure ? "443" : "80";
        }

        std::cout << "Connecting to " << (is_secure ? "wss" : "ws")
                  << "://" << host << ":" << port << path << std::endl;

        resolver_.async_resolve(host, port,
            [this, host, path, callback](beast::error_code ec,
                                         tcp::resolver::results_type results) {
                if (ec) {
                    std::cerr << "Resolve error: " << ec.message() << std::endl;
                    if (callback) callback(false);
                    return;
                }

                beast::get_lowest_layer(ws_).async_connect(
                    *results.begin(),
                    [this, host, path, callback](beast::error_code ec) {
                        if (ec) {
                            std::cerr << "Connect error: " << ec.message() << std::endl;
                            if (callback) callback(false);
                            return;
                        }

                        ws_.next_layer().async_handshake(
                            ssl::stream_base::client,
                            [this, host, path, callback](beast::error_code ec) {
                                if (ec) {
                                    std::cerr << "SSL handshake error: " << ec.message() << std::endl;
                                    if (callback) callback(false);
                                    return;
                                }

                                ws_.async_handshake(host, path,
                                    [this, callback](beast::error_code ec) {
                                        if (ec) {
                                            std::cerr << "WebSocket handshake error: " << ec.message() << std::endl;
                                            if (callback) callback(false);
                                            return;
                                        }
                                        if (callback) callback(true);
                                        readMessage();
                                    });
                            });
                    });
            });
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        if (callback) callback(false);
    }
}

void Ws::sendMessage(const std::string& message) {
    if (!ws_.is_open()) {
        std::cerr << "WebSocket is not open!" << std::endl;
        return;
    }

    try {
        std::cout << "Sending: " << message << std::endl;
        ws_.async_write(
            net::buffer(message),
            [this](beast::error_code ec, std::size_t) {
                if (ec) {
                    std::cerr << "Send error: " << ec.message() << std::endl;
                }
            });
    } catch (const std::exception& e) {
        std::cerr << "Send error: " << e.what() << std::endl;
    }
}

void Ws::setOnMessageHandler(std::function<void(const std::string&)> handler) {
    on_message_handler_ = handler;
}

void Ws::readMessage() {
    auto buffer = std::make_shared<beast::flat_buffer>();
    ws_.async_read(*buffer,
        [this, buffer](beast::error_code ec, std::size_t) {
            if (!ec) {
                std::string message = beast::buffers_to_string(buffer->data());
                std::cout << "Received: " << message << std::endl;
                if (on_message_handler_) {
                    on_message_handler_(message);
                }
                readMessage();
            } else {
                std::cerr << "Read error: " << ec.message() << std::endl;
                if (ec == websocket::error::closed) {
                    std::cout << "WebSocket closed by server" << std::endl;
                }
            }
        });
}

void Ws::close(std::function<void()> callback) {
    try {
        if (ws_.is_open()) {
            ws_.async_close(websocket::close_code::normal,
                [callback](beast::error_code ec) {
                    if (ec) {
                        std::cerr << "Close error: " << ec.message() << std::endl;
                    }
                    if (callback) callback();
                });
        } else {
            if (callback) callback();
        }
    } catch (const std::exception& e) {
        std::cerr << "Close error: " << e.what() << std::endl;
    }
}
