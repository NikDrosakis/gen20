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

            // Check if RediSearch is loaded (you can move this check elsewhere if preferred)
            $modules = $this->rawCommand('MODULE', 'LIST');
            $redisearchLoaded = false;
            foreach ($modules as $module) {
                if ($module[1] === 'ft') {
                    $redisearchLoaded = true;
                    break;
                }
            }
            if (!$redisearchLoaded) {
                // Handle the case where RediSearch is not loaded (e.g., log a warning, throw an exception)
                error_log("RediSearch module not loaded!");
            }

        }

public function delKeys(array|string $key): Redis|int|false {
    try {
        // Normalize input to an array (supports both string and array inputs)
        $keys = is_array($key) ? $key : [$key];

        // Expand wildcards (e.g., "cache_*" → ["cache_1", "cache_2"])
        $finalKeys = [];
        foreach ($keys as $k) {
            if (is_string($k) && str_contains($k, '*')) {
                $matchedKeys = parent::keys($k);
                $finalKeys = array_merge($finalKeys, $matchedKeys ?: []);
            } else {
                $finalKeys[] = $k;
            }
        }

        // Call parent::del() using argument unpacking
        return !empty($finalKeys) ? parent::del(...$finalKeys) : 0;
    } catch (RedisException $e) {
        error_log("Redis Delete Error: " . $e->getMessage());
        return false;
    }
}

public function set(string $key, mixed $fetch, mixed $options = null): Redis|string|bool {
    if (!$fetch) {
        return false;
    }

    try {
        if (is_int($fetch)) {
            parent::set($key, $fetch, $options);
        } elseif (is_array($fetch)) {
            $fetch = json_encode($fetch, JSON_UNESCAPED_UNICODE);
            parent::setex($key, 1000, $fetch); // Ensure expiry
        } elseif (is_string($fetch) && isJson($fetch)) {
            parent::set($key, $fetch, $options);
        } else {
            parent::set($key, $fetch, $options);
        }

        parent::persist($key);
        return true;
    } catch (Exception $e) {
        error_log("Redis Set Error: " . $e->getMessage());
        return false;
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
public function get($key):mixed {
    $res = $this->exists($key);
    $type = parent::object("encoding", $key);

    if (!$res) {
        return false;
    }
    $get = parent::get($key);
    if ($type == 'int') {
        return (int)$get;
    } elseif (isJson($get)) {
        return json_decode($get, true);
    } elseif ($get === '' || is_string($get)) {  // Explicitly allow empty and non-empty strings
        return $get;
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
    public function keys(string $pattern): array|false {
    try {
        // Get keys matching the pattern
        $keys = parent::keys($pattern); // Use the Redis `keys` command to find matching keys
        return $keys ?: false; // Return keys, or false if no keys are found
    } catch (RedisException $e) {
        error_log("Redis Get Keys With Wildcard Error: " . $e->getMessage());
        return false;
    }
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

       // RediSearch methods

       public function createIndex(string $indexName, array $schema): bool {
           if (!$this->redis_running) return false; // Check Redis connection
           try {
                $result = $this->rawCommand('FT.CREATE', $indexName, 'ON', 'HASH', 'SCHEMA', ...$schema);
               return $result === 'OK';
           } catch (RedisException $e) {
               // Handle RediSearch errors
              error_log("RediSearch error: " . $e->getMessage());
              return false;
           }
       }




       public function searchRedis(string $indexName, string $query): array|false {
          if (!$this->redis_running) return false;  //Check Redis connection
           try {
               return $this->rawCommand('FT.SEARCH', $indexName, $query);
           } catch (RedisException $e) {
             // Handle RediSearch errors
               error_log("RediSearch error: " . $e->getMessage());
             return false;

           }
       }

}
