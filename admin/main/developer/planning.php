   <style>
        /* Basic styling to ensure the Gantt chart container is visible */
     #gantt_here {
            width: 100%;
            height: 600px;
        }
    </style>
    <script src="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js"></script>
    <style>
        #gantt_here {
            width: 100%;
            height: 600px;
        }
		        #zoom_in, #zoom_out {
            margin: 5px;
            padding: 10px;
            cursor: pointer;
        }
    </style>


  <button id="zoom_in">Zoom In</button>
    <button id="zoom_out">Zoom Out</button>
    <div id="gantt_here"></div>
    
      <script>
	  function hourRangeFormat(step) {
    // Returns a format string based on the step size
    if (step === 12) {
        return "%H:%M"; // Example: "15:30" for every 12 hours
    } else if (step === 6) {
        return "%H:%M"; // Example: "15:30" for every 6 hours
    } else {
        return "%H:%M"; // Default format
    }
}
var zoomConfig = {
    levels: [
        [
            { unit: "month", format: "%M %Y", step: 1},
        ],
        [
            { unit: "month", format: "%M %Y", step: 1},
            { unit: "day", format: "%d %M", step: 1}
        ],
        [
            { unit: "day", format: "%d %M", step: 1},
            { unit: "hour", format: hourRangeFormat(12), step: 12}
        ],
        [
            {unit: "day", format: "%d %M",step: 1},
            {unit: "hour",format: hourRangeFormat(6),step: 6}
        ],
        [
            { unit: "day", format: "%d %M", step: 1 },
            { unit: "hour", format: "%H:%i", step: 1}
        ]
    ]
}

 gantt.ext.zoom.init(zoomConfig);
        gantt.ext.zoom.setLevel(3); // Start with the 'week' zoom level
document.addEventListener('DOMContentLoaded', function() {
        document.getElementById("zoom_in").onclick = function() {
            gantt.ext.zoom.zoomIn();
        };

        document.getElementById("zoom_out").onclick = function() {
            gantt.ext.zoom.zoomOut();
        };
})
 gantt.config.duration_unit = "hour";
        gantt.config.duration_step = 1;
        gantt.config.min_column_width = 30;
gantt.config.start_date = new Date(2024, 05, 01);
gantt.config.end_date = new Date(2024, 11, 31);
gantt.config.date_format = "%Y-%m-%d %H:%i";
    // Initialize the Gantt chart
    gantt.init("gantt_here");        
    
    // Load tasks and links from the API
    gantt.load("/ermis/v1/timetable");

    // Add event handler for adding a task
    gantt.attachEvent("onAfterTaskAdd", function(id, item) {
        fetch('/ermis/v1/timetable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: item.text,
                start_date: item.start_date,
                end_date: item.end_date,
                duration: item.duration,
                parent: item.parent,
				progress: 0
            })
        })
        .then(response => response.json())
        .then(data => console.log('Task added:', data))
        .catch(error => console.error('Error:', error));
    });
    // Add event handler for deleting a task
gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
console.log("onAfterTaskUpdate")
    fetch(`/ermis/v1/timetable/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: item.text,
            start_date: gantt.date.date_to_str(gantt.config.date_format)(item.start_date), // format date
            end_date: gantt.date.date_to_str(gantt.config.date_format)(item.end_date),     // format date
            duration: item.duration,
			progress:item.progress
        })
    })
    .then(() => console.log('Task updated:', item))
    .catch(error => console.error('Error:', error));
});
gantt.attachEvent("onAfterTaskDelete", function(id, item) {
console.log("onAfterTaskDelete")
    fetch(`/ermis/v1/timetable/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
                text: item.text,
                source: item.source,
                target: item.target
           })
    })
    .then(() => console.log('Task updated:', item))
    .catch(error => console.error('Error:', error));
});
    // Add event handler for adding a link
    gantt.attachEvent("onAfterLinkAdd", function(id, link) {
console.log("onAfterLinkAdd")
        fetch('/ermis/v1/timetable/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: link.source,
                target: link.target,
                type: link.type
            })
        })
        .then(response => response.json())
        .then(data => console.log('Link added:', data))
        .catch(error => console.error('Error:', error));
    });

    // Add event handler for updating a link
    gantt.attachEvent("onAfterLinkUpdate", function(id, link) {
console.log("onAfterLinkUpdate")
        fetch(`/ermis/v1/timetable/links/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: link.source,
                target: link.target,
                type: link.type
            })
        })
        .then(() => console.log('Link updated:', link))
        .catch(error => console.error('Error:', error));
    });

    // Add event handler for deleting a link
    gantt.attachEvent("onAfterLinkDelete", function(id) {
console.log("onAfterLinkDelete")
        fetch(`/ermis/v1/timetable/links/${id}`, {
            method: 'DELETE'
        })
        .then(() => console.log('Link deleted:', id))
        .catch(error => console.error('Error:', error));
    });
</script>
</body>
</html>


