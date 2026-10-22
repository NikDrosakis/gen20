<style>
    .daily-process-container {
        margin: 0 auto;
        font-family: sans-serif;
    }

    .date-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    .arrow-button {
        padding: 8px 12px;
        background-color: #eee;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        text-align: left;
        padding: 8px;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f5f5f5;
    }
    input[type="number"], input[type="text"], input[type="time"], textarea, select {
        width: 100%;
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }
</style>
<div class="daily-process-container">
    <h2>
        <div class="date-controls">
        <button id="prevDay" class="arrow-button"><< </button>
        Daily Process Table &nbsp;
                <span id="currentDate"></span>
                <button id="nextDay" class="arrow-button"> >></button>
            </div>
        </h2>



    <table>
        <thead>
            <tr>
                <th>Start</th>
                <th>System</th>
                <th>Cubo</th>
                <th>Progress</th>
                <th>Action</th>
                <th>Duration Estimation</th>
                <th>To Do</th>
                <th>Bugs</th>
                <th>Current Duration</th>
                <th>Auto Start/End</th>
            </tr>
        </thead>
        <tbody id="processTableBody">
            <!-- 20 rows will be generated here by JavaScript -->
        </tbody>
    </table>
</div>
<script>
    const currentDateSpan = document.getElementById('currentDate');
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');
    const processTableBody = document.getElementById('processTableBody');

    // Initialize with today's date
    let currentDate = new Date();
    displayDate();

    // Function to display the date
    function displayDate() {
      currentDateSpan.textContent = currentDate.toLocaleDateString();
    }

    // Event listeners for previous/next day buttons
    prevDayButton.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      displayDate();
      loadTableData();
    });

    nextDayButton.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      displayDate();
      loadTableData();
    });
    // Function to generate table rows
    function generateTableRows() {
        let rowsHTML = '';
        for (let i = 0; i < 7; i++) {
            rowsHTML += `
                <tr>
                    <td><button class="start-button" data-process-id="${i+1}">Start</button></td>
                    <td>
                        <select class="system-select">
                            <option value="">Select System</option>
                            <!-- Add your system options here -->
                            <option value="system1">System 1</option>
                            <option value="system2">System 2</option>
                        </select>
                    </td>
                    <td><input type="text" class="cubo-input"></td>
                    <td><input type="number" class="progress-input" min="0" max="100" value="0"></td>
                    <td><textarea class="action-textarea"></textarea></td>
                    <td><input type="number" class="duration-estimation-input" min="0"></td>
                    <td><textarea class="todo-textarea"></textarea></td>
                    <td><textarea class="bugs-textarea"></textarea></td>
                    <td><input type="number" class="current-duration-input" min="0" value="0"></td>
                    <td>
                        <input type="time" class="auto-start-time">
                        <input type="time" class="auto-end-time">
                    </td>
                </tr>
            `;
        }
        processTableBody.innerHTML = rowsHTML;

        // Add event listeners after generating rows
        addInputEventListeners();
    }

    // Function to add event listeners to inputs
    function addInputEventListeners() {
      const inputs = processTableBody.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('input', updateTask); // Update on any input change
        input.addEventListener('click', updateTask); // Update on click (for buttons)
      });
    }

    // Function to load table data from your backend (using AJAX)
    function loadTableData() {
        // 1. Get the date for the request (currentDate)
        const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD format

        // 2. Make the AJAX request to your PHP API
        $.get('/your-api-endpoint', { date: formattedDate }, function(data) {
            // 3. Process the data and update the table rows
            // ... (Your logic to populate table cells with data) ...
        }, 'json');
    }

    // Function to update task data (send to backend)
    function updateTask(event) {
        const row = event.target.closest('tr'); // Get the parent row of the input
        const processId = row.querySelector('.start-button').dataset.processId;

        // Collect data from the row
        const taskData = {
            processId: processId,
            system: row.querySelector('.system-select').value,
            cubo: row.querySelector('.cubo-input').value,
            // ... get data from other input fields ...
        };

        // Send data to your PHP backend using $.post or $.ajax
        $.post('/your-api-endpoint', taskData, function(response) {
            // ... handle the response from your PHP API (e.g., display success message) ...
        }, 'json');
    }

    // Initial table generation
    generateTableRows();
</script>