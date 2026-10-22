// Handle GET request submission
document.getElementById('getForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const type = document.getElementById('getType').value;
    const col = document.getElementById('getCol').value;
    const params = document.getElementById('getParams').value;
    let url = `/api/${type}`;

    if (col) {
        url += `/${col}`;
    }

    if (params) {
        url += `?${params}`;
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_JWT_TOKEN'  // Replace with your actual JWT token
        }
    })
        .then(response => {
            if (response.headers.get('content-type')?.includes('application/json')) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(`Unexpected response format: ${text}`);
                });
            }
        })
        .then(data => {
            document.getElementById('getResponse').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            document.getElementById('getResponse').textContent = `Error: ${error.message}`;
        });
});

// Handle POST request submission
document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const type = document.getElementById('postType').value;
    const col = document.getElementById('postCol').value;
    const body = document.getElementById('postBody').value;
    let url = `/api/${type}`;

    if (col) {
        url += `/${col}`;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_JWT_TOKEN'  // Replace with your actual JWT token
        },
        body: body
    })
        .then(response => {
            if (response.headers.get('content-type')?.includes('application/json')) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(`Unexpected response format: ${text}`);
                });
            }
        })
        .then(data => {
            document.getElementById('postResponse').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            document.getElementById('postResponse').textContent = `Error: ${error.message}`;
        });
});
