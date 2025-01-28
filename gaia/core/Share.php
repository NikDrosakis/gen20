<?php
namespace Core;
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
        return $this->makeHttpRequest($url, $params, 'POST');
    }

    public function shareToTwitter($content) {
        $url = "https://api.twitter.com/2/tweets";
        $params = [
            'text' => $content['message']
        ];
        return $this->makeHttpRequest($url, $params, 'POST', ['Authorization: Bearer ' . $this->twitterBearerToken]);
    }

    public function shareToInstagram($content) {
        // Instagram requires posting an image/video, so adjust accordingly.
        $url = "https://graph.facebook.com/v12.0/{user-id}/media";
        $params = [
            'access_token' => $this->instagramAccessToken,
            'image_url' => $content['image_url'],
            'caption' => $content['message']
        ];
        return $this->makeHttpRequest($url, $params, 'POST');
    }

    public function shareToTikTok($content) {
        $url = "https://open-api.tiktok.com/v1/post/share";
        $params = [
            'access_token' => $this->tiktokAccessToken,
            'video_url' => $content['video_url'],
            'caption' => $content['message']
        ];
        return $this->makeHttpRequest($url, $params, 'POST');
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
        curl_close($ch);
        return $response;
    }
}