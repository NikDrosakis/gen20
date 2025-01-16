<h2>GPY PYTHON FAST APY 2.0</h2>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        form {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        label {
            display: block;
            margin: 5px 0;
        }
        input, select, textarea {
            width: 100%;
            padding: 5px;
            margin: 5px 0;
        }
        input[type="submit"] {
            width: auto;
            cursor: pointer;
        }
        .response {
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>

<h1>Gaia API 2.0</h1>

<!-- GET Request Form -->
<form id="getForm">
    <h2>GET Request</h2>
    <label for="getType">Type (/:type):</label>
    <input type="text" id="getType" name="getType" required>

    <label for="getCol">Column (/:col):</label>
    <input type="text" id="getCol" name="getCol">

    <label for="getParams">Query Parameters (key=value&key2=value2):</label>
    <input type="text" id="getParams" name="getParams">

    <input type="submit" value="Send GET Request">
</form>

<div id="getResponse" class="response"></div>

<!-- POST Request Form -->
<form id="postForm">
    <h2>POST Request</h2>
    <label for="postType">Type (/:type):</label>
    <input type="text" id="postType" name="postType" required>

    <label for="postCol">Column (/:col):</label>
    <input type="text" id="postCol" name="postCol">

    <label for="postBody">Request Body (JSON format):</label>
    <textarea id="postBody" name="postBody" rows="5" required>{}</textarea>

    <input type="submit" value="Send POST Request">
</form>

<div id="postResponse" class="response"></div>
