<?php
namespace Core;

use Exception;

/**
 * Trait for managing method-based documentation
 */
trait Doc {
    /**
     * Provides documentation for a method.
     *
     * @param string $method The method to document.
     * @return string Documentation string for the method.
     */
    public function help($method): string {
        // Returns the documentation string for the requested method
    }
}
