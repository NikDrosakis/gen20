<?php
namespace Core;

trait Filemeta2 {
    /**
     * Configuration constants
     */
    private const SUPPORTED_EXTENSIONS = ['php', 'html', 'css', 'js', 'pug'];
    private const GIT_BRANCH = 'main';

    /**
     * Extract dependent classes (from `use` statements)
     */
    protected function extractDependencies(string $content): string {
        preg_match_all('/^use\s+(.+);$/m', $content, $matches);
        return implode(',', $matches[1] ?? []);
    }

    /**
     * Extract content between tags with error handling
     */
    protected function extractContent(string $content, string $pattern): ?string {
        if (preg_match($pattern, $content, $matches)) {
            return trim($matches[1] ?? '');
        }
        return null;
    }

    /**
     * Extract PHP content with proper error handling
     */
    protected function extractPHP(string $content): ?string {
        return $this->extractContent($content, '/<\?php(.*?)(?:\?>|$)/s');
    }

    /**
     * Extract structured metadata with improved organization
     */
    protected function extractComments(string $content): array {
        preg_match_all('/\/\*\*(.*?)\*\//s', $content, $matches);

        $metadata = [
            'version' => '',
            'description' => '',
            'todo' => '',
            'updatelog' => '',
            'features' => '',
            'doc' => []
        ];

        foreach ($matches[1] ?? [] as $comment) {
            $cleanComment = trim(preg_replace(['/^\/\*\*/', '/\*\//', '/^\s*\*\s?/m'], '', $comment));

            // Extract metadata fields
            foreach (array_keys($metadata) as $field) {
                if (preg_match('/@' . $field . '\s+(.*)/sU', $cleanComment, $match)) {
                    $metadata[$field] .= trim($match[1]) . "\n";
                }
            }

            // Store general description if no metadata tags found
            if (!preg_match('/@\w+/', $cleanComment)) {
                $metadata['description'] .= $cleanComment . "\n";
            }
        }

        return array_map('trim', $metadata);
    }

    /**
     * Insert file metadata with proper validation and error handling
     */
    protected function insertFile(string $file): bool {
        try {
            if (!file_exists($file)) {
                throw new \RuntimeException("File not found: $file");
            }

            $content = file_get_contents($file);
            if ($content === false) {
                throw new \RuntimeException("Failed to read file: $file");
            }

            $comments = $this->extractComments($content);

            $cols = [
                'system' => 'core',
                'name' => basename($file),
                'description' => $comments['description'],
                'style' => $this->extractContent($content, '/<style.*?>(.*?)<\/style>/s'),
                'php' => $this->extractPHP($content),
                'pug' => $this->extractContent($content, '/<template lang="pug">(.*?)<\/template>/s'),
                'js' => $this->extractContent($content, '/<script.*?>(.*?)<\/script>/s'),
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

            return $this->db->inse("gen_admin.filemeta", $cols);
        } catch (\Exception $e) {
            // Log the error appropriately
            error_log("Error inserting file metadata: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update file metadata with proper change detection and validation
     */
    protected function updateFile(string $file): bool {
        try {
            $basename = basename($file);
            $currentMetadata = $this->db->f("SELECT * FROM gen_admin.filemeta WHERE name = ?", [$basename]);

            if (!$currentMetadata) {
                throw new \RuntimeException("No existing metadata found for file: $basename");
            }

            $content = file_get_contents($file);
            if ($content === false) {
                throw new \RuntimeException("Failed to read file: $file");
            }

            $comments = $this->extractComments($content);
            $newMetadata = [
                'description' => $comments['description'],
                'style' => $this->extractContent($content, '/<style.*?>(.*?)<\/style>/s'),
                'php' => $this->extractPHP($content),
                'pug' => $this->extractContent($content, '/<template lang="pug">(.*?)<\/template>/s'),
                'js' => $this->extractContent($content, '/<script.*?>(.*?)<\/script>/s'),
                'doc' => $comments['doc'],
                'todo' => $comments['todo'],
                'dependent' => $this->extractDependencies($content),
                'updated' => date('Y-m-d H:i:s'),
                'status' => 'CORRECT'
            ];

            // Compare and update only if changes exist
            $changes = array_diff_assoc($newMetadata, array_intersect_key($currentMetadata, $newMetadata));

            if (!empty($changes)) {
                $sql = "UPDATE gen_admin.filemeta SET " .
                       implode(', ', array_map(fn($key) => "$key = ?", array_keys($newMetadata))) .
                       " WHERE name = ?";

                return $this->db->q($sql, [...array_values($newMetadata), $basename]);
            }

            return true;
        } catch (\Exception $e) {
            error_log("Error updating file metadata: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process files with improved error handling and logging
     */
    protected function runFilemeta(string $directory = '/var/www/gs/core'): array {
        $stats = ['inserted' => 0, 'updated' => 0, 'errors' => 0];

        try {
            if (!is_dir($directory)) {
                throw new \RuntimeException("Invalid directory: $directory");
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if ($file->isFile() && in_array($file->getExtension(), self::SUPPORTED_EXTENSIONS)) {
                    $filepath = $file->getPathname();
                    $exists = $this->db->f("SELECT * FROM gen_admin.filemeta WHERE name = ?", [basename($filepath)]);

                    if (!$exists) {
                        $stats['inserted'] += $this->insertFile($filepath) ? 1 : 0;
                    } else {
                        $stats['updated'] += $this->updateFile($filepath) ? 1 : 0;
                    }
                }
            }

            // Only push to git if there were actual changes
            if ($stats['inserted'] > 0 || $stats['updated'] > 0) {
                $this->gitPush(
                    sprintf("Files Inserted=%d,Updated=%d", $stats['inserted'], $stats['updated']),
                    $exists['system'] ?? 'core',
                    $exists['version'] ?? '1.0'
                );
            }

            return $stats;
        } catch (\Exception $e) {
            error_log("Error in runFilemeta: " . $e->getMessage());
            $stats['errors']++;
            return $stats;
        }
    }
}