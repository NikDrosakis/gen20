<h3>
    <input id="notificationweb_panel" class="red indicator">
    <span class="glyphicon glyphicon-transfer"></span>
   Activity
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
