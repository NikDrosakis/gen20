   <style>
   .container {
        display: flex;
        align-items: flex-start;
        width: 100%;
    }
    .line-numbers {
        padding-top: 15px;
        padding-right: 10px;
        font-size: 1.4em;
        font-family: 'Times New Roman', serif;
        color: #8b0000;
        text-align: right;
        background-color: #f4f4f9;
        border-right: 2px solid #d3d3d3;
    }
    textarea {
        width: 100%;
        height: 80vh;
        padding: 15px;
        font-size: 1.4em;
        font-family: 'Times New Roman', serif;
        border: 2px solid #d3d3d3;
        border-radius: 8px;
        outline: none;
        background-color: #fff;
        resize: none;
    }
    textarea:focus {
        border-color: #8b0000;
        box-shadow: 0 0 5px rgba(139, 0, 0, 0.5);
    }
    </style>
 <h1>Poet's Notepad</h1>
<div class="container">
    <div class="line-numbers" id="line-numbers">1</div>
    <textarea id="main-verse" placeholder="Here is the panel of the Poets!"></textarea>
</div>

<script>
    const textarea = document.getElementById('main-verse');
    const lineNumbers = document.getElementById('line-numbers');

    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', syncScroll);

    function updateLineNumbers() {
        const lines = textarea.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll() {
        lineNumbers.scrollTop = textarea.scrollTop;
    }

    // Initialize line numbers on load
    updateLineNumbers();
</script>
