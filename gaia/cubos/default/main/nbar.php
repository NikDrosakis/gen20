<script>

    /**
     ActivityManager
     notification manager from ermis system
     USAGE: gs.activity.init();
     */
gs.activity= {
        nbar : document.getElementById('activity'),
        maxVisibleActivities: 5,
        totalActivitiesToShow: 10,
        activities: [],
        activitySet: new Set(),
        currentIndex: 0,

        init() {
            if(this.nbar) {
                nbar.addEventListener('click', () => {
                    this.toggleActivityVisibility();
                });
            }
        },

        add(data) {
            // Check if the activity already exists
            if (this.activitySet.has(data.verba)) {
                console.log('Activity already exists, skipping:', data.verba);
                return;
            }
            // Get the activity list container
            const activityList = document.getElementById('activity-list');

            // Create a new activity element
            const newActivity = document.createElement('div');
            newActivity.classList.add('activity');

            // Create an image element
            const img = document.createElement('img');
            img.src = `/admin/img/${data.system}.jpg`; // Use the system field to load the image
            img.alt = data.system;
            img.classList.add('activity-img');

            // Create a text container
            const textContainer = document.createElement('div');
            textContainer.classList.add('activity-text');

            // Add the verba (message) and system (source) to the text container
            const verba = document.createElement('p');
            verba.textContent = data.verba;
            verba.classList.add('activity-verba');

            const system = document.createElement('p');
            system.textContent = `From: ${data.system}`;
            system.classList.add('activity-system');

            // Append the text elements to the text container
            textContainer.appendChild(verba);
            textContainer.appendChild(system);

            // Append the image and text container to the activity element
            newActivity.appendChild(img);
            newActivity.appendChild(textContainer);

            // Prepend the new activity to the start of the list
            activityList.insertBefore(newActivity, activityList.firstChild);
            // Add the new activity to the activities array and set
            this.activities.unshift(newActivity);
            this.activitySet.add(data.verba);

            // Remove the oldest activity if the total number exceeds the limit
            if (this.activities.length > this.totalActivitiesToShow) {
                const removed = this.activities.pop(); // Remove from the end of the array
                this.activitySet.delete(removed.querySelector('.activity-verba').textContent);
                removed.remove();
            }

            this.updateVisibility();
        },

        updateVisibility() {
            const visibleActivities = this.activities.slice(this.currentIndex, this.currentIndex + this.maxVisibleActivities);
            const hiddenActivities = this.activities.slice(this.currentIndex + this.maxVisibleActivities);

            visibleActivities.forEach(activity => activity.style.display = 'flex');
            hiddenActivities.forEach(activity => activity.style.display = 'none');

            // Adjust button text based on visibility
            const showMoreBtn = document.getElementById('show-more-btn');
            if (hiddenActivities.length === 0) {
                showMoreBtn.textContent = '▲ Show Less';
            } else {
                showMoreBtn.textContent = '▼ Show More';
            }
        },

        toggleActivityVisibility() {
            this.currentIndex += this.maxVisibleActivities;
            if (this.currentIndex >= this.activities.length) {
                this.currentIndex = 0; // Reset to show from the beginning if reached end
            }
            this.updateVisibility();
        }
    };
</script>
<div id="activity-widget">
<div id="activities-container">
       <div id="activity-list">
        <!-- Activity elements will be added here dynamically -->
    </div>
<button id="show-more-btn">▼ Show More</button>
</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
gs.activity.init();
})
    // Example usage: Adding activities
  //  gs.activity.add(
   //{"system": "kronos", "domaffect": "*", "type": "open", "verba": "kronos pings", "userid": "1", "to": "1", "cast": "one"}
    //);
    //gs.activity.add('Activity 2');
    //addActivity('Activity 3');
    //addActivity('Activity 4');
    //addActivity('Activity 5');

    // Add a new activity after 3 seconds to demonstrate auto-hide
    //setTimeout(() => addActivity('New Activity'), 3000);
</script>
