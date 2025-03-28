<!---FIND IMAGE MOD--->
	<h2>Similar</h2>
        <input placeholder="search books" class="input" id="finfotitle">
    <div id="finfobox-body">
        <button class="button" id="finfo">Search DuckDuckGo</button>
        <button class="button" id="fbooks">Search GoogleBooks</button>
    </div>
    <div id="inforeply"></div>
    <div id="finfos" class="row"></div>
    <section>
<script>
    /*
* DUCKDUCKGO API
DuckDuckGo Search Engine Results API
* */
document.addEventListener('DOMContentLoaded', function () {
    const apiKey = "c070a5c543d6aa0734b815fb1583bd729327470c2c03e1a85daa1937a54ac5f7";

    document.getElementById("fbooks").addEventListener('click', function () {
        const q = document.getElementById('finfotitle').value.trim();
        search_googlebookapi(q);

        fetch(`https://serpapi.com/search?engine=duckduckgo&q=${q}&api_key=${apiKey}`)
            .then(response => response.json())
            .then(res => {
                let items = '';

                res.RelatedTopics.forEach(topic => {
                    items += `<li class="item">${topic.Text}</li>`;
                });

                document.getElementById('inforeply').innerHTML = `<h2>${res.AbstractText}</h2>`;
                document.getElementById('finfos').innerHTML = items;

                // Optional: Add button and set image source
                // const saveButton = document.createElement('button');
                // saveButton.id = 'savefinfo';
                // saveButton.textContent = 'Save Info';
                // document.getElementById("finfos").after(saveButton);

                // document.getElementById('bookimg').src = "image_source_here";
            })
            .catch(error => console.error('Error:', error));
    });
});

function search_googlebookapi(query) {
    // Implement the Google Book API search here
}


</script>