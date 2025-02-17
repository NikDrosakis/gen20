<?php
namespace Core;
use Exception;/*
ADMIN Core Class ROUTING
layout with channels and drag and drop
abstract database access for use in traits
TO HEAD CSS
 Get layout preference from cookies, default to 3-column layout
        if ($layout === '50-50') {
            $columns = "1fr 1fr"; // 2 columns
            $rows = "1fr";       // 1 row
        } elseif ($layout === '70-30') {
            $columns = "2fr 1fr"; // 2 columns (70% - 30%)
            $rows = "1fr";       // 1 row
        } else { // Default: 3-column layout
            $columns = "1fr 1fr 1fr"; // 3 columns
            $rows = "1fr 1fr";       // 2 rows
        }
//schema 1, 2 '50-50','70-30', 3
    6: {
        columns: '1fr 1fr 1fr', // 3 columns
        rows: '1fr 1fr',        // 2 rows
    },
    4: {
        columns: '1fr 1fr',   // 2 columns
        rows: '1fr 1fr',
    },
    2: {
        columns: '1fr',       // 1 column
        rows: '1fr 1fr',      // 2 rows
    },
    1: {
        columns: '1fr',
        rows: '1fr'
    }
*/
class Admin extends Gaia {




}