<?php
namespace Core;

trait Metric {
// metric.php sub
protected function addMetric(array $params = []): ?array {
    // SQL query to fetch the required data
    $sql = "SELECT s.name, DATE_FORMAT(tr.created, '%Y-%m-%d') AS week, tr.progress_level
            FROM gen_admin.action_task_report tr
            JOIN gen_admin.systems s ON tr.systemsid = s.id
            WHERE tr.created BETWEEN '2024-07-05' AND '2024-09-08'
            ORDER BY tr.created";

    // Execute the query
    $res = $this->db->fa($sql);
    $data = ['res' => []]; // Initialize with 'res' key

    // Check if there are results and structure them accordingly
    if (count($res) > 0) {
        foreach ($res as $row) {
            // Append the week's progress level under a single 'res' key
            $data['res'][] = [
                "name" => $row["name"], // Include the name for context
                "week" => $row["week"],
                "progress" => $row["progress_level"]
            ];
        }
    }

    return $data; // Return the structured data with a single key
}

}