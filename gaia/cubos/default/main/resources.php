
            <label for="yaml-editor">YAML Content:</label>
            <textarea id="yaml-editor" name="yamlContent"></textarea>


        <div class="action-buttons">
            <button id="saveButton">Save YAML</button>
        </div>

    <!-- JavaScript for initializing CodeMirror and handling the button click -->
    <script>
        // Initialize CodeMirror editor
        var editor = CodeMirror.fromTextArea(document.getElementById('yaml-editor'), {
            mode: 'yaml',
            lineNumbers: true,
            theme: 'dracula',  // You can switch to any theme you like
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true
        });

        // Save button click handler
        document.getElementById('saveButton').addEventListener('click', function () {
            // Get the YAML content from the editor
            var yamlContent = editor.getValue();

            // Optionally, send this YAML to your backend (PHP or other) for further processing
            console.log("YAML Content to Save:", yamlContent);

            // Example for interacting with your custom library (PHP)
            // This could involve making an AJAX request to your backend
            // Or, use your custom function directly if it’s already set up
            // For now, we will just simulate the storing process
            // Example: Save YAML to a file or DB using your PHP methods

            fetch('your_php_backend_script.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'yamlContent=' + encodeURIComponent(yamlContent)
            }).then(response => response.text())
              .then(result => {
                  alert('YAML saved successfully!');
                  console.log(result);
              })
              .catch(error => {
                  alert('Error saving YAML!');
                  console.error(error);
              });
        });
        document.addEventListener('DOMContentLoaded', function() {
            var editor = CodeMirror.fromTextArea(document.getElementById('yaml-editor'), {
                mode: 'yaml',
                lineNumbers: true,
                theme: 'dracula',
                matchBrackets: true,
                indentUnit: 2,
                tabSize: 2,
                lineWrapping: true
            });
        });
    </script>
<?php
//$this->storeAction();
//xecho ($this->yamlParseFile(ADMIN_ROOT."manifest.yml"));
//xecho ($this->yamlUpdateDB(ADMIN_ROOT."manifest.yml"));
//xecho ($this->yamlFromDB("select * from action where id=1"));
//xecho ($this->db->colFormat("gen_admin.systems"));

