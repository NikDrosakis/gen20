<?php
namespace Core\Traits;

use Abraham\TwitterOAuth\TwitterOAuth;

trait PipeSM
{
    protected $tokens = [];

    public function initTokens(array $tokens)
    {
        $this->tokens = $tokens;
    }

    public function share(string $platform, array $content)
    {
        switch (strtolower($platform)) {
            case 'facebook':
                return $this->postToFacebook($content);
            case 'twitter':
                return $this->postToTwitter($content);
            case 'instagram':
                return $this->postToInstagram($content);
            case 'tiktok':
                return $this->postToTiktok($content);
            default:
                throw new \Exception("Unsupported platform: {$platform}");
        }
    }

    protected function postToFacebook(array $content)
    {
        $url = "https://graph.facebook.com/v18.0/me/feed";
        $params = [
            'access_token' => $this->tokens['facebook'] ?? '',
            'message' => $content['message'] ?? '',
            'link' => $content['link'] ?? null
        ];

        return $this->makeRequest($url, $params, 'POST');
    }

    protected function postToTwitter(array $content)
    {
        $connection = new TwitterOAuth(
            $this->tokens['twitter_api_key'],
            $this->tokens['twitter_api_secret'],
            $this->tokens['twitter_access_token'],
            $this->tokens['twitter_access_secret']
        );

        return $connection->post("statuses/update", ["status" => $content['message'] ?? '']);
    }

    protected function postToInstagram(array $content)
    {
        // Facebook Graph API - Instagram via page
        $url = "https://graph.facebook.com/v18.0/{$this->tokens['instagram_user_id']}/media";
        $params = [
            'access_token' => $this->tokens['instagram'] ?? '',
            'image_url' => $content['image_url'] ?? '',
            'caption' => $content['message'] ?? ''
        ];

        return $this->makeRequest($url, $params, 'POST');
    }

    protected function postToTiktok(array $content)
    {
        $url = "https://open.tiktokapis.com/v2/post/publish/";
        $params = [
            'access_token' => $this->tokens['tiktok'] ?? '',
            'video_url' => $content['video_url'] ?? '',
            'caption' => $content['message'] ?? ''
        ];

        return $this->makeRequest($url, $params, 'POST');
    }

    protected function makeRequest(string $url, array $params, string $method = 'POST', array $headers = [])
    {
        $ch = curl_init();

        if ($method === 'GET') {
            $url .= '?' . http_build_query($params);
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        }
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }

        $response = curl_exec($ch);
        if ($response === false) {
            throw new \Exception(curl_error($ch));
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'code' => $httpCode,
            'response' => json_decode($response, true)
        ];
    }
}
