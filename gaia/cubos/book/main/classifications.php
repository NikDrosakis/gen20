<style>
    .category-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: space-between;
    }
    .category {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      width: 100%;
     }
@media (min-width: 1121px) {
    .category {width: 48.5%;}
}
    ul {
      list-style: none;
      padding-left: 0;
    }
    li {
      font-size: 16px;
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    @media (max-width: 768px) {
      .category {
        width: 100%;
      }
    }
</style>
<h2 style="cursor:pointer">Classifications</h2>
<?php
// Load and decode JSON file
$classifications = $this->include_buffer("tax.json");
$data = json_decode($classifications, true);
// Start generating HTML for categories and divisions
echo '<div class="category-container">';
// Loop through each classification category
foreach ($data as $categoryKey => $category) {
    // Display category code and title with total number of divisions as counter
    $categoryTitle = $categoryKey . ' - ' . $category['class'];
    $totalDivisions = count($category['div']); // Total divisions in this category
    echo '<div class="category" id="category-' . $categoryKey . '">';
    echo '<h2>' . $categoryTitle . ' <span class="counter">' . $totalDivisions . '</span></h2>';
    echo '<ul>';
    // Loop through each division within the current category
    foreach ($category['div'] as $divisionKey => $divisionName) {
        // You can modify the counter (currently placeholder) dynamically if needed
        $divisionCounter = rand(1, 100); // Example: Random counter for demonstration
        // Display division code and name
        echo '<li>' . $divisionKey . ' - ' . $divisionName . ' <span class="counter">' . $divisionCounter . '</span></li>';
    }
    echo '</ul>';
    echo '</div>'; // End of category div
}
echo '</div>'; // End of category-container
?>