<?php
namespace Core;
trait CuboLogic {
    // Protected function to check if the Italian word is correct
    protected function checkItalian($input, $correct_italian) {
        return strtolower(trim($input)) === strtolower(trim($correct_italian)) ? 'correct' : 'incorrect';
    }

    // Protected function to check if the Spanish word is correct
    protected function checkSpanish($input, $correct_spanish) {
        return strtolower(trim($input)) === strtolower(trim($correct_spanish)) ? 'correct' : 'incorrect';
    }

    // Function to get performance feedback for both Italian and Spanish
    protected function getFeedback($input_italian, $input_spanish, $correct_italian, $correct_spanish) {
        $feedback_italian = $this->checkItalian($input_italian, $correct_italian);
        $feedback_spanish = $this->checkSpanish($input_spanish, $correct_spanish);

        return [
            'feedback_italian' => $feedback_italian,
            'feedback_spanish' => $feedback_spanish
        ];
    }
}
namespace Core;

class CuboTrilingo extends Gen{
    use CuboLogic; // Include the CuboLogic trait
public function __construct() {
           parent::__construct();
    }

    public function getWords() {
        // Example: Fetch words from the database
        $words = $this->db->fa("SELECT * FROM cubo_trilingo_word");

        return $words;
    }

    public function checkUserInput($input_italian, $input_spanish, $word_id) {
        // Fetch the correct words from the database using the word ID
        $word = $this->db->fa("SELECT italian, spanish FROM cubo_trilingo_word WHERE id = ?", [$word_id]);

        // Get the feedback (correct or incorrect)
        return $this->getFeedback($input_italian, $input_spanish, $word['italian'], $word['spanish']);
    }
}
?>
<h1>Trilingo Cubo: Learn Italian & Spanish</h1>
    <style>
        .correct {
            color: green;
            font-size: 20px;
        }
        .incorrect {
            color: red;
            font-size: 20px;
        }
    </style>
       <table border="1">
              <thead>
                  <tr>
                      <th>English</th>
                      <th>Italian</th>
                      <th>Spanish</th>
                      <th>Feedback</th>
                  </tr>
              </thead>
              <tbody id="words-table">
                  <!-- Dynamically filled by PHP -->
                  <?php
                  $tri= new CuboTrilingo();
                  $words = $tri->getWords(); // Fetch words from the database
                  foreach ($words as $word) {
                      echo "<tr>
                          <td>" . htmlspecialchars($word['english']) . "</td>
                          <td><input type='text' class='italian' data-id='" . $word['id'] . "' placeholder='Italian'></td>
                          <td><input type='text' class='spanish' data-id='" . $word['id'] . "' placeholder='Spanish'></td>
                          <td><span class='feedback'></span></td>
                      </tr>";
                  }
                  ?>
              </tbody>
          </table>

    <script>
         document.querySelectorAll('.italian, .spanish').forEach(input => {
                    input.addEventListener('keyup', function() {
                        const row = input.closest('tr');
                        const italianInput = row.querySelector('.italian');
                        const spanishInput = row.querySelector('.spanish');
                        const feedback = row.querySelector('.feedback');
                        const wordId = input.getAttribute('data-id');
                        const italianValue = italianInput.value;
                        const spanishValue = spanishInput.value;

                        // Call PHP backend for checking
                        fetch(`check_input.php?word_id=${wordId}&italian=${italianValue}&spanish=${spanishValue}`)
                            .then(response => response.json())
                            .then(data => {
                                // Show tick or cross based on feedback
                                if (data.feedback_italian === 'correct' && data.feedback_spanish === 'correct') {
                                    feedback.innerHTML = '✔️';
                                    feedback.className = 'correct';
                                } else {
                                    feedback.innerHTML = '❌';
                                    feedback.className = 'incorrect';
                                }
                            });
                    });
                });
    </script>