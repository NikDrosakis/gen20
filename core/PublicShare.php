<?php 
namespace Core;

trait PublicShare {
    protected $facebookAccessToken;
    protected $twitterBearerToken;
    protected $instagramAccessToken;
    protected $tiktokAccessToken;

    public function __construct($facebookToken, $twitterToken, $instagramToken, $tiktokToken) {
        $this->facebookAccessToken = $facebookToken;
        $this->twitterBearerToken = $twitterToken;
        $this->instagramAccessToken = $instagramToken;
        $this->tiktokAccessToken = $tiktokToken;
    }

    public function cuboShare($content) {
        $platforms = ['facebook', 'instagram', 'twitter', 'tiktok'];

        foreach ($platforms as $platform) {
            try {
                $this->share($platform, $content);
                echo "Content shared to $platform successfully.\n";
            } catch (\Exception $e) {
                echo "Failed to share to $platform: " . $e->getMessage() . "\n";
            }
        }
    }

    protected function share($platform, $content) {
        switch ($platform) {
            case 'facebook':
                $url = "https://graph.facebook.com/v12.0/me/feed";
                $params = [
                    'access_token' => $this->facebookAccessToken,
                    'message' => $content['message'],
                    'link' => $content['link']
                ];
                break;

            case 'twitter':
                $url = "https://api.twitter.com/2/tweets";
                $params = [
                    'text' => $content['message']
                ];
                $headers = ['Authorization: Bearer ' . $this->twitterBearerToken];
                break;

            case 'instagram':
                $url = "https://graph.facebook.com/v12.0/{user-id}/media";
                $params = [
                    'access_token' => $this->instagramAccessToken,
                    'image_url' => $content['image_url'],
                    'caption' => $content['message']
                ];
                break;

            case 'tiktok':
                $url = "https://open-api.tiktok.com/v1/post/share";
                $params = [
                    'access_token' => $this->tiktokAccessToken,
                    'video_url' => $content['video_url'],
                    'caption' => $content['message']
                ];
                break;

            default:
                throw new \Exception("Unsupported platform: $platform");
        }

        $this->makeHttpRequest($url, $params, 'POST', $headers ?? []);
    }

    protected function makeHttpRequest($url, $params, $method = 'POST', $headers = []) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new \Exception('Curl error: ' . curl_error($ch));
        }
        curl_close($ch);
        return $response;
    }
}
