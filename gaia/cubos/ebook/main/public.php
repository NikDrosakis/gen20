<?php
if($this->G['folder']!='') {
    $dirs = array_filter(glob($this->G['MEDIA_ROOT']."pdf/".$this->G['folder']."/*"));
}
$folders = array_filter(glob("../media/pdf/*"), 'is_dir');
?>
<!----------tabs------------->
<div style="width:100%;display: flex">
    <?php if(!empty($folders)){
        foreach($folders as $order => $dir){ ?>
            <div id="nodorder1_undefined" style="<?=basename($dir)==$this->G['folder'] ? 'border: 5px solid darkred;':''?>" class="folder">
                <!--<button type="button" class="close" aria-label="delete" id="delundefined"><span aria-hidden="true">×</span></button>-->
                <div class="cardleft">
                    <a style="font-size:16px" class="ebook_title" href="/ebook?folder=<?=basename($dir)?>" style="color:#000000"><?=basename($dir)?></a>
                    <div style="margin-top: 15px;"><a href="/publisher?id=undefined"></a></div>
                </div>
            </div>
        <?php } } ?>
</div>
<!----------VIEW------------->
<div id="pdfList"></div>
<script>
    function getBasename(path) {
        return path.split('/').pop().split('?')[0].split('#')[0];
    }
    const pdfFiles = <?php echo json_encode($dirs); ?>;
    pdfFiles.forEach(pdfFile => {
        const file = "/media/pdf/"+G.folder+"/"+getBasename(pdfFile);
        fetch(file)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const typedarray = new Uint8Array(buffer);
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    //console.log(pdf);
                    // Extract metadata
                    pdf.getMetadata().then(data => {
                        console.log(data);
                        const metadata = data.info;
                        const title = metadata.Title || 'Unknown Title';
                        const author = metadata.Author || 'Unknown Author';
                        const subject = metadata.Subject || 'Unknown Subject';
                        const producer = metadata.Producer || 'Unknown Producer';
                        const file = pdfFile.split('/')[2] || 'Unknown Producer';
                        const folder = G.folder || 'Unknown Folder';
                        // Generate thumbnail of the first page
                        pdf.getPage(1).then(page => {
                            const scale = 0.3;
                            const viewport = page.getViewport({ scale: scale });
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            page.render(renderContext).promise.then(() => {
                                const pdfList = document.getElementById('pdfList');
                                const div = document.createElement('div');
                                //  div.id = `nodorder`;
                                div.className =`card`;
                                div.innerHTML =`<div class="cardleft"><div><a href="/writer?id=undefined"></a>${author}</div><button class="ebook_title" id="openPopup" name="${folder}" style="color:#000000" file="${file}">${title}<div style="margin-top: 5px;"><a href="/publisher?id=undefined"></a></div><div class="tag2">${subject}</div><div class="tag3">${producer}</div></div></button>`;
                                div.appendChild(canvas);
                                pdfList.appendChild(div);
                            });
                        });
                    });
                });
            }).catch(error => console.error('Error fetching or processing PDF:', error));
    });
</script>
<div id="ebookPopup" class="popup">
    <div class="popup-content">
        <!--<span id="closePopup" class="close">&times;</span>-->
        <canvas id="pdfCanvas"></canvas>
        <div class="navigation">
            <button id="prevPage">Previous</button>
            <span id="pageNum"></span> / <span id="pageCount"></span>
            <button id="nextPage">Next</button>
        </div>
    </div>
</div>

<script>
    document.getElementById('openPopup').addEventListener('click', function () {
      document.getElementById('ebookPopup').style.display = 'flex';
        var name=this.getAttribute('name');
        var file=this.getAttribute('file');
        renderPDF('/media/pdf/'+name+'/'+file);
    });
    document.getElementById('closePopup').addEventListener('click', function () {
        document.getElementById('ebookPopup').style.display = 'none';
    });
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1.5,
        canvas = document.getElementById('pdfCanvas'),
        ctx = canvas.getContext('2d');
    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function (page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        document.getElementById('pageNum').textContent = num;
    }
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    document.getElementById('prevPage').addEventListener('click', function () {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    });
    document.getElementById('nextPage').addEventListener('click', function () {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    });
    function renderPDF(url) {
        pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('pageCount').textContent = pdfDoc.numPages;
            renderPage(pageNum);
        });
    }
</script>