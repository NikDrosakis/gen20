<?php echo $this->renderFormHead("developer/schema");?>
<style>
    .dbschema{
    display: flex;
        box-sizing: border-box;
        flex-direction: column;
        flex-wrap: nowrap;
        width: 100%;
    }
    .dbschema canvas {
        display: block;
        box-sizing: border-box;
        max-width: 600px !important;
        max-height: 600px !important;
    }
</style>
<div class="dbschema">
    <canvas id="pieChart"></canvas>
    <canvas id="lineChart"></canvas>
    <canvas id="daemonStatusChart"></canvas>
</div>
<script>
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
async function renderProcessListChart() {
   const response = await fetch('https://vivalibro.com/api/v1/maria/show?expression=processlist');
    const res = await response.json();
    const processList = res.data;

    const labels = processList.map(item => item.Time);  // Time since the process started
    const values = processList.map(item => item.Info ? item.Info.length : 0);  // Process info length (or any relevant data)

    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Process Information Length',
                data: values,
                fill: false,
                borderColor: '#FF5733',
                tension: 0.1
            }]
        }
    });
}

async function renderGetDatabasesInfoChart() {
   const response = await fetch('https://vivalibro.com/api/v1/maria/getDatabasesInfo');
    const res = await response.json();
    const dbData = res.data;

    const labels = dbData.map(item => item.name);
    const sizes = dbData.map(item => item.size);

    // Generate random colors for each database
    const backgroundColors = labels.map(() => getRandomColor());

    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Database Size (Bytes)',
                data: sizes,
                backgroundColor: backgroundColors, // Apply random colors
            }]
        }
    });
}
async function renderDaemonStatusChart() {
   const response = await fetch('https://vivalibro.com/api/v1/maria/show?expression=status');
    const res = await response.json();
    const statusData = res.data;

    const labels = Object.keys(statusData);  // Variable names from SHOW STATUS
    const values = Object.values(statusData);  // Corresponding values

    const ctx = document.getElementById('daemonStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'MySQL Daemon Status',
                data: values,
                backgroundColor: '#33FF57',
            }]
        }
    });
}

async function buildChart() {
   const response = await fetch('https://vivalibro.com/api/v1/maria/f?query=');
    const res = await response.json();
    const statusData = res.data;

    const labels = Object.keys(statusData);  // Variable names from SHOW STATUS
    const values = Object.values(statusData);  // Corresponding values

    const ctx = document.getElementById('daemonStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'MySQL Daemon Status',
                data: values,
                backgroundColor: '#33FF57',
            }]
        }
    });
}
// Ensure the DOM is fully loaded before rendering the chart
document.addEventListener('DOMContentLoaded', async function() {
    await    renderProcessListChart();
      await        renderGetDatabasesInfoChart();
       await       renderDaemonStatusChart();
       await       buildChart();
});
</script>
