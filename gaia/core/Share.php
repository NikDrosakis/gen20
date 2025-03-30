<?php
namespace Core;
use Abraham\TwitterOAuth\TwitterOAuth;

/**
share content with profile
facebook, twitter, tiktok, instagram
 */
trait Share{
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

    public function shareToFacebook($content) {
        $url = "https://graph.facebook.com/v12.0/me/feed";
        $params = [
            'access_token' => $this->facebookAccessToken,
            'message' => $content['message'],
            'link' => $content['link']
        ];
        return $this->fetchUrl($url, $params, 'POST');
    }

    protected function shareTo($platform, $content) {
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

protected function tweet(string $tweet='Message from Gen20') {

define("API_KEY", "1uRQpkjU5XkgsomDExNwVuHII");
define("API_SECRET", "dvGwUhC4mYVutDe5Og7IFeSp064IDRKRjsEPaoFmHV3g1wmfep");
define("BEARER_TOKEN", "AAAAAAAAAAAAAAAAAAAAAMSy0AEAAAAAL%2BpHyxfxkrSQ%2B%2Flqb8fubw%2BIcu4%3DpbmP5v4xtDVcPPYOND2z7CinomNIynpwR2WcsvGzdpueEn0SfK");

$url = "https://api.twitter.com/2/tweets";
$headers = [
    "Authorization: Bearer " . BEARER_TOKEN,
    "Content-Type: application/json"
];

$data = json_encode(["text" => $tweet]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 201) {
    echo "✅ Tweet sent successfully!\n";
} else {
    echo "❌ Error: " . $response . "\n";
}

}


    public function shareToTwitter($content) {
        $url = "https://api.twitter.com/2/tweets";
        $params = [
            'text' => $content['message']
        ];
        return $this->fetchUrl($url, $params, 'POST', ['Authorization: Bearer ' . $this->twitterBearerToken]);
    }

    public function shareToInstagram($content) {
        // Instagram requires posting an image/video, so adjust accordingly.
        $url = "https://graph.facebook.com/v12.0/{user-id}/media";
        $params = [
            'access_token' => $this->instagramAccessToken,
            'image_url' => $content['image_url'],
            'caption' => $content['message']
        ];
        return $this->fetchUrl($url, $params, 'POST');
    }

    public function shareToTikTok($content) {
        $url = "https://open-api.tiktok.com/v1/post/share";
        $params = [
            'access_token' => $this->tiktokAccessToken,
            'video_url' => $content['video_url'],
            'caption' => $content['message']
        ];
        return $this->fetchUrl($url, $params, 'POST');
    }

    protected function fetchUrl($url, $params, $method = 'POST', $headers = []) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}