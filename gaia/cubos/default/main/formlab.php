<?php
function buildTable($jsonData) {
        if (is_string($jsonData)) {
            $data = json_decode($jsonData, true);
        } else {
            $data = $jsonData;
        }

        if (!$data || !is_array($data)) {
            return "Invalid JSON data.";
        }

        // Start building the HTML table
        $table = "<table border='1' cellpadding='10'>\n";

        // Call recursive function to process each key-value pair
        $table .= processData($data);

        // Close the table
        $table .= "</table>";

        return $table;
    }

    // Recursive function to process data
    function processData($data, $level = 0) {
        $output = '';
        foreach ($data as $key => $value) {
            $output .= "<tr>";

            // Display the key as the first column (with indentation for nested subs)
            $output .= "<td style='padding-left: " . (20 * $level) . "px;'>" . htmlspecialchars($key) . "</td>";

            // Check if value has subs or is a simple object
            if (isset($value['subs']) && is_array($value['subs'])) {
                $output .= "<td>" . htmlspecialchars($value['title']) . "</td>";
                $output .= "<td><span class='glyphicon glyphicon-" . htmlspecialchars($value['icon']) . "'></span></td>";
                $output .= "</tr>";

                // Recursively process the subs array
                $output .= processData($value['subs'], $level + 1);
            } else {
                // Display slug and icon for leaf nodes
                $output .= "<td>" . htmlspecialchars($value['slug'] ?? $value['title']) . "</td>";
                $output .= "<td><span class='glyphicon glyphicon-" . htmlspecialchars($value['icon']) . "'></span></td>";
                $output .= "</tr>";
            }
        }
        return $output;
    }
echo buildTable($this->navigation());
