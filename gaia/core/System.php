<?php
namespace Core;
/**
share content with profile
facebook, twitter, tiktok, instagram
 */
trait System{

protected function parseCpuUsage($cpuData) {
    $lines = explode("\n", trim($cpuData));
    $cpuLine = explode(' ', preg_replace('/\s+/', ' ', $lines[0]));
    array_shift($cpuLine); // Remove 'cpu' label

    $user = $cpuLine[0];
    $nice = $cpuLine[1];
    $system = $cpuLine[2];
    $idle = $cpuLine[3];

    // Calculate total and usage
    $total = array_sum($cpuLine);
    $usage = $total - $idle;

    // Return usage as a percentage
    return round(($usage / $total) * 100, 2);
}

protected function getSystemMetrics() {
    // Fetch CPU usage
    $cpuUsage = file_get_contents('/proc/stat');
    // Parse and calculate CPU usage
    // Fetch memory info
    $memInfo = file_get_contents('/proc/meminfo');
    // Parse memory info
    return [
        'cpu' => $this->parseCpuUsage($cpuUsage),
        'memory' => $this->parseMemInfo($memInfo),
    ];
}
protected function parseMemInfo($memInfo) {
    $lines = explode("\n", trim($memInfo));
    $memInfoArray = [];
    foreach ($lines as $line) {
        list($key, $value) = explode(':', $line);
        $memInfoArray[trim($key)] = (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    $totalMemory = $memInfoArray['MemTotal'];
    $freeMemory = $memInfoArray['MemFree'];
    $availableMemory = $memInfoArray['MemAvailable'];

    // Calculate used memory
    $usedMemory = $totalMemory - $availableMemory;

    return [
        'total' => $totalMemory,
        'used' => $usedMemory,
        'free' => $freeMemory,
        'available' => $availableMemory,
        'used_percentage' => round(($usedMemory / $totalMemory) * 100, 2)
    ];
}
}