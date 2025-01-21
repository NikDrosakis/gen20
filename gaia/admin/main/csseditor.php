<h3>CSS Editor</h3>
<!------------STEP 1 css to json--------------->
<?php
//PUBLIC
$cssfile="/var/www/gs/public/vivalibro.com/css/style.css";
$cssContent= file_get_contents($cssfile);

function cssToJson(string $cssContent): array {
  $colorData = [];
  // Regular expression to find CSS rules and properties
  preg_match_all('/(.+?)\s*\{(.*?)\}/s', $cssContent, $matches);
  foreach ($matches[1] as $i => $selector) {
      // Regular expression to find color properties (adjust as needed)
      preg_match_all('/\s*(color|background-color|border-color)\s*:\s*([^;]+);/i', $matches[2][$i], $colorMatches);
      if (!empty($colorMatches[1])) {
          $colorData[$selector] = array_combine($colorMatches[1], $colorMatches[2]);
      }
  }
  return $colorData;
}
//xecho();
$json=json_encode(sanitizeData(cssToJson($cssContent)));
//echo $cssjson=json_encode(array_map('htmlspecialchars',cssToJson($cssContent)));
xecho($json);
?>
<!------------STEP 2 json to inputs--------------->
<div id="color-editor">
    <ul id="css-rules"></ul>
    <iframe noframe style="width:50%;height:400px" src="<?=SITE_URL?>" id="preview-iframe"></iframe>
</div>

<script>
    function sanitizeData($value) {
        if (is_string($value)) {
            // Sanitize string (you can use htmlspecialchars, strip_tags, or other methods)
            return htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
        } else {
            return $value;
        }
    }
    const cssData='';
    const cssRulesList = document.getElementById('css-rules');
    for (const selector in cssData) {
        const ruleItem = document.createElement('li');
        for (const property in cssData[selector]) {
            const colorValue = cssData[selector][property];
            const colorInputId = `${selector}-${property}`;
            ruleItem.innerHTML += `
                <label for="${colorInputId}">${selector} { ${property}: </label>
                <input type="color" id="${colorInputId}" value="${colorValue}" data-selector="${selector}" data-property="${property}">
            `;
        }
        cssRulesList.appendChild(ruleItem);
    }
    // Event Listener for Color Input Changes
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const newColor = event.target.value;
            const selector = event.target.dataset.selector;
            const property = event.target.dataset.property;
            updateIframeCSS(selector, property, newColor);
        });
    });
function updateIframeCSS(selector, property, newColor) {
    const iframeDocument = document.getElementById('preview-iframe').contentWindow.document;
    // Option 1: Dynamically create/modify a stylesheet
    let styleSheet = iframeDocument.querySelector(`style[data-id="dynamic-styles"]`);
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.setAttribute('data-id', 'dynamic-styles');
        iframeDocument.head.appendChild(styleSheet);
    }
    // Update or add the rule
    styleSheet.innerHTML += `${selector} { ${property}: ${newColor} !important; }\n`;
</script>
<!------------STEP 3 ifram--------------->

<!------------STEP 4 button convert to css form again and same to /media/css--------------->