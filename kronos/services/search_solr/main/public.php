<style>
   #searchbox {
        width: 50%;
        margin: auto; /* Centering the search box */
    }
    #searchbox input {
        flex-grow: 1;
        padding: 10px; /* Adding padding for better usability */
        border: 1px solid #ccc; /* Border for the input */
        border-radius: 4px; /* Rounded corners */
    }
    #ssearch_book {
        border: none;
        display: none;
        cursor: pointer; /* Pointer cursor for the search icon */
        margin-left: 10px; /* Spacing between the icons */
    }
    #reset_book {
        border: none;
        display: none;
        cursor: pointer; /* Pointer cursor for the reset icon */
        margin-left: 10px; /* Spacing between the icons */
    }
    #searchbox {
        display: block;
        float: left;
    }
#suggestions {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    /* max-height: 200px; */
    overflow-y: auto;
    width: 50%;
    top: 93px;
    z-index: 1111;
}
#suggestions div {
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between; /* Aligns category name and counter */
}
#suggestions div:hover {
    background-color: #f1f1f1; /* Highlights the hovered suggestion */
}

.suggestion-counter {
    font-weight: bold;
    color: #888;
}
</style>
   <!---search box--->
<div id="searchbox">
    <div style="display: flex; align-items: center;">

    <input type="text" value="<?=$_COOKIE['q']?>"  id="search_input" placeholder="Search here..." onkeyup="performSearch(this.value)">
    <div id="suggestions" class="dropdown-content">
        <!-- Dropdown suggestions will be populated here -->
    </div>
        <input value="<?=$_COOKIE['q']?>" id="search_book" autocomplete="on" placeholder="Search <?=$this->page?>" type="text" onkeyup="handleInput(this)">
        <ion-icon id="reset_book" name="return-up-back" size="large" onclick="resetSearch()" aria-label="Reset Search"></ion-icon>
        <ion-icon id="ssearch_book" name="search" size="large" aria-label="Search"></ion-icon>
    </div>
</div>
<script>
async function performSearch(query) {
    if (!query) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    const response = await fetch(`https://vivalibro.com/solr/solr_vivalibro/select?q=title:*${query}*+publisher:*${query}*+writer:*${query}*+clas:*${query}*&rows=10&wt=json`);
    const data = await response.json();
console.log(data)
    const docs = data.response.docs;





 if (query.length === 0) {
        document.getElementById('suggestions').style.display = 'none';
        return;
    }

    // Example data returned from Solr or any backend search
    const searchResults = {
        books: 120,
        writers: 55,
        publishers: 32,
        classifications: 22
    };

    // Populate suggestions
    let suggestionsHTML = '';
    for (const category in searchResults) {
        suggestionsHTML += `
            <div onclick="redirectToPage('${category}')">
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <span class="suggestion-counter">${searchResults[category]}</span>
            </div>`;
    }

    // Insert the generated suggestions into the dropdown and show it
    const suggestionsElement = document.getElementById('suggestions');
    suggestionsElement.innerHTML = suggestionsHTML;
    suggestionsElement.style.display = 'block';
}

// Function to handle redirection when a suggestion is clicked
function redirectToPage(category) {
    //const baseURL = "/search-results/"; // Base URL for the search results page
    const searchQuery = document.getElementById('search_input').value;
gs.coo('q',searchQuery);
    // Build the full URL
    //const redirectURL = `${baseURL}?q=${encodeURIComponent(searchQuery)}&category=${category}`;

    // Redirect to the URL
    window.location.href = '/'+category;


/*
   // Group results by category
    const titles = docs.filter(doc => doc.title);
    const publishers = docs.filter(doc => doc.publisher);
    const writers = docs.filter(doc => doc.writer);
    const classifications = docs.filter(doc => doc.classification);

    // Clear existing suggestions
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    // Populate dropdown with categorized results
    if (titles.length) {
        const titleHeading = document.createElement('div');
        titleHeading.innerText = 'Titles';
        suggestions.appendChild(titleHeading);
        titles.forEach(doc => {
            const suggestion = document.createElement('div');
            suggestion.innerText = doc.title;
            suggestions.appendChild(suggestion);
        });
    }

    if (publishers.length) {
        const publisherHeading = document.createElement('div');
        publisherHeading.innerText = 'Publishers';
        suggestions.appendChild(publisherHeading);
        publishers.forEach(doc => {
            const suggestion = document.createElement('div');
            suggestion.innerText = doc.publisher;
            suggestions.appendChild(suggestion);
        });
    }

    if (writers.length) {
        const writerHeading = document.createElement('div');
        writerHeading.innerText = 'Writers';
        suggestions.appendChild(writerHeading);
        writers.forEach(doc => {
            const suggestion = document.createElement('div');
            suggestion.innerText = doc.writer;
            suggestions.appendChild(suggestion);
        });
    }

    if (classifications.length) {
        const classificationHeading = document.createElement('div');
        classificationHeading.innerText = 'Classifications';
        suggestions.appendChild(classificationHeading);
        classifications.forEach(doc => {
            const suggestion = document.createElement('div');
            suggestion.innerText = doc.classification;
            suggestions.appendChild(suggestion);
        });
    }

    // Show the dropdown if there are any results
    document.getElementById('suggestions').style.display = 'block';
    */
}

    function handleInput(input) {
        // Show reset icon when there is input
        document.getElementById('reset_book').style.display = input.value ? 'block' : 'none';
        document.getElementById('ssearch_book').style.display = 'block'; // Show search icon
    }

    function resetSearch() {
        document.getElementById('search_book').value = ''; // Clear the input field
        document.getElementById('reset_book').style.display = 'none'; // Hide reset icon
        document.getElementById('ssearch_book').style.display = 'none'; // Hide search icon
        // Optionally trigger a search or update the results here
    }
</script>