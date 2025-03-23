#include "Ws.h"

Ws::Ws(net::io_context& io_context, const std::string& url)
    : url_(url), io_context_(io_context), ctx_(ssl::context::tlsv12_client),
      ws_(boost::asio::make_strand(io_context_), ctx_),  // Use boost::asio::make_strand
      resolver_(boost::asio::make_strand(io_context_)) {  // Initialize resolver_ with a strand
    // Set up SSL context
    ctx_.set_verify_mode(ssl::verify_peer);
    ctx_.set_default_verify_paths();
}

Ws::~Ws() {
    close();
    std::cout << "Ws object destroyed." << std::endl;
}

void Ws::connect(std::function<void(bool)> callback) {
    try {
        // Parse the URL
        std::string host = "vivalibro.com";  // Extract host from URL
        std::string port = "3010";           // Extract port from URL
        std::string path = "/?userid=mars"; // Extract path from URL

        // Resolve the host and port
        resolver_.async_resolve(host, port, [this, host, path, callback](beast::error_code ec, tcp::resolver::results_type results) {
            if (ec) {
                std::cerr << "Resolve error: " << ec.message() << std::endl;
                if (callback) callback(false);
                return;
            }

            // Attempt to connect to the first resolved endpoint
            beast::get_lowest_layer(ws_).async_connect(
                *results.begin(),  // Connect to the first endpoint in the results
                [this, host, path, callback](beast::error_code ec) {  // Correct handler signature
                    if (ec) {
                        std::cerr << "Connect error: " << ec.message() << std::endl;
                        if (callback) callback(false);
                        return;
                    }

                    // Perform the SSL handshake
                    ws_.next_layer().async_handshake(ssl::stream_base::client, [this, host, path, callback](beast::error_code ec) {
                        if (ec) {
                            std::cerr << "SSL handshake error: " << ec.message() << std::endl;
                            if (callback) callback(false);
                            return;
                        }

                        // Perform the WebSocket handshake
                        ws_.async_handshake(host, path, [this, callback](beast::error_code ec) {
                            if (ec) {
                                std::cerr << "WebSocket handshake error: " << ec.message() << std::endl;
                                if (callback) callback(false);
                                return;
                            }

                            // Connection successful
                            if (callback) callback(true);

                            // Start reading messages
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
        // Construct the JSON message
        json payload = {
            {"system", "Mars"},
            {"domaffect", "*"},
            {"type", "open"},
            {"verba", message},
            {"userid", "1"},
            {"to", "1"},
            {"cast", "one"}
        };

        // Log the JSON message
        std::string json_message = payload.dump();
        std::cout << "Sending JSON: " << json_message << std::endl;

        // Send the JSON message asynchronously
        ws_.async_write(
            net::buffer(json_message),
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
    ws_.async_read(*buffer, [this, buffer](beast::error_code ec, std::size_t bytes_transferred) {
        if (!ec) {
            std::string message = beast::buffers_to_string(buffer->data());
            std::cout << "Received: " << message << std::endl;  // Log received messages
            if (on_message_handler_) {
                on_message_handler_(message);
            }
            // Continue reading messages
            readMessage();
        } else {
            std::cerr << "Read error: " << ec.message() << std::endl;
        }
    });
}

void Ws::close(std::function<void()> callback) {
    try {
        ws_.async_close(websocket::close_code::normal, [callback](beast::error_code ec) {
            if (ec) {
                std::cerr << "Close error: " << ec.message() << std::endl;
            }
            if (callback) callback();
        });
    } catch (const std::exception& e) {
        std::cerr << "Close error: " << e.what() << std::endl;
    }
}