<?php
/** @filemetacore.description creates file to db dynamic mechanism

 why important the manifest in core folder?
 it's important to
  dependencies (ie methods from other functions)


@filemetacore.updatelog
v.1 basic Trait, batch saving all files, changing all the style writing, having basic capabilities & automating documentation and logging


 @filemetacore.features all classes and methods lists documented


@filemetacore.todo
- connect to Ermis for auto-update each file
- logging all load data
- having sense

Existing Schema
CREATE TABLE `filemetacore` (
  `id` int(11) NOT NULL,
  `inclass` varchar(155) DEFAULT NULL,
  `inline` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(150) NOT NULL COMMENT 'method-core',
  `description` text DEFAULT NULL,
  `doc` text DEFAULT NULL COMMENT 'md',
  `type` enum('class','js','php/html','pug','style-css') NOT NULL,
  `status` enum('CORRECT','DEPRECATED','NEEDUPDATE','PENDING','FAILED') NOT NULL DEFAULT 'PENDING',
  `dependent` text DEFAULT NULL,
  `todo` text DEFAULT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
  `updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` smallint(6) DEFAULT 1,
  `notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `features` text DEFAULT NULL,
  `updatelog` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


*/
namespace Core\Traits;

trait Filemeta {
    // @filemetacore.description Extract dependent classes (from `use` statements)
    protected function extractDependencies($content) {
        preg_match_all('/^use\s+(.+);$/m', $content, $matches);
        return implode(',', $matches[1] ?? []);
    }

    // @filemetacore.description  Extract PHP content
    protected function extractPHP($content) {
        return preg_match('/<\?php(.*?)(?:\?>|$)/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // @filemetacore.description  Extract Pug content
    protected function extractPug($content) {
        return preg_match('/<template lang="pug">(.*?)<\/template>/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // @filemetacore.description  Extract CSS styles
    protected function extractStyle($content) {
        return preg_match('/<style.*?>(.*?)<\/style>/s', $content, $matches) ? trim($matches[1]) : null;
    }

    // @filemetacore.description Extract JavaScript
    protected function extractJS($content) {
        return preg_match('/<script.*?>(.*?)<\/script>/s', $content, $matches) ? trim($matches[1]) : null;
    }

// @filemetacore.description Extract structured metadata (e.g., @version, @description) and general comments from content.
protected function extractComments($content) {
    // @filemetacore.features Regex to extract PHP doc comments (/** ... */)
    preg_match_all('/\/\*\*(.*?)\*\//s', $content, $matches);

    // @filemetacore.features Clean and trim the comments, removing /** and */
    $cleaned = array_map(function ($comment) {
        return trim(preg_replace(['/^\/\*\*/', '/\*\//', '/^\s*\*\s?/m'], '', $comment));
    }, $matches[1] ?? []);

    // @filemetacore.features Metadata fields we are looking for
    $metadataFields = ['version', 'description', 'todo', 'updatelog', 'features'];
    $metadata = array_fill_keys($metadataFields, '');

    $doc = [];
    $todo = [];
    $description = '';

    foreach ($cleaned as $comment) {
        // @filemetacore.features Extract metadata fields using @field syntax
        foreach ($metadataFields as $field) {
            if (preg_match('/@' . $field . '\s+(.*)/sU', $comment, $match)) {
                $metadata[$field] .= trim($match[1]) . "\n";
            }
        }

        // @filemetacore.features Handle TODO separately for other non-structured comments
        if (stripos($comment, '@todo') !== false) {
            $todo[] = $comment;
        } elseif (!preg_match('/@\w+/', $comment)) {
            // @filemetacore.features Treat as general description if no metadata tags are found
            $description .= $comment . "\n";
        }
    }

    // @filemetacore.features Extract function-level comments (optional feature)
    preg_match_all('/\/\*\*\s*(.*?)\*\//s', $content, $functionMatches);
    $functionDocs = [];
    foreach ($functionMatches[1] ?? [] as $functionComment) {
        if (preg_match('/function\s+(\w+)/', $functionComment, $funcNameMatches)) {
            $functionDocs[$funcNameMatches[1]] = trim(preg_replace(['/^\/\*\*/', '/\*\//'], '', $functionComment));
        }
    }

    // @filemetacore.features Combine DOC comments with function-specific DOC comments
    $doc = array_merge($doc, $functionDocs);

    return [
        'version' => trim($metadata['version']),
        'description' => trim($metadata['description']) ?: trim($description),
        'todo' => trim($metadata['todo']),
        'updatelog' => trim($metadata['updatelog']),
        'features' => trim($metadata['features']),
        'doc' => implode("\n", $doc),
    ];
}

    /**
     @filemetacore.description
     General function to extract content between tags.
     */
    protected function extractSection($content, $startTag, $endTag) {
        preg_match("/$startTag(.*?)$endTag/s", $content, $matches);
        return trim($matches[1] ?? '');
    }

    /**
     @filemetacore.description
     Insert metadata for a single file into the database.
     */
    protected function insertFile(string $file,$cols=[]) {
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
            'version' => $comments['version'],
            'status' => 'PENDING',
            'features' => $comments['features'],
            'updatelog' => $comments['updatelog']
        ];
        $this->db->inse("gen_admin.filemeta", $cols);
    }

/**
     @filemetacore.description
     Update metadata for an existing file in the database.
 */
protected function updateFile(string $file, $cols = []) {
    // Fetch the current metadata from the database
    $currentMetadata = $this->db->f("SELECT * FROM gen_admin.filemeta WHERE name = ?", [basename($file)]);

    // Get the content of the file
    $content = file_get_contents($file);

    // Extract the comments once and reuse for description, doc, and todo
    $comments = $this->extractComments($content);

    // @filemetacore.features Prepare the new metadata
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

    // @filemetacore.features Compare each field and check if it's different from the current database value
    $changes = false;
    foreach ($newCols as $column => $newValue) {
        if ($currentMetadata[$column] != $newValue) {
            $changes = true;
            break; // If any column differs, flag it for update
        }
    }

    // @filemetacore.features If there are changes, update the database
    if ($changes) {
        $this->db->q(
            "UPDATE filemeta SET description = ?, style = ?, php = ?, pug = ?, js = ?, doc = ?, todo = ?, dependent = ?, updated = ?, status = ? WHERE name = ?",
            array_values($newCols)
        );
    } else {
        // @filemetacore.features If no changes, log or handle as necessary
        xecho("No changes detected for file: $file");
    }
}

/**
@filemetacore.description
Commit and push changes to Git.
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
@filemetacore.description
Process all files recursively in the specified directory.
*/
    protected function runFilemeta($directory = '/var/www/gs/core') {
        $inserted = 0;
        $updated = 0;
        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory));
        foreach ($files as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['php', 'html', 'css', 'js', 'pug'])) {
                $filepath = $file->getPathname();
                $cols = $this->db->f("SELECT * FROM gen_admin.filemeta WHERE name = ?", [basename($filepath)]);

                if (!$cols) {
                    $this->insertFile($filepath,$cols);
                    $inserted++;
                } else {
                    $this->updateFile($filepath,$cols);
                    $updated++;
                }
            }
        }

        // @filemetacore.features Logging the results
        $report= "Files Inserted=$inserted,Updated=$updated";
        $this->gitPush($report,$exists['system'],$version);
    }
}
