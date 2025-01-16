<!----DIARY TIMETABLE-->
  <style>
      #sidebar {
          width: 200px;
          padding: 10px;
          float: left;
          border-right: 1px solid #ddd;
          height: 100vh;
          overflow-y: auto;
          background-color: #f4f4f4;
      }

      #sidebar .date-entry {
          padding: 10px;
          cursor: pointer;
          text-align: center;
      }

      #sidebar .date-entry:hover {
          background-color: #e0e0e0;
      }

          .container {
                  padding: 20px;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  width: 70%;
              }

              #diary {
                  display: flex;
                  flex-direction: column;
                      width: 100%;
              }

              .diary-entry {
                  display: flex;
                  margin-bottom: 10px;
                  align-items: center;
              }

              .time {
                  width: 80px;
                  text-align: center;
                  padding-right: 10px;
                  font-weight: bold;
                  font-size: 16px;
                  color: #333;
              }

              .task-entry {
                  flex-grow: 1;
                  padding: 8px;
                  font-size: 16px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  margin-left: 10px;
              }

              button {
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-size: 16px;
                  margin-bottom: 20px;
                  width: 100%;
                  transition: background-color 0.3s;
              }

              button:hover {
                  background-color: #45a049;
              }

              input[type="text"] {
                  font-size: 16px;
              }
          </style>


<div id="sidebar">
  <!-- Date entries will be added here dynamically -->
</div>


          <div class="container">
              <h2 style="float:left"><?=date('l d-m-Y')?></h2>
              <button id="startDay">Act</button>
              <div id="diary"></div>
          </div>



          <script>
              document.addEventListener('DOMContentLoaded', async function () {
                  const diaryContainer = document.getElementById('diary');
                  const startDayButton = document.getElementById('startDay');

                  // Function to format time as "HH:MM"
                  const formatTime = (date) => {
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${hours}:${minutes}`;
                  };

                  // Fetch existing entries for the current day
                  const messageread = await gs.api.db.fa("SELECT * FROM c_diary WHERE DATE(created) = CURDATE() ORDER BY created ASC");
console.log(messageread);
                  // Hide the "Start Day" button if entries exist for the current day
                  if (messageread.data && messageread.data.length>0) {
                  //add existing lines
                    // Loop through existing entries and add them to the diary container
                      messageread.data.forEach(entry => {
                          const entryDiv = document.createElement('div');
                          entryDiv.classList.add('diary-entry');

                          const timeDiv = document.createElement('div');
                          timeDiv.classList.add('time');
                          timeDiv.textContent = entry.time;

                          const descriptionDiv = document.createElement('div');
                          descriptionDiv.classList.add('task-entry');
                          descriptionDiv.textContent = entry.description;

                          entryDiv.appendChild(timeDiv);
                          entryDiv.appendChild(descriptionDiv);

                          diaryContainer.appendChild(entryDiv);
                          // Check if the current entries are for today's date and add "Continue" button if so
                          const today = new Date();
                          const entryDate = new Date(messageread.data[0].created); // Assuming `created` is a datetime field in your data
                        });
                  }

              document.getElementById('startDay').addEventListener('click', function () {
                  const diaryContainer = document.getElementById('diary');
                  const currentTime = new Date();

                  // Function to format time
                  const formatTime = (date) => {
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${hours}:${minutes}`;
                  };

                  let currentTimeFormatted = formatTime(currentTime);

                  // Function to add a diary entry
                  const addDiaryEntry = (time) => {
                      const entry = document.createElement('div');
                      entry.classList.add('diary-entry');

                      const timeElement = document.createElement('div');
                      timeElement.classList.add('time');
                      timeElement.textContent = time;

                      const inputElement = document.createElement('input');
                      inputElement.classList.add('task-entry');
                      inputElement.type = 'text';
                      inputElement.placeholder = 'Task description...';

                      entry.appendChild(timeElement);
                      entry.appendChild(inputElement);
                      diaryContainer.appendChild(entry);
                                    inputElement.addEventListener('keydown', async function (event) {
                                         if (event.key === 'Enter') {
                                         event.preventDefault();
                                          const description = inputElement.value.trim();
                                          console.log(description)
                                          const time = formatTime(currentTime); // Use the current time to store the entry
                                           const params = {time: time,description: description,created: new Date().toISOString()}
                                           console.log(params)
                                           const messagesave = await gs.api.admin.inse("diary", params);
                                          const nextTime = new Date();
                                            currentTimeFormatted = formatTime(nextTime); // Update formatted time
                                            addDiaryEntry(currentTimeFormatted); // Add next entry

                                    }
                                    });
                      inputElement.focus();
                  };
                  // Start with the current time
                  addDiaryEntry(currentTimeFormatted);
              });

//update lines


//POPULATE SIDEBAR
const displayDiaryDates = async () => {
    const diaryContainer = document.getElementById('sidebar');
    diaryContainer.innerHTML = ''; // Clear any previous content

    try {
        // Fetch distinct dates
        const dateResults = await gs.api.admin.fa("SELECT DISTINCT DATE(created) as entry_date FROM c_diary ORDER BY created DESC");

        dateResults.data.forEach(entry => {
            const entryDate = entry.entry_date;

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date-entry');
            dateDiv.textContent = entryDate;

            // Optional: add click listener to load entries for that date
            dateDiv.addEventListener('click', async () => {
                // You can add code here to load entries for the selected date if needed
                console.log(`Loading entries for ${entryDate}`);
            });

            diaryContainer.appendChild(dateDiv);
        });
    } catch (error) {
        console.error('Error fetching dates:', error);
    }
};

// Call the function to display dates
displayDiaryDates();

      });
          </script>