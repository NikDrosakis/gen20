<?php
// Get data for the progress over time line chart
$data=$this->addMetric();
// Return data as JSON
echo json_encode($data);