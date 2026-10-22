<?php
namespace Core\Traits;

trait Oxygen {
    protected $OXYGEN_API_KEY='03d7f36b-7ff7-4460-a0ed-689c5df3d4a6';
    protected string $sandboxOxygenBase = "https://sandbox-api.oxygen.gr/v1";
    protected string $oxygenBase = "https://api.oxygen.gr/v1";

    public function createOxygenContact(array $contactData) {
        return $this->oxygenRequest('contacts', $contactData, 'POST');
    }

    public function createOxygenInvoice(array $invoiceData) {
        return $this->oxygenRequest('invoices', $invoiceData, 'POST');
    }

    protected function oxygenRequest($endpoint, array $data = [], string $method = 'POST') {
    $end = is_array($endpoint) ? $endpoint['key'] :$endpoint;
        $url = $this->oxygenBase . '/' . $end;
        $options = [
            'method' => $method,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->OXYGEN_API_KEY,
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json'
            ],
        ];

        if (!empty($data)) {
            $options['body'] = json_encode($data);
        }

        return $this->fetchUrl($url, $options);
    }
}
