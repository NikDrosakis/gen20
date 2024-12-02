<?php
namespace Core;

use Ratchet\Client\WebSocket;
use Ratchet\Client\connect; // Ensure this is correctly imported
use React\Promise\Promise; // Import Promise if needed for handling
use Gredis;

trait GSocket{
// Use the GRedis trait for Redis functionality

    protected $socket; // WebSocket client instance
    protected $loop;   // Event loop instance

      // Connect to the WebSocket server
       public function connectToWebSocket($url) {
           connect($url)->then(
               function (WebSocket $ws) {
                   $this->socket = $ws;

                   // Handle messages received from the WebSocket
                   $ws->on('message', function($message) {
                       $this->handleWebSocketMessage($message);
                   });

                   // Handle disconnection
                   $ws->on('close', function() {
                       echo "WebSocket client disconnected\n"; // Example logging
                   });

                   // Subscribe to the Redis channel after WebSocket connection is established
                   $this->subscribe(['broadcast_channel'], function($redis, $channel, $message) {
                       echo "Received message from Redis channel '$channel': $message\n"; // Example logging
                       $this->sendMessage($message); // Send the Redis message to the WebSocket server
                   });
               },
               function ($e) {
                   echo "Could not connect: {$e->getMessage()}\n";
               }
           );
       }

      // Send a message to the WebSocket server
        public function sendMessage($message) {
            if ($this->socket) {
                $this->socket->send(json_encode($message));
            } else {
                throw new \Exception("WebSocket connection is not established.");
            }
        }

        // Handle incoming WebSocket messages
        protected function handleWebSocketMessage($message) {
            echo "Received WebSocket message: $message\n"; // Example logging
            // Add logic to handle the WebSocket message here
        }


    // Disconnect from the WebSocket server
    public function disconnect() {
        if ($this->socket) {
            $this->socket->close();
            echo "Disconnected from WebSocket server\n"; // Logging for disconnection
        }
    }
}
