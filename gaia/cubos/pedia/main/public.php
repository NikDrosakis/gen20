<div class="cubo encyclopedia-analysis">
  <style>
    .encyclopedia-analysis {
      border: 1px solid #0073e6;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      text-align: center;
    }
  </style>

  <h3>Encyclopedia Analysis</h3>
  <p id="encyclopedia-verse-display"></p>
  <p>Insight and contextual analysis of the lyric:</p>
  <textarea readonly placeholder="Generated analysis will appear here..."></textarea>

  <script>
      function fetchPediaAnalysis(verse) {
        fetch('http://localhost:8000/pedia/', {  // Replace with your FastAPI server URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: verse,
            max_length: 500,  // Optional, you can adjust the max length as needed
          }),
        })
        .then(response => response.json())
        .then(data => {
          // Update the Pedia Cubo with the analysis or generated content
          displayPediaAnalysis(data.analysis);
        })
        .catch(error => {
          console.error('Error fetching poetic analysis:', error);
        });
      }

      function displayPediaAnalysis(analysisText) {
        // Display the generated poetic analysis in the Pedia Cubo
        const pediaCubo = document.getElementById("pedia-cubo");
        pediaCubo.innerHTML = `<p>${analysisText}</p>`;
      }


    document.getElementById('main-verse').addEventListener('input', function() {
      document.getElementById('encyclopedia-verse-display').textContent = this.value;
    });
  </script>
</div>
