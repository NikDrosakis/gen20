<div class="cubo poet-attachments">
  <style>
    .poet-attachments {
      border: 1px solid #aaa;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      text-align: center;
    }
  </style>

  <h3>Poet Files Attachment</h3>
  <p id="poet-verse-display"></p>
  <p>Upload or manage files related to your poetry:</p>
  <input type="file" multiple>

  <script>
    document.getElementById('main-verse').addEventListener('input', function() {
      document.getElementById('poet-verse-display').textContent = this.value;
    });
  </script>
</div>
