document.addEventListener('DOMContentLoaded', () => {
    // Common Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                display: true,
                grid: {
                    color: '#1a1b20',
                    drawBorder: false
                },
                ticks: {
                    display: false
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };

    // Total Daily Stretching Chart (Orange)
    const ctxStretching = document.getElementById('stretchingChart').getContext('2d');
    new Chart(ctxStretching, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                data: [10, 15, 13, 18, 16, 19, 24],
                borderColor: '#f59e0b',
                borderWidth: 4,
                tension: 0.3
            }]
        },
        options: commonOptions
    });

    // Daily App Engagement Chart (Blue)
    const ctxEngagement = document.getElementById('engagementChart').getContext('2d');
    new Chart(ctxEngagement, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                data: [12, 10, 17, 15, 20, 18, 23],
                borderColor: '#3b82f6',
                borderWidth: 4,
                tension: 0.3
            }]
        },
        options: commonOptions
    });
});