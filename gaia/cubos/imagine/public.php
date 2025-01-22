<div class="cubo image-creation">
  <style>
    .image-creation {
      border: 1px solid #555;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      text-align: center;
    }
    #image-output {
      margin-top: 15px;
    }
  </style>

  <h3>Image Creation from Verse</h3>
  <p id="image-creation-verse-display"></p>
  <button onclick="generateImage()">Create Image</button>
  <div id="image-output"></div>

  <script>
    document.getElementById('main-verse').addEventListener('input', function() {
      document.getElementById('image-creation-verse-display').textContent = this.value;
    });

    function generateImage() {
      const verse = document.getElementById('main-verse').value;
      if (verse) {
        const output = document.getElementById('image-output');
        output.innerHTML = '<p>Generated image for: "' + verse + '"</p><img src="placeholder-image.jpg" alt="Generated Image">';
      } else {
        alert('Please enter a verse.');
      }
    }
  </script>
</div>
