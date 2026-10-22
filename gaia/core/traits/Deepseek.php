<?php
namespace Core\Traits;
use Exception;

/**
 * Deepseek AI Integration Trait
 *
 * AI integration plan:
 * 1) ContentEdit html correction in RichEditor
 * 2) Create new components based on current style and needs (prompt based)
 * 3) Add image to all empty img fields (cron/automated)
 * 4) AI translation to English, Italian & Spanish
 * 5) Provide documentation to methods and components
 * 6) Suggest updates and improvements to custom db schema and ecosystem
 *
 * Access db using (always include db name):
 * $this->db->q("UPDATE gen_gen20net.user SET name=? where id=?",[$name,$id]);
 * $this->db->f("SELECT * FROM gen_gen20net.user where id=?",[$id]); //SELECT ONE
 * $this->db->fa("SELECT * FROM gen_gen20net.user where id=?",[$id]); //SELECT many
 * $this->db->inse("gen_gen20net.user", ["name"=>$name,"firstname"=>$firstname,"lastname"=>$lastname]); //insert returning id
 */
trait Deepseek {


    private $defaultModel = 'deepseek-chat';
    private $maxRetries = 3;
    private $retryDelay = 2; // seconds

    /**
     * Initialize Deepseek with API key from globals
     */
    protected function initDeepseek() {
        // Get API key from globals table
       // $config = $this->db->f("SELECT val FROM gen_admin.globs WHERE name = 'DEEPSEEK_API_KEY'");
        if (empty($this->deepseekApiKey)) {
            throw new Exception('Deepseek API key not configured. Please add DEEPSEEK_API_KEY to globals table.');
        }

        return $this;
    }

    /**
     * Core API call to Deepseek with retry logic
     */
    protected function deepseekCall($messages, $options = []) {

        $this->initDeepseek();

        $payload = [
            'model' => $options['model'] ?? $this->defaultModel,
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? 0.7,
            'max_tokens' => $options['max_tokens'] ?? 4096,
            'top_p' => $options['top_p'] ?? 0.9,
            'stream' => $options['stream'] ?? false
        ];

        // Add system prompt if not already in messages
        if (!empty($options['system'])) {
            array_unshift($messages, ['role' => 'system', 'content' => $options['system']]);
            $payload['messages'] = $messages;
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->deepseekApiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->deepseekApiKey
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $attempts = 0;
        while ($attempts < $this->maxRetries) {
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($ch);
                $attempts++;
                if ($attempts < $this->maxRetries) {
                    sleep($this->retryDelay * $attempts);
                    continue;
                }
                throw new Exception("Deepseek API connection error: " . $error);
            }

            $decoded = json_decode($response, true);

            if ($httpCode !== 200) {
                $errorMsg = $decoded['error']['message'] ?? "HTTP $httpCode: " . $response;
                $attempts++;
                if ($attempts < $this->maxRetries && $httpCode >= 500) {
                    sleep($this->retryDelay * $attempts);
                    continue;
                }
                throw new Exception("Deepseek API error: " . $errorMsg);
            }

            if (!isset($decoded['choices'][0]['message']['content'])) {
                throw new Exception("Unexpected API response format");
            }

            curl_close($ch);
            return $decoded;
        }

        curl_close($ch);
        throw new Exception("Max retries exceeded");
    }

    /**
     * 1) ContentEdit HTML correction in RichEditor
     * Fixes broken HTML, cleans tags, formats content
     */
    protected function aiFixHtml($html, $options = []) {
        $systemPrompt = "You are an expert HTML cleaner and fixer. Fix the following HTML content:
        1. Close all unclosed tags
        2. Remove empty or broken tags
        3. Ensure proper nesting
        4. Keep the content structure intact
        5. Do not change the text content
        6. Return only the fixed HTML, no explanations";

        $userPrompt = "Fix this HTML:\n\n" . $html;

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => 0.1,
            'max_tokens' => $options['max_tokens'] ?? 8000
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * 2) Create new component based on current style and needs (prompt based)
     */
    protected function aiCreateComponent($prompt, $componentName = null, $options = []) {
            if (is_array($prompt)) {
                $prompt = $prompt['prompt'] ?? $domain[0] ?? null;
            }
        $systemPrompt = "You are an expert React developer. Create a new React component based on the description.
        Requirements:
        1. Use React with hooks (useState, useEffect)
        2. Follow modern React Vite patterns
        3. Include proper propTypes or TypeScript
        4. Make it responsive
        5. Include proper comments/documentation
        6. Return ONLY the component code, no explanations

        Style guidelines:
        - Use functional components
        - Update or Create the .css file version of the component
        - Keep the light/dark ThemeContext installed
        - Follow the existing project structure
        - Include error boundaries where appropriate";

        $userPrompt = "Create a React component with the following requirements:\n\n" . $prompt;
        if ($componentName) {
            $userPrompt .= "\n\nComponent name: " . $componentName;
        }

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => $options['temperature'] ?? 0.7,
            'max_tokens' => $options['max_tokens'] ?? 4096
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * 3) Add image to all empty img fields (cron/automated)
     */
    protected function aiFindImageForContent($contentData, $options = []) {
        $systemPrompt = "You are an AI assistant that helps find appropriate images for content.
        Based on the content provided, suggest:
        1. A search query for an appropriate image (for Unsplash/Pexels)
        2. A description of what the image should show
        3. Suggested image alt text

        Return as JSON:
        {
            \"searchQuery\": \"your search terms\",
            \"imageDescription\": \"description of the image\",
            \"altText\": \"alt text for accessibility\",
            \"keywords\": [\"keyword1\", \"keyword2\"]
        }";

        $userPrompt = "Content title: " . ($contentData['title_en'] ?? $contentData['title_el'] ?? 'Untitled');
        $userPrompt .= "\nContent excerpt: " . ($contentData['excerpt_en'] ?? $contentData['excerpt_el'] ?? '');
        $userPrompt .= "\nContent: " . substr($contentData['description_en'] ?? $contentData['description_el'] ?? '', 0, 500);

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => 0.3,
            'max_tokens' => $options['max_tokens'] ?? 500
        ]);

        $result = trim($response['choices'][0]['message']['content']);

        // Try to parse as JSON
        $json = json_decode($result, true);
        if ($json) {
            return $json;
        }

        // Fallback: extract from text
        return [
            'searchQuery' => substr($result, 0, 100),
            'imageDescription' => $result,
            'altText' => $contentData['title_en'] ?? $contentData['title_el'] ?? 'Image',
            'keywords' => []
        ];
    }

    /**
     * 3b) Auto-fill empty image fields for content
     */
    protected function aiAutoFillImages($domain, $limit = 10, $options = []) {
            if (is_array($domain)) {
                $domain = $domain['domain'] ?? $domain[0] ?? null;
            }
        $publicdb = "gen_" . str_replace('.', '', $domain);

        // Find content with empty img
        $emptyImages = $this->db->fa("SELECT id, title_en, title_el, excerpt_en, excerpt_el, description_en, description_el
                                      FROM {$publicdb}.content
                                      WHERE img IS NULL OR img = ''
                                      LIMIT {$limit}");

        if (empty($emptyImages)) {
            return ['success' => true, 'message' => 'No empty images found', 'processed' => 0];
        }

        $processed = 0;
        $results = [];

        foreach ($emptyImages as $content) {
            try {
                // Get image suggestion from AI
                $suggestion = $this->aiFindImageForContent($content, $options);

                // Here you would integrate with Unsplash/Pexels API to get actual image
                // For now, just log the suggestion
                $imageUrl = $this->fetchImageFromUnsplash($suggestion['searchQuery'] ?? $content['title_en']);

                if ($imageUrl) {
                    // Download and save image
                    $filename = $this->downloadAndSaveImage($imageUrl, $domain, $content['id']);

                    if ($filename) {
                        // Update content with image
                        $this->db->q("UPDATE {$publicdb}.content SET img = ? WHERE id = ?", [$filename, $content['id']]);
                        $processed++;
                        $results[] = [
                            'id' => $content['id'],
                            'title' => $content['title_en'] ?? $content['title_el'],
                            'image' => $filename,
                            'status' => 'success'
                        ];
                    }
                }
            } catch (Exception $e) {
                $results[] = [
                    'id' => $content['id'],
                    'title' => $content['title_en'] ?? $content['title_el'],
                    'error' => $e->getMessage(),
                    'status' => 'failed'
                ];
            }

            // Rate limiting
            if ($options['rate_limit'] ?? true) {
                sleep(1);
            }
        }

        return [
            'success' => true,
            'processed' => $processed,
            'total' => count($emptyImages),
            'results' => $results
        ];
    }

    /**
     * 4) AI translation to English, Italian & Spanish
     */
    protected function aiTranslate($text, $targetLanguage, $options = []) {
        if (is_array($text)) {
            $text = $text['text'] ?? $text[0] ?? null;
        }
        $languages = [
            'en' => 'English',
            'el' => 'Greek',
            'it' => 'Italian',
            'es' => 'Spanish'
        ];

        $targetLang = $languages[$targetLanguage] ?? $targetLanguage;

        $systemPrompt = "You are a professional translator. Translate the following text to {$targetLang}.
        Requirements:
        1. Maintain the original meaning and tone
        2. Use natural, idiomatic language
        3. Preserve any formatting (HTML, markdown) if present
        4. Return ONLY the translated text, no explanations";

        $messages = [
            ['role' => 'user', 'content' => $text]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => $options['temperature'] ?? 0.3,
            'max_tokens' => $options['max_tokens'] ?? 4096
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * 4b) Batch translate content to multiple languages
     */
    protected function aiBatchTranslate($contentId, $languages = ['en', 'it', 'es'], $options = []) {
        $publicdb = "gen_" . str_replace('.', '', $_SERVER['HTTP_HOST']);

        // Fetch content
        $content = $this->db->f("SELECT id, title_el, excerpt_el, description_el FROM {$publicdb}.content WHERE id = ?", [$contentId]);

        if (!$content) {
            return ['success' => false, 'error' => 'Content not found'];
        }

        $results = [];
        $updatedFields = [];

        foreach ($languages as $lang) {
            $fieldPrefix = $lang === 'en' ? 'en' : $lang;

            // Translate title
            if (!empty($content['title_el'])) {
                $translatedTitle = $this->aiTranslate($content['title_el'], $lang, $options);
                $updatedFields["title_{$fieldPrefix}"] = $translatedTitle;
            }

            // Translate excerpt
            if (!empty($content['excerpt_el'])) {
                $translatedExcerpt = $this->aiTranslate($content['excerpt_el'], $lang, $options);
                $updatedFields["excerpt_{$fieldPrefix}"] = $translatedExcerpt;
            }

            // Translate description
            if (!empty($content['description_el'])) {
                $translatedDescription = $this->aiTranslate($content['description_el'], $lang, $options);
                $updatedFields["description_{$fieldPrefix}"] = $translatedDescription;
            }

            $results[$lang] = [
                'title' => $updatedFields["title_{$fieldPrefix}"] ?? null,
                'excerpt' => $updatedFields["excerpt_{$fieldPrefix}"] ?? null,
                'description' => $updatedFields["description_{$fieldPrefix}"] ?? null,
                'status' => 'success'
            ];
        }

        // Update database
        if (!empty($updatedFields)) {
            $setClause = [];
            $params = [];
            foreach ($updatedFields as $field => $value) {
                $setClause[] = "{$field} = ?";
                $params[] = $value;
            }
            $params[] = $contentId;

            $query = "UPDATE {$publicdb}.content SET " . implode(', ', $setClause) . " WHERE id = ?";
            $this->db->q($query, $params);
        }

        return [
            'success' => true,
            'content_id' => $contentId,
            'translations' => $results,
            'updated_fields' => $updatedFields
        ];
    }

    /**
     * 5) Provide documentation to methods and components
     gen20.dev documentation
     */
    protected function aiGenerateDocs($code, $type = 'method', $options = []) {
        $systemPrompt = "You are a technical documentation expert. Generate comprehensive documentation for the following code.

        For methods:
        - Provide a clear description of what the method does
        - Document all parameters (name, type, description)
        - Document return value (type, description)
        - Provide usage examples
        - Note any exceptions that might be thrown

        For components:
        - Provide a description of the component
        - Document all props (name, type, default, description)
        - Provide usage examples
        - Note any dependencies

        Return the documentation in the following format:
        ## Description
        [description]
        ## Parameters
        | Name | Type | Description |
        |------|------|-------------|
        ## Returns
        [return description]
        ## Example
        [code example]";

        $typeLabel = $type === 'method' ? 'PHP method' : 'React component';
        $userPrompt = "Generate documentation for this {$typeLabel}:\n\n" . $code;

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => 0.3,
            'max_tokens' => $options['max_tokens'] ?? 4096
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * 6) Suggest updates and improvements to custom db schema and ecosystem
      gen20.dev ecosystem
     */
    protected function aiSuggestSchemaImprovements($domain, $options = []) {
   // Handle both string and array input
    if (is_array($domain)) {
        $domain = $domain['domain'] ?? $domain[0] ?? null;
    }

    // If still empty or not a string, try to get from globals
    if (empty($domain) || !is_string($domain)) {
        $domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
    }

    $publicdb = "gen_" . str_replace('.', '', $domain);

        // Get all tables and their structure
        $tables = $this->db->show("tables","{$publicdb}");
        $schemaInfo = [];

        foreach ($tables as $table) {

            $columns = $this->db->show("columns","{$publicdb}.{$table}");
            $schemaInfo[$table] = $columns;
        }

        $systemPrompt = "You are a database architect expert. Analyze the following database schema and suggest improvements.
        Consider:
        1. Missing indexes for performance
        2. Data type optimization
        3. Normalization opportunities
        4. Missing fields for common use cases
        5. Foreign key relationships
        6. Best practices for the specific use case

        Provide specific, actionable recommendations with SQL examples.";

        $schemaJson = json_encode($schemaInfo, JSON_PRETTY_PRINT);
        $userPrompt = "Analyze this database schema and suggest improvements:\n\n" . $schemaJson;

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => 0.4,
            'max_tokens' => $options['max_tokens'] ?? 8192
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * 6b) Suggest ecosystem improvements (architecture, tools, processes)
     gen20.dev Ecosystem
     */
    protected function aiSuggestEcosystemImprovements($context = [], $options = []) {
        $systemPrompt = "You are a software architect expert. Analyze the following system context and suggest improvements.
        Consider:
        1. Architecture patterns
        2. Technology stack recommendations
        3. Development workflow improvements
        4. Performance optimizations
        5. Security best practices
        6. Scalability improvements

        Provide specific, actionable recommendations with rationale.";

        $contextText = json_encode($context, JSON_PRETTY_PRINT);
        $userPrompt = "Analyze this system context and suggest improvements:\n\n" . $contextText;

        $messages = [
            ['role' => 'user', 'content' => $userPrompt]
        ];

        $response = $this->deepseekCall($messages, [
            'system' => $systemPrompt,
            'temperature' => 0.4,
            'max_tokens' => $options['max_tokens'] ?? 8192
        ]);

        return trim($response['choices'][0]['message']['content']);
    }

    /**
     * Helper: Fetch image from Unsplash
     Compoment Media
     */
    private function fetchImageFromUnsplash($query) {
        $unsplashKey = $this->db->f("SELECT val FROM gen_admin.globs WHERE name = 'UNSPLASH_API_KEY'");
        if (!$unsplashKey) {
            return null;
        }

        $url = "https://api.unsplash.com/search/photos?query=" . urlencode($query) . "&per_page=1";
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Client-ID ' . $unsplashKey['val']
            ]
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        if (!empty($data['results'][0]['urls']['regular'])) {
            return $data['results'][0]['urls']['regular'];
        }

        return null;
    }

    /**
     * Helper: Download and save image
     Component Media
     */
    private function downloadAndSaveImage($imageUrl, $domain, $contentId) {
        $publicDir = "/var/www/gs/media/{$domain}/";
        $filename = "ai_" . $contentId . "_" . time() . ".jpg";
        $filepath = $publicDir . $filename;

        // Ensure directory exists
        if (!is_dir($publicDir)) {
            mkdir($publicDir, 0755, true);
        }

        $ch = curl_init($imageUrl);
        $fp = fopen($filepath, 'wb');
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $success = curl_exec($ch);
        curl_close($ch);
        fclose($fp);

        if ($success && file_exists($filepath)) {
            return $filename;
        }

        return null;
    }

    /**
     * API Wrapper: AI Chat endpoint
     At Component Chat
     */
    protected function apiAiChat() {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $context = $input['context'] ?? '';
        $system = $input['system'] ?? "You are a helpful assistant for the GEN20 CMS platform. You help with content creation, code generation, and system management.";
        $model = $input['model'] ?? 'deepseek-chat';

        if (empty($message)) {
            return ['success' => false, 'error' => 'Message is required'];
        }

        try {
            $messages = [];
            if ($context) {
                $messages[] = ['role' => 'user', 'content' => "Context: " . $context];
            }
            $messages[] = ['role' => 'user', 'content' => $message];

            $response = $this->deepseekCall($messages, [
                'system' => $system,
                'model' => $model,
                'temperature' => 0.7,
                'max_tokens' => 4096
            ]);

            return [
                'success' => true,
                'response' => $response['choices'][0]['message']['content'],
                'usage' => $response['usage'] ?? null
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

}