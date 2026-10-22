<?php
namespace Core\Traits;
use Exception;

trait GA {

    /**
     * Get Google Analytics 4 data using Service Account
     * Requires: Service account email and private key JSON file
     */
    protected function getAnalyticsData($days = 30, $limit = 20) {
        try {
            // Get Measurement ID from database
            $measurementId = $this->db->f("SELECT val FROM {$this->publicdb}.setup WHERE name = 'MEASUREMENT_ID'");

            if (!$measurementId) {
                return ['success' => false, 'error' => 'MEASUREMENT_ID not found'];
            }
            $measurementIdVal = $measurementId['val'];
            // Get GA4 Property ID (from Measurement ID: G-XXXXXXXX -> XXXXXXXXX)
            $propertyId ='362501764';
            //$propertyId = str_replace('G-', '',$measurementIdVal);

            // Get access token from service account
            $accessToken = $this->getGoogleAccessToken();

            if (!$accessToken) {
                return ['success' => false, 'error' => 'Failed to get access token'];
            }

            // Fetch analytics data
            $data = $this->fetchGA4Data($propertyId, $accessToken, $days, $limit);

            return $data;

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get Google OAuth2 Access Token using Service Account
     */
    private function getGoogleAccessToken() {
        try {
            // Path to your service account JSON key file
            $serviceAccountJson = '/var/www/gs/vivalibro-b4b8ea71e6b8.json';

            if (!file_exists($serviceAccountJson)) {
                throw new Exception('Service account JSON file not found');
            }

            $serviceAccount = json_decode(file_get_contents($serviceAccountJson), true);

            // Create JWT header and claim
            $header = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claim = base64_encode(json_encode([
                'iss' => $serviceAccount['client_email'],
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
                'aud' => 'https://oauth2.googleapis.com/token',
                'exp' => time() + 3600,
                'iat' => time()
            ]));

            // Sign the JWT with private key
            $signature = '';
            openssl_sign($header . '.' . $claim, $signature, $serviceAccount['private_key'], 'SHA256');
            $jwtSignature = base64_encode($signature);

            $jwt = $header . '.' . $claim . '.' . $jwtSignature;

            // Request access token
            $ch = curl_init('https://oauth2.googleapis.com/token');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception('Token request failed: ' . $response);
            }

            $tokenData = json_decode($response, true);
            return $tokenData['access_token'] ?? null;

        } catch (Exception $e) {
            error_log("GA Token Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch GA4 data from Google Analytics API
     */
    private function fetchGA4Data($propertyId, $accessToken, $days, $limit) {
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime("-$days days"));

        $body = [
            'property' => "properties/{$propertyId}",
            'dateRanges' => [
                ['startDate' => $startDate, 'endDate' => $endDate]
            ],
            'dimensions' => [
                ['name' => 'pagePath'],
                ['name' => 'pageTitle']
            ],
            'metrics' => [
                ['name' => 'screenPageViews'],
                ['name' => 'activeUsers'],
                ['name' => 'averageSessionDuration'],
                ['name' => 'eventCount']
            ],
            'orderBys' => [
                ['desc' => true, 'metric' => ['metricName' => 'screenPageViews']]
            ],
            'limit' => $limit
        ];

        $ch = curl_init("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return ['success' => false, 'error' => "GA API error: $httpCode - $response"];
        }

        $data = json_decode($response, true);

        // Format the response
        $result = [
            'success' => true,
            'data' => [],
            'total' => [
                'views' => 0,
                'activeUsers' => 0,
                'avgEngagementTime' => '0m 0s',
                'eventCount' => 0
            ]
        ];

        if (isset($data['rows'])) {
            $totalViews = 0;
            $totalActiveUsers = 0;
            $totalEventCount = 0;
            $totalEngagement = 0;
            $engagementCount = 0;

            foreach ($data['rows'] as $row) {
                $views = (int)$row['metricValues'][0]['value'];
                $activeUsers = (int)$row['metricValues'][1]['value'];
                $engagementSeconds = (float)$row['metricValues'][2]['value'];
                $eventCount = (int)$row['metricValues'][3]['value'];

                $totalViews += $views;
                $totalActiveUsers += $activeUsers;
                $totalEventCount += $eventCount;

                if ($engagementSeconds > 0) {
                    $totalEngagement += $engagementSeconds;
                    $engagementCount++;
                }

                $result['data'][] = [
                    'pagePath' => $row['dimensionValues'][0]['value'],
                    'pageTitle' => $row['dimensionValues'][1]['value'],
                    'views' => $views,
                    'activeUsers' => $activeUsers,
                    'avgEngagementTime' => $this->formatEngagementTime($engagementSeconds),
                    'eventCount' => $eventCount,
                    'percentage' => 0 // Will calculate after total is known
                ];
            }

            // Calculate percentages
            foreach ($result['data'] as &$item) {
                $item['percentage'] = $totalViews > 0 ? round(($item['views'] / $totalViews) * 100, 2) : 0;
            }

            $avgEngagement = $engagementCount > 0 ? $totalEngagement / $engagementCount : 0;

            $result['total'] = [
                'views' => $totalViews,
                'activeUsers' => $totalActiveUsers,
                'avgEngagementTime' => $this->formatEngagementTime($avgEngagement),
                'eventCount' => $totalEventCount
            ];
        }

        return $result;
    }

    /**
     * Format engagement time from seconds to minutes and seconds
     */
    private function formatEngagementTime($seconds) {
        $minutes = floor($seconds / 60);
        $secs = floor($seconds % 60);
        return "{$minutes}m {$secs}s";
    }

    /**
     * Get data for chart (daily views over time)
     */
    protected function getDailyViewsData($days = 30) {
        try {
            $measurementId = $this->db->f("SELECT val FROM {$this->publicdb}.setup WHERE name = 'MEASUREMENT_ID'");
            $propertyId = str_replace('G-', '', $measurementId['val']);
            $accessToken = $this->getGoogleAccessToken();

            if (!$accessToken) {
                return ['success' => false, 'error' => 'No access token'];
            }

            $endDate = date('Y-m-d');
            $startDate = date('Y-m-d', strtotime("-$days days"));

            $body = [
                'property' => "properties/{$propertyId}",
                'dateRanges' => [
                    ['startDate' => $startDate, 'endDate' => $endDate]
                ],
                'dimensions' => [
                    ['name' => 'date']
                ],
                'metrics' => [
                    ['name' => 'screenPageViews']
                ]
            ];

            $ch = curl_init("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport");
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($response, true);
            $dailyData = [];

            if (isset($data['rows'])) {
                foreach ($data['rows'] as $row) {
                    $date = $row['dimensionValues'][0]['value'];
                    $views = (int)$row['metricValues'][0]['value'];
                    $dailyData[] = [
                        'date' => substr($date, 0, 4) . '-' . substr($date, 4, 2) . '-' . substr($date, 6, 2),
                        'views' => $views
                    ];
                }
            }

            return ['success' => true, 'data' => $dailyData];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get top pages with filters
     */
    protected function getTopPages($limit = 20, $pathFilter = null) {
        $data = $this->getAnalyticsData(30, $limit);

        if (!$data['success'] || empty($data['data'])) {
            return $data;
        }

        // Filter by path if specified
        if ($pathFilter) {
            $data['data'] = array_filter($data['data'], function($item) use ($pathFilter) {
                return strpos($item['pagePath'], $pathFilter) !== false;
            });
            $data['data'] = array_values($data['data']);
        }

        return $data;
    }
}