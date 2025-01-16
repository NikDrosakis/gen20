function ajax(file, params, callback, method = 'GET', responseFormat = 'html') {
    var xhr;
console.log(params)
    // Create XMLHttpRequest object
    if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();
    } else {
        var versions = [
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];
        for (var i = 0, len = versions.length; i < len; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {}
        }
    }

    xhr.onreadystatechange = ensureReadiness;

    function ensureReadiness() {
        if (xhr.readyState < 4) {
            return;
        }

        if (xhr.status === 404) {
            callback({ error: true, message: `File not found: ${file}` });
            return;
        }

        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            var response;
            if (responseFormat === 'json') {
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response = { error: true, message: 'Invalid JSON response' };
                }
            } else if (responseFormat === 'html') {
                response = xhr.responseText; // Handling HTML response as text
            } else {
                response = { error: true, message: 'Unsupported response format' };
            }
            callback(response);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            callback({ error: true, message: `HTTP error: ${xhr.status}` });
        }
    }

    method = method || 'GET';

    if (method === "POST") {
        xhr.open("POST", file, true);
     //   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(params));
    } else {
        var res = [];
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                res.push(encodeURIComponent(i) + '=' + encodeURIComponent(params[i]));
            }
        }
        var url = file + '?' + res.join('&');
        xhr.open("GET", url, true);
        xhr.send();
    }
}
/*
self.addEventListener("message", function(e) {
    var params = e.data;
    params.isWorkerRequest=true;
    console.log(params);
    ajax("/admin/index.php?isWorkerRequest=true",params,function(res){
        console.log(res)
        postMessage(res);
    },params.method,params.type);
}, false);
*/
/*
self.addEventListener("message", function(e) {
    const params = e.data;
    // Dynamically import the PHP-generated HTML
    importScripts('/admin/index.php/get_my_widget.php?param1=' + params.param1 + '¶m2=' + params.param2);
    // Access the HTML from the global scope
    const htmlContent = myWidgetHTML; // The variable is now available
    // ... process the htmlContent in the worker ...
    postMessage(htmlContent);
}, false);
 */
// worker.php
self.addEventListener("message", function(e) {
    console.log(e.data)
    ajax("/admin/index.php", e.data, function(response) {
        // ... process the HTML response ...
        postMessage(response);
    }, e.data.method, e.data.responseFormat);
}, false);

self.addEventListener("message", async (event) => {
    const { method, responseFormat, url, params } = event.data;

    try {
        const response = await fetch(url, {
            method: method, // 'GET' or 'POST'
            body: method === 'POST' ? JSON.stringify(params) : undefined,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        let result;
        if (responseFormat === 'json') {
            result = await response.json();
        } else { // Assume 'html' or 'text'
            result = await response.text();
        }
        postMessage(result); // Send the result back to the main thread

    } catch (error) {
        console.error('Error in worker:', error);
        postMessage({ error: error.message });
    }
});