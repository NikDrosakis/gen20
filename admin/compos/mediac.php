<!-- @filemeta.description media panel to preview external links-->
<!--
@filemeta.updatelog
v1 created with ajax
v2 switch to inline tag fired, added Toolbox, Dig,Generate, Google Drive
v3 updated to filemeta
-->
<!--
@filemeta.todo
- add more resources, compined with core.Resources
- fix & update custom
- add video and more media types
-->
<!-- @filemeta.features POST TABLE -->
<h3>
    <input id="media_panel" class="red indicator">
    <a href="/media/media"><span class="glyphicon glyphicon-edit"></span>Media</a>
</h3>
<?php
 $currentFolder = !empty($_COOKIE['current_folder']) ? $_COOKIE['current_folder'] : MEDIA_ROOT;
    // Get a list of the folders inside the current folder
   $folders = glob('/var/www/media/*',GLOB_ONLYDIR);
   $folder= $this->G['MEDIA_ROOT'];
?>

<!---------@filemeta.features TABS MENU ------------>
    <ul class="tabs mediatabs">
        <li class="tab-link current" onclick="tab(this)" data-tab="tab-media_manager">Media Manager</li>
        <li class="tab-link" data-tab="tab-upload_image" onclick="tab(this)" >Upload Image</li>
        <li class="tab-link" data-tab="tab-url_image" onclick="tab(this)" >Image from URL</li>
        <li class="tab-link" data-tab="tab-dropbox" onclick="tab(this)" >Dropbox</li>
        <li class="tab-link" data-tab="tab-google_drive" onclick="tab(this)" >Google Drive</li>
        <li class="tab-link" data-tab="tab-dig" onclick="tab(this)" >Dig</li>
        <li class="tab-link" data-tab="tab-findimage" onclick="tab(this)" >Generate</li>
    </ul>

<!-- @filemeta.features TABS CONTAINERS -->
    <!-- Form for adding a new slide -->
    <div id="tab-media_manager" class="tab-content current">
        <button id="chooseButton">Add from Media Folder</button>
            <label>Media Folder
                    <?=basename($currentFolder)?>
                    <select onchange="gs.coo('current_folder',this.value);loadMedia(this.value, 1, 8)">
                      <option value="<?=$currentFolder?>">.</option>
                      <?php foreach ($folders as $fold){ ?>
                        <option value="<?=$fold?>"><?=basename($fold)?></option>
                      <?php } ?>
                    </select>
            </label>
        <form id="chooseForm">
            <input type="hidden" name="a" value="upload_media">
            <input type="hidden" id="media_image" value="">

            <div class="media-gallery" id="mediaGallery">
                <!-- Media thumbnails will be populated here -->
                <?php $this->loadMedia() ?>
            </div>
        </form>
                <div id="pagination"></div>
        <div id="imagePreviewContainer">
            <img id="imagePreview" src="" alt="Image Preview" style="max-width:100%; height:auto; display:none; margin-top:10px;">
        </div>
    </div>

    <div id="tab-upload_image" class="tab-content">
        <form id="uploadForm" enctype="multipart/form-data">
            <label for="upload_image">Upload Image:</label>
            <input type="file" class="button" id="upload_image" name="upload_image" required>
            <button type="submit" class="button button-primary">Add Media</button>
        </form>
    </div>

    <div id="tab-url_image" class="tab-content">
        <form id="urlForm">
            <input type="hidden" name="a" value="upload_url">
            <label for="url_image">Image URL:</label>
                <input type="text" placeholder="caption" id="caption_url" name="caption_url" required>
            <input type="text" placeholder="enter url" id="url_image" name="url_image" required>
            <button type="button" id="urlButton" class="button button-primary">Add Media</button>
        </form>
    </div>

<div id="tab-dropbox" class="tab-content">
    <?php include ADMIN_ROOT."main/media/dropbox.php"; ?>
    </div>
<div id="tab-google_drive" class="tab-content">
     <?php include ADMIN_ROOT."main/media/drive_pricker.php"; ?>
    </div>
<div id="tab-dig" class="tab-content">
      <?php include ADMIN_ROOT."main/media/generate.php"; ?>
    </div>
<div id="tab-findimage" class="tab-content">
     <?php include CUBOS_ROOT."findimage/public.php"; ?>
    </div>

<script>
      //document.addEventListener('DOMContentLoaded', async function () {
      console.log("loading...",gs)
             // Initialize with the first page of the root folder
           const folder=!!gs.coo('current_folder') ? gs.coo('current_folder'): G.MEDIA_ROOT;
           await loadMedia(folder, 1, 8);
            //events
            document.getElementById('urlButton').addEventListener('click',addImageFromUrl);
            document.getElementById('chooseButton').addEventListener('click', selectFromMediaFolder);
            document.getElementById('uploadForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                const formData = new FormData(this);
                await uploadFile(formData);
            })
      //})
/** @filemeta.features MEDIA COMMON FUNCTIONS */

async function uploadFile(formData) {
    // Log FormData contents
    var params = {};
    for (let [key, value] of formData.entries()) {
        params[key] = value;
    }
    console.log(params)
    try {
        const upload = await gs.loadLocalMethod.post("upload_file", formData);
        if (upload.success) {
            //oldajax url: '/widgets/slideshow/post_xhr.php',
            console.log(upload)
            appendMediaToPlace(upload.data);
            document.getElementById('uploadForm').reset();
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return {success: false};
    }
}

// @filemeta.features Handle selection from media folder (Tab B)
async function selectFromMediaFolder(id) {
    event.preventDefault();
    const filename = document.getElementById(id).value;
    const folder = gs.coo('current_folder') || G.MEDIA_ROOT;
    const params = {a: "upload_media", filename: filename, folder: folder};
    console.log(params);
    try {
        const uploadMedia = await gs.loadLocalMethod.post("upload_media", params);
        console.log(uploadMedia)
        if (uploadMedia.success) {
            appendMediaToPlace(uploadMedia.data);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return {success: false};
    }
}


// @filemeta.features Handle adding an image from a URL (Tab C)
async function addImageFromUrl(id) {
    const url = document.getElementById('url_image').value;
    const caption = document.getElementById('caption_url').value;
    const params = {url: url, caption: caption, folder: folder};
    try {
        const uploadUrl = await gs.loadLocalMethod.post("upload_url", params);
        console.log(uploadUrl)
        if (uploadUrl.success) {
            appendMediaToPlace(uploadUrl.data);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return {success: false};
    }
}

/**
 * General function to append a media item to a specified table
 * @param {string} tableId - The ID of the table to append the item to
 * @param {Object} mediaItem - The media item object containing relevant properties
 * @param {Function} customTemplate - A function to generate the HTML template for the media item
 */
function appendToPlace(tableId, mediaItem, customTemplate) {
    let table = document.querySelector(`#${tableId} tbody`);
    if (!table) {
        console.error(`Media ID ${tableId} not found.`);
        return;
    }
    const rowHTML = customTemplate(mediaItem);
    table.insertAdjacentHTML('beforeend', rowHTML);
}

// @filemeta.features Function to append slide to the table
function appendMediaToPlace(slide) {
    let table = `<tr id="slide_${slide.id}">
      <td class="sort-order">${slide.sort}</td>
      <td>${slide.sort}</td>
      <td><img src="${G.SITE_URL}media/slideshow/${slide.filename}" alt="${slide.filename}" style="max-width: 100px;"></td>
      <td>${slide.filename}</td>
      <td><input name="caption" id="cubo_slideshow${slide.id}" value="${slide.caption}"></td>
      <td><input type="checkbox" class="delete-checkbox" value="${slide.id}"></td>
      </tr>`;
    document.querySelector('#sortableMedia tbody').insertAdjacentHTML('beforeend', table);
}

// @filemeta.features Populate the media select dropdown with images from the media/slideshow folder
async function loadMedia(folder = '', pag = 1, limit = 8) {
    const params = {folder: folder, pag: pag, limit: limit};
    const getMedia = await gs.loadLocalMethod.get("loadMedia", params);
    console.log(getMedia)
    if (getMedia.success) {

        const files = getMedia.data.files;
        const parentFolder = getMedia.data.parentFolder;
        const directories = getMedia.data.directories;
        const total = getMedia.data.total;

        const mediaGallery = document.getElementById('mediaGallery');
        const pagination = document.getElementById('pagination');
        const folderPath = folder ? `/media/${folder}` : '/media';

        // Clear previous thumbnails and folders
        if (mediaGallery != null) {
            mediaGallery.innerHTML = '';
        }
        if (pagination != null) {
            pagination.innerHTML = '';
        }

        // Add navigation to the parent folder if not in the root
        if (folder && parentFolder !== '') {
            const parentFolderDiv = document.createElement('div');
            parentFolderDiv.classList.add('folder');
            parentFolderDiv.setAttribute('data-folder', parentFolder);
            parentFolderDiv.textContent = '..';
            mediaGallery.appendChild(parentFolderDiv);
        }

        // Add files to the gallery
        files.forEach(file => {
            const img = document.createElement('img');
            const relativePath = folder.replace(G.MEDIA_ROOT, '');
            img.src = `${G.SITE_URL}media/${relativePath}/${file}`;
            img.setAttribute('data-filename', file);
            img.alt = file;
            // Make the image draggable
            img.setAttribute('draggable', 'true');
            // Add the dragstart event listener
            img.addEventListener('dragstart', handleDragStart);
            mediaGallery.appendChild(img);
        });

        // Handle image click
        mediaGallery.addEventListener('click', function (event) {
            if (event.target.tagName.toLowerCase() === 'img') {
                const selectedImage = event.target;
                const filePath = selectedImage.src;

                // Update the preview
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.src = filePath;
                imagePreview.style.display = 'block';

                // Highlight selected thumbnail
                const images = mediaGallery.getElementsByTagName('img');
                Array.from(images).forEach(img => img.classList.remove('selected'));
                selectedImage.classList.add('selected');

                // Optionally set the selected file name in a hidden input or variable
                document.getElementById('media_image').value = selectedImage.getAttribute('data-filename');
            }
        });

        // Generate pagination controls
        const totalPages = Math.ceil(total / limit);
        createPagination(totalPages, pag, folder, limit);
    }
}
</script>