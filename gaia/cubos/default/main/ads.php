<h3>Ads Panel</h3>

<?php
$config = [
            'service' => 'adsense',
            'credentials' => '/path/to/credentials.json',
            'scopes' => ['https://www.googleapis.com/auth/adsense.readonly'],
            'access_type' => 'offline',
        ];
$this->initAdService($config);

xecho($this->fetchAdReport('2024-01-01', '2024-01-31'));

xecho($this->getAdUnits());

