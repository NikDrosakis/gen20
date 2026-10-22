<style>
    #activity-widget {
        border-radius: 5px;
        overflow: hidden;
        width:100%;
    }

    #activities-container {
        max-height: 150px; /* Height for 5 activities */
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
    }

    .activity {
        padding: 10px;
        border-bottom: 1px solid #eee;
        background-color: #f9f9f9;
    }

    .activity:nth-child(odd) {
        background-color: #fff;
    }

    #show-more {
        text-align: center;
        padding: 5px 0;
        cursor: pointer;
    }

    #show-more-btn {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        outline: none;
    }
</style>

<h3>
    <input id="notificationweb_panel" class="red indicator">
    <span class="glyphicon glyphicon-transfer"></span>
    Ermis Notification
    </h3>
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
    //addActivity('Activity 1');
    //addActivity('Activity 2');
    //addActivity('Activity 3');
    //addActivity('Activity 4');
    //addActivity('Activity 5');

    // Add a new activity after 3 seconds to demonstrate auto-hide
    //setTimeout(() => addActivity('New Activity'), 3000);
</script>
