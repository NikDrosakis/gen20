<?php
// Save number of cards in a configuration file
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $numCards = (int)$_POST['num_cards'];
    file_put_contents('cubo_config.json', json_encode(['num_cards' => $numCards]));
    echo "Number of cards saved!";
}
$config = json_decode(file_get_contents('cubo_config.json'), true);
$numCards = $config['num_cards'] ?? 5; // Default to 5 if not set
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cubo Admin</title>
</head>
<body>
    <h2>Set Number of Cards for Cubo</h2>
    <form method="post">
        <label for="num_cards">Number of Cards:</label>
        <input type="number" id="num_cards" name="num_cards" value="<?= htmlspecialchars($numCards) ?>" min="1" max="10">
        <button type="submit">Save</button>
    </form>
</body>
</html>
