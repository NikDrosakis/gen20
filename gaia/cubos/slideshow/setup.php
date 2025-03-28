<?php
// Database connection
$host = 'localhost';
$dbname = 'gen_vivalibrocom';
$user = 'root';
$pass = 'n130177!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create the c_slideshow table if it doesn't exist
    $sql = "
    CREATE TABLE IF NOT EXISTS c_slideshow (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sort INT NOT NULL DEFAULT 0,
        caption TEXT
    )";

    $pdo->exec($sql);
    echo "Table `c_slideshow` created successfully or already exists.<br>";

    // Ensure the media/slideshow folder exists
    $mediaFolder = MEDIA_ROOT. 'slideshow';
    if (!is_dir($mediaFolder)) {
        mkdir($mediaFolder, 0777, true);
        echo "Folder `media/slideshow` created successfully.<br>";
    } else {
        echo "Folder `media/slideshow` already exists.<br>";
    }

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
