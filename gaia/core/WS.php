<?php
namespace Core;

use Ratchet\Client\WebSocket;
use Ratchet\Client\connect;
use React\EventLoop\Loop;
use React\EventLoop\LoopInterface;

trait WS
{
    // Use the GRedis trait for Redis capabilities
    protected $socket_url = "wss://vivalibro.com:3010/?userid=gaia";
    protected $socket = null; // WebSocket client instance
    protected $loop = null; // Event loop instance
    protected $connectionPromise = null;

    // Connect to the WebSocket server
    public function connectToWebSocket(): void
       {
           // Do not create a new loop if there is one already
           if (!$this->loop) {
              $this->loop = \React\EventLoop\Loop::get();
           }
         if($this->connectionPromise)
             return;

          $self = $this; // Capture $this in a variable
          $this->connectionPromise = new \React\Promise\Promise(function($resolve, $reject) use ($self) {
                connect($self->url, [], $self->loop)->then(
                   function (WebSocket $ws) use ($resolve, $self) {
                      $self->socket = $ws;
                       // Handle messages received from the WebSocket
                        $ws->on('message', function ($message) use ($self) {
                           $self->handleWebSocketMessage($message);
                       });
                         // Handle disconnection
                       $ws->on('close', function () use ($self) {
                           echo "WebSocket client disconnected\n"; // Example logging
                           $self->socket = null;
                           $self->connectionPromise = null;
                         });
                        $resolve();
                   },
                   function (\Exception $e) use ($reject, $self){
                       echo "Could not connect: {$e->getMessage()}\n";
                       $reject($e);
                        $self->socket = null;
                         $self->connectionPromise = null;
                   }
               );
            });

           if(!$this->loop->isRuning())
             $this->loop->run();
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
    public function disconnect()
    {
        if ($this->socket) {
            $this->socket->close();
             $this->socket = null;
            echo "Disconnected from WebSocket server\n"; // Logging for disconnection
        }
    }
}