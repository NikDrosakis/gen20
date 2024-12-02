<div class="cubo blackboard">
  <style>
    .blackboard {
      border: 1px solid #333;
      background-color: #f0f0f0;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      text-align: center;
    }
  </style>

  <h3>Collaborative Blackboard</h3>
  <p id="blackboard-verse-display"></p>
  <p>AI and user icons involved in the creative process:</p>
  <div class="user-icons">
    <img src="user1.png" alt="User 1" title="User 1">
    <img src="user2.png" alt="User 2" title="User 2">
    <img src="ai-icon.png" alt="AI" title="AI Participant">
  </div>

  <script>
    document.getElementById('main-verse').addEventListener('input', function() {
      document.getElementById('blackboard-verse-display').textContent = this.value;
    });
  </script>
</div>
