<?php
namespace Core;
use APCUIterator;
use Exception;

class GAPCU {

    public $apcu_running = false;

    public function __construct() {
        // Check if APCu is enabled in PHP
        if (extension_loaded('apcu')) {
            $this->apcu_running = true;
        } else {
            // Log an error if APCu is not installed or enabled
            error_log("APCu extension is not enabled!");
        }
    }

    /**
     * Delete keys (one or multiple)
     */
    public function delkeys(array|string $key): bool {
        if (!$this->apcu_running) {
            return false;
        }

        try {
            // Normalize input to an array (supports both string and array inputs)
            $keys = is_array($key) ? $key : [$key];

            foreach ($keys as $k) {
                if (!apcu_delete($k)) {
                    error_log("Failed to delete key: $k");
                }
            }
            return true;
        } catch (Exception $e) {
            error_log("APCu Delete Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Set a value in cache
     */
    public function set(string $key, mixed $fetch, int $ttl = 0): bool {
        if (!$this->apcu_running || $fetch === null) {
            return false;
        }

        try {
            if (is_array($fetch)) {
                $fetch = json_encode($fetch, JSON_UNESCAPED_UNICODE);
            }

            if (apcu_store($key, $fetch, $ttl)) {
                return true;
            } else {
                error_log("Failed to store key: $key");
                return false;
            }
        } catch (Exception $e) {
            error_log("APCu Set Error: " . $e->getMessage());
            return false;
        }
    }

/**
 * Get a value from cache (supports wildcard keys)
 */
public function get(string $key): mixed {
    if (!$this->apcu_running) {
        return false;
    }

    try {
        if (str_contains($key, '*')) {
            $keys = new APCUIterator('/$key/');
            $results = [];

            foreach ($keys as $entry) {
                $value = $entry['value'];
                if (is_string($value) && isJson($value)) {
                    $value = json_decode($value, true);
                }
                $results[$entry['key']] = $value;
            }

            return !empty($results) ? $results : false;
        }

        $result = apcu_fetch($key);
        if ($result === false) {
            return false;
        }

        // Attempt to decode as JSON if it's a string
        if (is_string($result) && isJson($result)) {
            return json_decode($result, true);
        }

        return $result;
    } catch (Exception $e) {
        error_log("APCu Get Error: " . $e->getMessage());
        return false;
    }
}

    /**
     * Append a value to an existing key
     */
    public function append(string $key, mixed $value): bool {
        if (!$this->apcu_running) {
            return false;
        }

        try {
            $existing = $this->get($key);

            if ($existing !== false) {
                $newValue = $existing . $value;
                return $this->set($key, $newValue);
            } else {
                return $this->set($key, $value);
            }
        } catch (Exception $e) {
            error_log("APCu Append Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Increment a value in cache (works with numeric values)
     */
    public function incr(string $key, int $by = 1): bool {
        if (!$this->apcu_running) {
            return false;
        }

        try {
            $result = apcu_fetch($key);

            if ($result === false || !is_numeric($result)) {
                return $this->set($key, $by); // Set the key if it doesn't exist or is not numeric
            }

            return $this->set($key, $result + $by);
        } catch (Exception $e) {
            error_log("APCu Increment Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Decrement a value in cache (works with numeric values)
     */
    public function decr(string $key, int $by = 1): bool {
        return $this->incr($key, -$by); // Simply use the incr function with negative values
    }

    /**
     * Check if a key exists in the cache
     */
    public function exists(string $key): bool {
        if (!$this->apcu_running) {
            return false;
        }

        return apcu_exists($key);
    }

    /**
     * Clear all APCu cache
     */
    public function clear(): bool {
        if (!$this->apcu_running) {
            return false;
        }

        try {
            apcu_clear_cache();
            return true;
        } catch (Exception $e) {
            error_log("APCu Clear Cache Error: " . $e->getMessage());
            return false;
        }
    }

    // Helper function to check if a string is valid JSON
    private function isJson(string $string): bool {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
}
