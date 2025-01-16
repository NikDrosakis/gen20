<?php
namespace Core;
use Redis;

class Gredis extends Redis {
 public $redis_running = false;
     public function __construct(string $database = ''){
        if(class_exists('Redis') && basename(getcwd()) !== 'crons') {
            parent::__construct();
            parent::pconnect('0.0.0.0', 6379);
            parent::auth("yjF1f7uiHttcp" ?? '');
            parent::select($database ?? 1);
            }
        }
         public function set(string $key, mixed $fetch, mixed $options = null): Redis|string|bool{
            if (!$fetch) {
                return false;
            } else {
                if (is_int($fetch)) {
                    parent::set($key, $fetch,$options);
                } elseif (is_array($fetch)) {
                    $fetch = json_encode($fetch, JSON_UNESCAPED_UNICODE);
                    parent::setex($key, 1000, $fetch);
                } elseif (is_json($fetch)) {
                    parent::set($key, $fetch,$options);
                } else {
                    parent::set($key, $fetch,$options);
                }
                parent::persist($key);
            }
        }

    public function append(string $key, mixed $value): Redis|int|false {
        $state = false;
        $res = $this->exists($key);
        if ($res) {
            $state = parent::append($key, $value); // Assign the result directly
        } else {
            if (parent::set($key, $value)) {
                $state = $this; // Return $this for method chaining
            }
        }
        return $state;
    }
    /*
        $service is Redis
        read from cache
        */
        public function  get($key, $format = 'arraystring'):Redis|array|false{
            $res = $this->exists($key);
            $type = parent::object("encoding", $key);
            if ($res) {
                $get = parent::get($key);
                if ($type == 'int') {
                    return (int)$get;
                } elseif (is_json($get)) {
                    return json_decode($get, true);
                } else {
                    return !$get ? false : $get;
                }
            } else {
                return false;
            }
        }

        public function incr(string $key, int $by = 1): Redis|int|false{
            parent::incr($field,$by);
        }

        public function decr(string $key, int $by = 1): Redis|int|false{
            parent::decr($field,$by);
        }

        //update saving keys to list with lrange
        public function keys($criteria):Redis|array{
            return parent::keys($criteria);
        }

        public function liste():?array {
    		$args= func_get_args();
    		$arg0=$args[0];
            unset($args[0]);
            foreach($args as $arg) {
    		  $this->sadd($arg0,$arg);
    		}
    	}

    // Subscribe to the Redis Pub/Sub channel
     public function subscribe(array $channels, callable $callback): bool {
           return parent::subscribe($channels, function ($redis, $channel, $message) use ($callback) {
               // Call the custom handleMessage method with the received message
               $this->handleMessage($message);
               // Call the provided callback if needed
               if ($callback) {
                   $callback($redis, $channel, $message);
               }
           });
       }

       // Custom message handling logic
       protected function handleMessage($message) {
           // Process the incoming message here
           echo "Received message: $message\n"; // Example logging
       }
}
