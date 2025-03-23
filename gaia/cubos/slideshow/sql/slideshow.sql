CREATE TABLE IF NOT EXISTS c_slideshow (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             name VARCHAR(255) NOT NULL,
    sort INT NOT NULL DEFAULT 0,
    caption TEXT
    );
