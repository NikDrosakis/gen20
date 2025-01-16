<style>
.container {
  padding: 20px;
}

.date-nav {
  margin-bottom: 20px;
}

#processTable {
  width: 100%;
  border-collapse: collapse;
}

#processTable th, #processTable td {
  border: 1px solid #ddd;
  padding: 8px;
}

#processTable th {
  background-color: #f4f4f4;
}

input, textarea, select {
  width: 100%;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>


<!----BUILD automatic TABLE-->


 <div class="container">
    <div class="date-nav">
      <button id="prevDay">Previous Day</button>
      <span id="currentDate"></span>
      <button id="nextDay">Next Day</button>
    </div>
<h2>Tasks Table</h2>
    <table id="processTable">
      <thead>
        <tr>
          <th>Start</th>
          <th>Progress</th>
          <th>Description</th>
          <th>Duration Estimation</th>
          <th>To-Do</th>
          <th>Bugs</th>
          <th>Current Duration</th>
          <th>System</th>
          <th>Cubo</th>
        </tr>
      </thead>
      <tbody>
        <!-- 20 Rows of Data -->
        <!-- Sample Row -->
        <tr>
          <td><input type="time" class="start-time"></td>
          <td><input type="number" class="progress"></td>
          <td><textarea class="description"></textarea></td>
          <td><input type="number" class="duration-estimation"></td>
          <td><textarea class="todo"></textarea></td>
          <td><textarea class="bugs"></textarea></td>
          <td><input type="number" class="current-duration"></td>
          <td>
            <select class="system">
              <option value="system1">System 1</option>
              <option value="system2">System 2</option>
              <!-- Add more options as needed -->
            </select>
          </td>
          <td><input type="text" class="cubo"></td>
        </tr>
        <!-- Repeat the above row 19 more times -->
      </tbody>
    </table>

    <button id="startProcess">Start Process</button>
  </div>

  <script>
      // script.js

      $(document).ready(function() {
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        let currentDate = new Date();

        const updateDateDisplay = () => {
          $('#currentDate').text(formatDate(currentDate));
        };

        const updateDiary = () => {
          const formattedDate = formatDate(currentDate);
          $('input, textarea, select').each(function() {
            const name = $(this).attr('class');
            const value = $(this).val();
            await gs.api.admin.q('/update', { date: formattedDate, field: name, value: value });
          });
        };

        $('#prevDay').click(function() {
          currentDate.setDate(currentDate.getDate() - 1);
          updateDateDisplay();
          // Optionally, reload table data for the new date
        });

        $('#nextDay').click(function() {
          currentDate.setDate(currentDate.getDate() + 1);
          updateDateDisplay();
          // Optionally, reload table data for the new date
        });

        $('#startProcess').click(function() {
          const processId = 'process-' + new Date().getTime(); // Or any other unique identifier
          console.log('Process ID:', processId);
          // Optionally, send process ID to server
        });

        $('#processTable').on('input change', 'input, textarea, select', function() {
          updateDiary();
        });

        updateDateDisplay();
      });

      </script>

