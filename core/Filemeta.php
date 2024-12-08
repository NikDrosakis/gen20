<?php
namespace Core;

trait Filemeta {
    // Extract dependent classes (from `use` statements)
    protected function extractDependencies($content) {
        preg_match_all('/^use\s+(.+);$/m', $content, $matches);
        return implode(',', $matches[1] ?? []);
    }

    // Extract PHP content
    protected function extractPHP($content) {
        return preg_match('/<\?php(.*?)(?:\?>|$)/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // Extract Pug content
    protected function extractPug($content) {
        return preg_match('/<template lang="pug">(.*?)<\/template>/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // Extract CSS styles
    protected function extractStyle($content) {
        return preg_match('/<style.*?>(.*?)<\/style>/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // Extract JavaScript
    protected function extractJS($content) {
        return preg_match('/<script.*?>(.*?)<\/script>/s', $content, $matches) ? trim($matches[1]) : null;
    }

/**
 * Extract comments from the content and separate DOC, TODO, and description fields.
 */
protected function extractComments($content) {
    // Regex to extract PHP doc comments (/** ... */)
    preg_match_all('/\/\*\*(.*?)\*\//s', $content, $matches);

    // Clean and trim the comments, removing /** and */
    $cleaned = array_map(function ($comment) {
        return trim(preg_replace(['/^\/\*\*/', '/\*\//'], '', $comment));
    }, $matches[1] ?? []);

    $doc = [];
    $todo = [];
    $description = '';

    foreach ($cleaned as $comment) {
        if (stripos($comment, 'TODO') === 0) {
            $todo[] = $comment;
        } elseif (stripos($comment, 'DOC') === 0) {
            $doc[] = $comment;
        } else {
            // Treat all other comments as general description
            $description .= $comment . "\n";
        }
    }

    // Extract function comments with method names (for DOC)
    preg_match_all('/\/\*\*\s*(.*?)\*\//s', $content, $functionMatches);
    $functionDocs = [];

    foreach ($functionMatches[1] ?? [] as $functionComment) {
        preg_match('/function\s+(\w+)/', $functionComment, $funcNameMatches);
        if (isset($funcNameMatches[1])) {
            $functionDocs[$funcNameMatches[1]] = trim(preg_replace(['/^\/\*\*/', '/\*\//'], '', $functionComment));
        }
    }

    // Combine DOC comments with function-specific DOC comments
    $doc = array_merge($doc, $functionDocs);

    return [
        'doc' => implode("\n", $doc),
        'todo' => implode("\n", $todo),
        'description' => trim($description),
    ];
}


    /**
     * General function to extract content between tags.
     */
    protected function extractSection($content, $startTag, $endTag) {
        preg_match("/$startTag(.*?)$endTag/s", $content, $matches);
        return trim($matches[1] ?? '');
    }

    /**
     * Insert metadata for a single file into the database.
     */
    protected function insertFile(string $file,$cols,$version) {
        $content = file_get_contents($file);
        $comments=$this->extractComments($content);
        $cols = [
            'system' => 'core',
            'name' => basename($file),
            'description' => $comments['description'],
            'style' => $this->extractStyle($content),
            'php' => $this->extractPHP($content),
            'pug' => $this->extractPug($content),
            'js' => $this->extractJS($content),
            'doc' => $comments['doc'],
            'todo' => $comments['todo'],
            'dependent' => $this->extractDependencies($content),
            'created' => date('Y-m-d H:i:s'),
            'updated' => date('Y-m-d H:i:s'),
            'version' => $version,
            'status' => 'PENDING',
        ];
        $this->admin->inse("filemeta", $cols);
    }

/**
 * Update metadata for an existing file in the database.
 */
protected function updateFile(string $file, $cols = []) {
    // Fetch the current metadata from the database
    $currentMetadata = $this->admin->f("SELECT * FROM filemeta WHERE name = ?", [basename($file)]);

    // Get the content of the file
    $content = file_get_contents($file);

    // Extract the comments once and reuse for description, doc, and todo
    $comments = $this->extractComments($content);

    // Prepare the new metadata
    $newCols = [
        'description' => $comments['description'],
        'style' => $this->extractStyle($content),
        'php' => $this->extractPHP($content),
        'pug' => $this->extractPug($content),
        'js' => $this->extractJS($content),
        'doc' => $comments['doc'],
        'todo' => $comments['todo'],
        'dependent' => $this->extractDependencies($content),
        'updated' => date('Y-m-d H:i:s'),
        'status' => 'CORRECT',
        'file' => $file
    ];

    // Compare each field and check if it's different from the current database value
    $changes = false;
    foreach ($newCols as $column => $newValue) {
        if ($currentMetadata[$column] != $newValue) {
            $changes = true;
            break; // If any column differs, flag it for update
        }
    }

    // If there are changes, update the database
    if ($changes) {
        $this->admin->q(
            "UPDATE filemeta SET description = ?, style = ?, php = ?, pug = ?, js = ?, doc = ?, todo = ?, dependent = ?, updated = ?, status = ? WHERE name = ?",
            array_values($newCols)
        );
    } else {
        // If no changes, log or handle as necessary
        xecho("No changes detected for file: $file");
    }
}

/**
 * Commit and push changes to Git.
 */
protected function gitPush($report,$system,$version) {
    // Escape variables for shell safety
    $safeReport = escapeshellarg("$report v.$version");
    // Git commands
    $commands = [
        'git add .',
        "git commit -m $safeReport",
        'git push origin main'
    ];
    foreach ($commands as $cmd) {
        echo "Executing: $cmd\n"; // Debug output
        shell_exec($cmd); // Execute command
    }
}
    /**
     * Process all files recursively in the specified directory.
     */
    protected function runFilemeta($directory = '/var/www/gs/core') {
        $inserted = 0;
        $updated = 0;
        $version=$this->admin->f("select version from systems where name=?",[$system])['version'];
        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory));
        foreach ($files as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['php', 'html', 'css', 'js', 'pug'])) {
                $filepath = $file->getPathname();
                $cols = $this->admin->f("SELECT * FROM filemeta WHERE name = ?", [basename($filepath)]);

                if (!$cols) {
                    $this->insertFile($filepath,$cols,$version);
                    $inserted++;
                } else {
                    $this->updateFile($filepath,$cols,$version);
                    $updated++;
                }
            }
        }

        // Logging the results
        $report= "Files Inserted=$inserted,Updated=$updated";
        $this->gitPush($report,$exists['system'],$version);
    }
}
