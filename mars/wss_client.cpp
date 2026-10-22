#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <boost/asio/ssl.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <iostream>
#include <string>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = net::ssl;
using tcp = net::ip::tcp;

int main() {
    try {
        // The io_context is required for all I/O
        net::io_context ioc;

        // The SSL context is required for TLS
        ssl::context ctx(ssl::context::tlsv12_client);

        // Verify the server certificate
        ctx.set_verify_mode(ssl::verify_peer);
        ctx.set_default_verify_paths();

        // Create a WebSocket stream with SSL
        websocket::stream<ssl::stream<tcp::socket>> ws(ioc, ctx);

        // Resolve the server address
        std::string host = "vivalibro.com";
        std::string port = "3010";
        tcp::resolver resolver(ioc);
        auto const results = resolver.resolve(host, port);

        // Connect to the server
        net::connect(ws.next_layer().next_layer(), results.begin(), results.end());

        // Perform the SSL handshake
        ws.next_layer().handshake(ssl::stream_base::client);

        // Perform the WebSocket handshake
        ws.handshake(host, "/?userid=mars");

        // Send a message
        std::string message = R"({"system": "Mars", "domaffect": "*", "type": "open", "verba": "PING", "userid": "1", "to": "1", "cast": "one"})";
        ws.write(net::buffer(message));

        // Receive a message
        beast::flat_buffer buffer;
        ws.read(buffer);
        std::cout << "Received: " << beast::make_printable(buffer.data()) << std::endl;

        // Close the WebSocket connection
        ws.close(websocket::close_code::normal);
    } catch (std::exception const& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}