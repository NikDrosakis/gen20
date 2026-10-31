<?php
namespace Core\Traits;

use Exception;

/**
 * Poetiveness Algorithm Trait with Deepseek API
 *
 * Υπολογίζει την ποιητικότητα ενός κειμένου βάσει 5 συντελεστών:
 * 1. Conciseness (Συνοπτικότητα)
 * 2. Allegory (Αλληγορία)
 * 3. Rhythm (Ρυθμός)
 * 4. Originality (Πρωτοτυπία)
 * 5. SemanticFlow (Νοηματική Ροή)
 *
 * Τελικός τύπος: Poetiveness = ((Σ+Α+Ρ)/3) × Π × Ροή
 *
 * Access db using (always include db name):
 * $this->db->q("UPDATE gen_gen20net.user SET name=? where id=?",[$name,$id]);
 * $this->db->f("SELECT * FROM gen_gen20net.user where id=?",[$id]); //SELECT ONE
 * $this->db->fa("SELECT * FROM gen_gen20net.user where id=?",[$id]); //SELECT many
 * $this->db->inse("gen_gen20net.user", ["name"=>$name,"firstname"=>$firstname,"lastname"=>$lastname]); //insert returning id
 */
trait Poeta {

    /**
     * DeepSeek API Configuration
     */
    private $deepseekModel = 'deepseek-chat';

    /**
     * Cache configuration
     */
    private $cacheEnabled = true;
    private $cacheTTL = 86400; // 24 ώρες σε seconds

    /**
     * Όρια για χαρακτηρισμό ποιήματος
     */
    const POETRY_THRESHOLD = 50; // 50% για τη βασική βαθμολογία
    const EXCELLENT_THRESHOLD = 75; // 75% για εξαιρετική ποίηση

    /**
     * Υπολογισμός Poetiveness για ένα ποίημα
     *
     * @param string $poem Το κείμενο του ποιήματος
     * @param string $title Ο τίτλος (προαιρετικό)
     * @param string $author Ο συγγραφέας (προαιρετικό)
     * @return array Αποτελέσματα ανάλυσης
     */
    public function calculatePoetiveness(string $poem, string $title = '', string $author = ''): array {
        // Έλεγχος cache
        $cacheKey = $this->getCacheKey($poem);
        if ($this->cacheEnabled && $cached = $this->getFromCache($cacheKey)) {
            return $cached;
        }

        try {
            // 1. Ανάλυση με DeepSeek API
            $analysis = $this->analyzeWithDeepseek($poem);

            // 2. Εξαγωγή συντελεστών
            $conciseness = $analysis['conciseness'] ?? 0;
            $allegory = $analysis['allegory'] ?? 0;
            $rhythm = $analysis['rhythm'] ?? 0;
            $originality = $analysis['originality'] ?? 0;
            $semanticFlow = $analysis['semantic_flow'] ?? 0;

            // 3. Υπολογισμός βάσει τύπου
            $baseScore = ($conciseness + $allegory + $rhythm) / 3;
            $poetiveness = $baseScore * ($originality / 100) * ($semanticFlow / 100);

            // 4. Χαρακτηρισμός
            $isPoetry = $poetiveness >= self::POETRY_THRESHOLD;
            $isExcellent = $poetiveness >= self::EXCELLENT_THRESHOLD;

            // 5. Προετοιμασία αποτελεσμάτων
            $result = [
                'poem' => $poem,
                'title' => $title,
                'author' => $author,
                'conciseness' => round($conciseness, 2),
                'allegory' => round($allegory, 2),
                'rhythm' => round($rhythm, 2),
                'originality' => round($originality, 2),
                'semantic_flow' => round($semanticFlow, 2),
                'base_score' => round($baseScore, 2),
                'poetiveness' => round($poetiveness, 2),
                'is_poetry' => $isPoetry,
                'is_excellent' => $isExcellent,
                'analysis_date' => date('Y-m-d H:i:s'),
                'raw_analysis' => $analysis['raw_response'] ?? null
            ];

            // 6. Αποθήκευση στη βάση
            $this->saveAnalysis($result);

            // 7. Αποθήκευση στο cache
            if ($this->cacheEnabled) {
                $this->saveToCache($cacheKey, $result);
            }

            return $result;

        } catch (Exception $e) {
            // Log error και επιστροφή default values
            error_log("Poeta Trait Error: " . $e->getMessage());
            return $this->getDefaultAnalysis($poem, $title, $author, $e->getMessage());
        }
    }

    /**
     * Ανάλυση ποιήματος μέσω DeepSeek API
     */
    protected function analyzeWithDeepseek(string $poem): array {
        $prompt = $this->buildAnalysisPrompt($poem);

        $payload = [
            'model' => $this->deepseekModel,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Είσαι ένας εξειδικευμένος αλγόριθμος ανάλυσης ποιητικών κειμένων. Πρέπει να επιστρέφεις ΜΟΝΟ JSON με τις βαθμολογίες.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.1, // Χαμηλή θερμοκρασία για συνέπεια
            'max_tokens' => 500,
            'response_format' => ['type' => 'json_object']
        ];

        $ch = curl_init($this->deepseekApiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->deepseekApiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("CURL Error: " . $error);
        }

        if ($httpCode !== 200) {
            throw new Exception("API Error (HTTP $httpCode): " . $response);
        }

        $data = json_decode($response, true);

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new Exception("Invalid API response structure");
        }

        $content = $data['choices'][0]['message']['content'];
        $result = json_decode($content, true);

        // Έλεγχος και εξαγωγή τιμών με default
        return [
            'conciseness' => $result['conciseness'] ?? 50,
            'allegory' => $result['allegory'] ?? 50,
            'rhythm' => $result['rhythm'] ?? 50,
            'originality' => $result['originality'] ?? 50,
            'semantic_flow' => $result['semantic_flow'] ?? 50,
            'raw_response' => $content
        ];
    }

    /**
     * Δημιουργία prompt για το DeepSeek
     */
    protected function buildAnalysisPrompt(string $poem): string {
        return <<<PROMPT
Ανάλυσε το παρακάτω ποίημα και βαθμολόγησέ το σε 5 κριτήρια από 0-100.

Κριτήρια:
1. **conciseness** (Συνοπτικότητα): Πόσο λιτή, πυκνή και αφαιρετική είναι η γλώσσα; (0-100)
   - 0-20: Υπερβολικά φλύαρη, χωρίς ουσία
   - 21-40: Αρκετά περιγραφική, κάποιες περιττές λέξεις
   - 41-60: Ισορροπημένη, αρκετά οικονομική
   - 61-80: Πολύ συνοπτική, κάθε λέξη μετράει
   - 81-100: Εξαιρετικά πυκνή, ποιητική λιτότητα

2. **allegory** (Αλληγορία): Πόσο πλούσιο σε μεταφορές, σύμβολα και βαθύτερα νοήματα είναι; (0-100)
   - 0-20: Κυριολεκτικό, χωρίς μεταφορές
   - 21-40: Περιστασιακές μεταφορές
   - 41-60: Καλό πλέγμα εικόνων
   - 61-80: Πλούσιο συμβολικό σύστημα
   - 81-100: Πολυεπίπεδη αλληγορία, βάθος νοήματος

3. **rhythm** (Ρυθμός): Πόσο δυνατός και αισθητός είναι ο εσωτερικός ή εξωτερικός ρυθμός; (0-100)
   - 0-20: Αρρυθμο, πεζό κείμενο
   - 21-40: Ελάχιστη ρυθμική υφή
   - 41-60: Αισθητός ρυθμός σε σημεία
   - 61-80: Έντονος εσωτερικός ρυθμός
   - 81-100: Μουσικότητα, μετρική ακρίβεια

4. **originality** (Πρωτοτυπία): Πόσο μοναδικό, αντισυμβατικό και προσωπικό είναι το ύφος; (0-100)
   - 0-20: Συμβατικό, κλισέ
   - 21-40: Ελάχιστες πρωτότυπες στιγμές
   - 41-60: Αρκετά προσωπικό ύφος
   - 61-80: Πολύ πρωτότυπο, μοναδικές εικόνες
   - 81-100: Απολύτως μοναδικό, ασύλληπτο ύφος

5. **semantic_flow** (Νοηματική Ροή): Πόσο ομαλά και με λογική αλληλουχία ρέουν οι εικόνες; (0-100)
   - 0-20: Αποσπασματικό, χωρίς συνέχεια
   - 21-40: Αρκετά αποσπασματικό
   - 41-60: Μέτρια ροή, κάποια άλματα
   - 61-80: Καλή ροή, ομαλές μεταβάσεις
   - 81-100: Άψογη ροή, η σκέψη ρέει αβίαστα

Ποίημα:
---
{$poem}
---

Απάντησε ΜΟΝΟ με JSON:
{
    "conciseness": αριθμός 0-100,
    "allegory": αριθμός 0-100,
    "rhythm": αριθμός 0-100,
    "originality": αριθμός 0-100,
    "semantic_flow": αριθμός 0-100
}
PROMPT;
    }

    /**
     * Αποθήκευση ανάλυσης στη βάση δεδομένων
     */
    protected function saveAnalysis(array $result): void {
        try {
            $data = [
                'poem_title' => $result['title'] ?? '',
                'poem_author' => $result['author'] ?? '',
                'poem_content' => $result['poem'],
                'conciseness' => $result['conciseness'],
                'allegory' => $result['allegory'],
                'rhythm' => $result['rhythm'],
                'originality' => $result['originality'],
                'semantic_flow' => $result['semantic_flow'],
                'base_score' => $result['base_score'],
                'poetiveness' => $result['poetiveness'],
                'is_poetry' => $result['is_poetry'] ? 1 : 0,
                'is_excellent' => $result['is_excellent'] ? 1 : 0,
                'analysis_date' => $result['analysis_date'],
                'raw_response' => $result['raw_analysis'] ?? ''
            ];

            $this->db->inse('gen_gen20net.poem_analyses', $data);

        } catch (Exception $e) {
            error_log("Failed to save analysis to database: " . $e->getMessage());
        }
    }

    /**
     * Δημιουργία cache key από το ποίημα
     */
    protected function getCacheKey(string $poem): string {
        return 'poem_' . md5(trim($poem));
    }

    /**
     * Ανάκτηση από cache
     */
    protected function getFromCache(string $key): ?array {
        // Εδώ μπορείς να χρησιμοποιήσεις Redis, Memcached ή απλό file cache
        // Παράδειγμα με file cache
        $cacheFile = sys_get_temp_dir() . '/poeta_' . $key . '.json';
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $this->cacheTTL)) {
            $data = file_get_contents($cacheFile);
            return json_decode($data, true);
        }
        return null;
    }

    /**
     * Αποθήκευση στο cache
     */
    protected function saveToCache(string $key, array $data): void {
        $cacheFile = sys_get_temp_dir() . '/poeta_' . $key . '.json';
        file_put_contents($cacheFile, json_encode($data));
    }

    /**
     * Default analysis in case of error
     */
    protected function getDefaultAnalysis(string $poem, string $title, string $author, string $error): array {
        return [
            'poem' => $poem,
            'title' => $title,
            'author' => $author,
            'conciseness' => 0,
            'allegory' => 0,
            'rhythm' => 0,
            'originality' => 0,
            'semantic_flow' => 0,
            'base_score' => 0,
            'poetiveness' => 0,
            'is_poetry' => false,
            'is_excellent' => false,
            'analysis_date' => date('Y-m-d H:i:s'),
            'raw_analysis' => "Error: " . $error
        ];
    }
}