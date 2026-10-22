<?php
namespace Core\Traits;

trait Email {

    protected function sendZohoMail($data) {
        if (empty($data['email']) || empty($data['comment'])) {
            http_response_code(400);
            return ['error' => 'Missing required fields'];
        }

        $accessToken = 'YOUR_VALID_ACCESS_TOKEN';
        $accountId = '20106193110'; // Get this from Zoho's /accounts API

        $url = "https://mail.zoho.com/api/accounts/{$accountId}/messages";

        $subject = "New Comment from {$data['name']}";
        $body = "Comment:\n\n{$data['comment']}\n\nFrom: {$data['name']} ({$data['email']})\nWebsite: {$data['website']}";

        $payload = [
            "fromAddress" => "info@gen20.net",
            "toAddress" => "info@gen20.net", // Can also be a comma-separated string of emails
            "subject" => $subject,
            "mailFormat" => "text", // or "html"
            "content" => $body,
        ];

        $options = [
            'http' => [
                'method' => 'POST',
                'header' => [
                    "Authorization: Zoho-oauthtoken {$accessToken}",
                    "Content-Type: application/json",
                ],
                'content' => json_encode($payload),
                'ignore_errors' => true,
            ]
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        $httpCode = $http_response_header[0] ?? 'HTTP/1.1 500 Internal Server Error';

        if (strpos($httpCode, '200') === false && strpos($httpCode, '202') === false) {
            return [
                'success' => false,
                'message' => 'Zoho Mail API failed: ' . $httpCode,
                'raw' => $result
            ];
        }

        return [
            'success' => true,
            'message' => 'Email sent via Zoho Mail API',
            'response' => json_decode($result, true),
        ];
    }
}
