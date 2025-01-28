<?php
namespace Core;

trait Ad {

    protected $adService; // Store the ad service instance (AdSense, AdMob, AdManager)
    protected $configAd;    // Store configuration for the ad service
    protected $client;    // Google API client

protected $configAd = [
            'service' => 'adsense',
            'credentials' => '/path/to/credentials.json',
            'scopes' => ['https://www.googleapis.com/auth/adsense.readonly'],
            'access_type' => 'offline',
        ];
    protected function getReport() {
        $report = $this->fetchAdReport('2024-01-01', '2024-01-31');
        print_r($report);
    }

    // Initialize the ad service with configuration
    protected function initAdService(array $configAd) {
        $this->config = $configAd;
        $this->client = $this->createClient($configAd);

        if (isset($configAd['service'])) {
            switch ($configAd['service']) {
                case 'adsense':
                    $this->adService = new \Google_Service_AdSense($this->client);
                    break;
                case 'admob':
                    $this->adService = new \Google_Service_AdMob($this->client);
                    break;
                case 'admanager':
                    $this->adService = new \Google_Service_AdManager($this->client);
                    break;
                default:
                    throw new \Exception("Invalid ad service specified");
            }
        }
    }

    // Create Google API client with provided config
    protected function createClient(array $configAd) {
        $client = new \Google_Client();

        if (isset($configAd['credentials'])) {
            $client->setAuthConfig($configAd['credentials']);
        }
        $client->setScopes($configAd['scopes'] ?? ['https://www.googleapis.com/auth/adsense.readonly']);

        if (isset($configAd['access_type'])) {
            $client->setAccessType($configAd['access_type']);
        }

        return $client;
    }

    // Fetch ad report data (common interface for AdSense, AdMob, AdManager)
    protected function fetchAdReport($startDate, $endDate, $filters = []) {
        if ($this->adService instanceof \Google_Service_AdSense) {
            return $this->fetchAdSenseReport($startDate, $endDate, $filters);
        } elseif ($this->adService instanceof \Google_Service_AdMob) {
            return $this->fetchAdMobReport($startDate, $endDate, $filters);
        } elseif ($this->adService instanceof \Google_Service_AdManager) {
            return $this->fetchAdManagerReport($startDate, $endDate, $filters);
        } else {
            throw new \Exception("No valid ad service initialized.");
        }
    }

    // Fetch report for AdSense
    protected function fetchAdSenseReport($startDate, $endDate, $filters = []) {
        $optParams = [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'dimension' => 'DATE',
            'metric' => ['EARNINGS'],
        ];

        if (!empty($filters)) {
            $optParams['filters'] = $filters;
        }

        return $this->adService->reports->generate($optParams);
    }

    // Fetch report for AdMob
    protected function fetchAdMobReport($startDate, $endDate, $filters = []) {
        // AdMob-specific report fetching logic
        // Example structure:
        $optParams = [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'dimension' => 'DATE',
            'metric' => ['EARNINGS'],
        ];

        if (!empty($filters)) {
            $optParams['filters'] = $filters;
        }

        return $this->adService->reports->generate($optParams);
    }

    // Fetch report for AdManager
    protected function fetchAdManagerReport($startDate, $endDate, $filters = []) {
        // AdManager-specific report fetching logic
        // Example structure:
        $optParams = [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'dimension' => 'DATE',
            'metric' => ['EARNINGS'],
        ];

        if (!empty($filters)) {
            $optParams['filters'] = $filters;
        }

        return $this->adService->reports->generate($optParams);
    }

    // Example method to retrieve ad unit data (works for multiple services)
    protected function getAdUnits() {
        if ($this->adService instanceof \Google_Service_AdSense) {
            return $this->adService->accounts_adunits->listAccountsAdunits('accountId');
        } elseif ($this->adService instanceof \Google_Service_AdMob) {
            return $this->adService->accounts_adunits->listAccountsAdunits('accountId');
        } elseif ($this->adService instanceof \Google_Service_AdManager) {
            return $this->adService->adunits->listAdUnits();
        } else {
            throw new \Exception("No valid ad service initialized.");
        }
    }
}
