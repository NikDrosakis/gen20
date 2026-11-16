-- GEN20 / Quote Cubo
-- Native installation: classification + content only.
-- Run with the target domain database selected (USE database_name).
-- Safe to re-run: classification and quote rows are checked before insertion.

SET @quotes_classification_name := 'quotes';

-- Create the classification only when it does not already exist.
INSERT INTO classification (name)
SELECT @quotes_classification_name
    WHERE NOT EXISTS (
    SELECT 1
    FROM classification
    WHERE name = @quotes_classification_name
);

-- Resolve the native classification ID dynamically.
SET @quotes_classification_id := (
    SELECT id
    FROM classification
    WHERE name = @quotes_classification_name
    ORDER BY id
    LIMIT 1
);

-- Seed the poems as native content.
-- userid is intentionally fixed to 1.
INSERT INTO content (userid, classification, title, description)
SELECT 1, @quotes_classification_id, q.title, q.description
FROM (
         SELECT
             'η πεταλούδα' AS title,
             'καιρός για το δρόμο της πεταλούδας ελευθερίας' AS description
         UNION ALL SELECT
                       'η πεταλούδα',
                       'οι φυλακές γεννούν φυλακές'
         UNION ALL SELECT
                       'ο αγρότης',
                       'Κάθε γη, μια φυλακή / κι οι ουρανοί που μας ελευθέρωναν / μας πρόδωσαν - κι ήταν καλό'
         UNION ALL SELECT
                       'ο αγρότης',
                       'πλάι στην τσουκνίδα, η μολόχα, πλάι στο ερώτημα / η απόκριση, πλάι στην ήττα, η νίκη, πλάι στο θάνατο, η ζωή'
         UNION ALL SELECT
                       'ο γεφυροποιός',
                       'Η καρδιά του δοσμένη στις ξύλινες γέφυρες / να οικοδομεί στα δάση σκήνωματα / με κέδρο, κυπαρίσσι'
         UNION ALL SELECT
                       'ο γεφυροποιός',
                       'Γεφυροποιό τον είπαν / κι ο τύμβος του / θεμέλιος βράχος στο νερό'
         UNION ALL SELECT
                       'τα πρόσημα',
                       'στο μοναχικό του δρόμο για το ακέραιο / έστω μια μονάδα διαθέσιμη ν’ αθροίζει, έστω να μεταβάλει / πρόσημο'
         UNION ALL SELECT
                       'ο εξοστρακισμός',
                       'Την έσκισα κι ας μου πήρε χρόνια να την ράψω'
         UNION ALL SELECT
                       'η τεχνική νοημοσύνη',
                       'Το Είναι, πια, εκεί δεν κατοικεί, τ’ άγρια φυτά του / δε μεγαλώνουν, μόνο σπαρτά σε θερμοκήπια'
         UNION ALL SELECT
                       'η Οφηλία',
                       'βάτραχοι γίνονται οι τρελοί και ξεπηδάνε ποιητές / κι ας κοάζουν ολομόναχοι σε ποταμούς πνιγμένων'
     ) AS q
WHERE @quotes_classification_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM content c
    WHERE c.classification = @quotes_classification_id
      AND c.title = q.title
      AND c.description = q.description
);

-- Result: classification ID used by the Quote Cubo.
SELECT
    DATABASE() AS database_name,
    @quotes_classification_id AS quotes_classification_id,
    (
        SELECT COUNT(*)
        FROM content
        WHERE classification = @quotes_classification_id
    ) AS quotes_count;