<?php

xecho($this->getSystemMetrics());

?>
<div style="display:flex; flex-direction: column;">
    <canvas id="cpuChart" width="400" height="200"></canvas>
    <canvas id="memoryChart" width="400" height="200"></canvas>
</div>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Example data received from the backend
        const systemMetrics = {
            cpu: 3.35,
            memory: {
                total: 65759924,
                used: 2933076,
                free: 46625040,
                available: 62826848,
                used_percentage: 4.46
            }
        };

        // CPU Chart
        const ctxCpu = document.getElementById('cpuChart').getContext('2d');
        new Chart(ctxCpu, {
            type: 'line', // You can change to 'line' or 'gauge' based on your preference
            data: {
                labels: ['Used CPU %', 'Free CPU %'],
                datasets: [{
                    data: [systemMetrics.cpu, 100 - systemMetrics.cpu],
                    backgroundColor: ['#FF6384', '#36A2EB']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });

        // Memory Chart
        const ctxMemory = document.getElementById('memoryChart').getContext('2d');
        new Chart(ctxMemory, {
            type: 'pie',
            data: {
                labels: ['Used Memory', 'Free Memory'],
                datasets: [{
                    data: [systemMetrics.memory.used, systemMetrics.memory.free],
                    backgroundColor: ['#FF6384', '#36A2EB']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    });

</script>