<?php
namespace Core;
use MatthiasMullie\Minify;

/**
BUNDLE
1. CUBO folders method, bundle cubos to build folder according to list > output folder to PUBLIC_BUILD
2. COMPOS folders method, bundle main public app and used folders to build folder > output folder to PUBLIC_BUILD
3. CSS folders method minify   > output folder to PUBLIC_BUILD
4. JS folders method minify > output folder to PUBLIC_BUILD
4. MAIN with all subfolders all files > output folder to PUBLIC_BUILD
5. COPY INDEX.PHP > output folder PUBLIC_BUILD/index.php

in each file get <style> to BUILD_ROOT/css/style.css at the end
in each file get <script> to BUILD_ROOT/js/start.js at the end

executed by administrator/bundle
PHP
This allows you to pass data to your cubo PHP files during inclusion, providing flexibility for dynamic content.
Explanation:
Custom PHP Tag (##PHP##): We use a unique placeholder (##PHP##) to avoid conflicts with <?php tags in your cubo HTML code.
Separate HTML and PHP Files: The bundler now creates separate files for HTML content (chat.html) and PHP logic (chat.php).
include_buffer(): This function uses output buffering and data extraction to enable more dynamic content generation in your cubos.
Templating (Consider): If your cubos require more advanced template logic, look into PHP templating engines (like Twig or Blade) for cleaner and more manageable HTML generation.
Key Points and Best Practices:
Security: Prioritize security with htmlspecialchars or a dedicated HTML sanitization library for user-generated content.
Error Handling: Add error handling in your PHP and JavaScript to gracefully manage unexpected situations.
Minification (Optional): You can extend the build.php script to minify the HTML, CSS, and JavaScript output for production to reduce file sizes.

*/
trait Bundle {



     protected function outputBundledCubos() {
            // Create the build directory if it doesn't exist
            if (!file_exists(BUILD_ROOT.'cubos')) {
                mkdir(BUILD_ROOT.'cubos', 0755, true);
            }

            // GET LIST OF CUBO used in domain
            $cubosToBundle = $this->db->fa("SELECT * from {$this->publicdb}.pagecubo");

            // Bundle each each file in each folder
            foreach ($cubosToBundle as $cubo) {
                $files = glob(CUBO_ROOT.$cubo."/*.php");
                    foreach ($files as $file) {
                        $this->bundlePHPFile($file,CUBO_ROOT.$cubo);
                    }
                }
            echo "Cubos bundling complete!\n";
        }
    //cubos
        // Function to process a single cubo file
        protected function bundlePHPFile(string $filePath,string $outputFolder): void {
            if (file_exists($filePath)) {
                // 1. Get the file content
                $content = file_get_contents($filePath);

                // 2. Extract <style>, <php ... (HTML), and <script> blocks
                preg_match_all('/<style>(.*?)<\/style>/s', $content, $styleMatches);
                preg_match('/<\?php(.*?)\?>/s', $content, $phpMatches);
                preg_match_all('/<script>(.*?)<\/script>/s', $content, $scriptMatches);

                // 3. Sanitize HTML from PHP block for safe output
                $htmlContent = isset($phpMatches[1]) ? htmlspecialchars($phpMatches[1], ENT_QUOTES, 'UTF-8') : '';

                // 4. Combine content into a structured format
                $bundledContent =
                    "<!-- Styles -->\n" . implode("\n", $styleMatches[1]) . "\n\n" .
                    "<!-- HTML -->\n" . "<div id='cubo-$cuboName'>" . $htmlContent . "</div>\n\n" .
                    "<!-- JavaScript -->\n" . "<script>\n" . implode("\n", $scriptMatches[1]) . "</script>\n";

                // 5. Write the bundled PHP content to a file
                $outputFile = BUILD_ROOT . "$cuboName.php";
                file_put_contents($outputFolder.$outputFile, $bundledContent);

                //6. APPEND CSS to style.css is NOT EMPTY $styleMatches
    if (!empty($styleMatches[1])) {
        file_put_contents(BUILD_ROOT . "css/style.css", implode("\n", $styleMatches[1]), FILE_APPEND);
    }
                //7. APPEND js to load.js is NOT EMPTY $styleMatches
    if (!empty($scriptMatches[1])) {
        file_put_contents(BUILD_ROOT . "js/load.js", implode("\n", $scriptMatches[1]), FILE_APPEND);
    }

           echo "Bundled: $filePath\n";
            } else {
                echo "Error: $filePath.php not found!\n";
            }
   }

    //css
    protected function outputBundledCSS(): void {
        $directory = PUBLIC_ROOT_WEB . 'css/';
        $outputDir = BUILD_ROOT . 'css/';

        // Create the output directory if it doesn't exist
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $files = glob("$directory*.css");
        foreach ($files as $file) {
            // Instantiate a new minifier for each file
            $minifier = new Minify\CSS($file); // Load the source file

            // Define the output path
            $outputFile = $outputDir . basename($file);

            // Minify and save the output
            $minifier->minify($outputFile);

            echo "Minified CSS file: $outputFile\n";
        }
    }

    //js
    protected function outputBundledJS(): void {
        $directory = PUBLIC_ROOT_WEB . 'js/';
        $outputDir = BUILD_ROOT . 'js/';

        // Create the output directory if it doesn't exist
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $files = glob("$directory*.js");
        foreach ($files as $file) {
            // Instantiate a new minifier for each file
            $minifier = new Minify\JS($file); // Load the source file

            // Define the output path
            $outputFile = $outputDir . basename($file);

            // Minify and save the output
            $minifier->minify($outputFile);

            echo "Minified JS file: $outputFile\n";
        }
    }

    protected function outputBundledMain(): void {
    if (!file_exists(BUILD_ROOT.'main')) {
                mkdir(BUILD_ROOT.'main', 0755, true);
            }
    }
    protected function bundleMain(string $cuboName): void {
                // Bundle each each file in each folder
               $main_folders= glob(PUBLIC_ROOT_WEB."main/*",GLOB_ONLYDIR);
               foreach($main_folders as $folder){
               $files = glob("$folder/*.php");
                   foreach ($files as $file) {
                         $this->bundlePHPFile($file,PUBLIC_ROOT_WEB."main");
                   }
               }
                echo "Main bundling complete!\n";
    }

    //RUN JUST THIS FOR ALL !
    protected function runBundler(){
    // Create the build directory if it doesn't exist
    // Create the build directory if it doesn't exist
            if (!file_exists(BUILD_ROOT)) {
                mkdir(BUILD_ROOT, 0755, true);
            }

        $this->outputBundledCubos();
        $this->outputBundledCSS();
        $this->outputBundledJS();
        $this->outputBundledMain();
    //copy SITE_ROOT.index.php BUILD_ROOT.index.php
    // Copy index.php to the build directory
            if (file_exists(SITE_ROOT . '/index.php')) {
                copy(SITE_ROOT . '/index.php', BUILD_ROOT . '/index.php');
            } else {
                echo "Error: index.php not found in SITE_ROOT.\n";
            }

            echo "Bundling process completed!\n";
    //check all folders
    //return message
    }

}