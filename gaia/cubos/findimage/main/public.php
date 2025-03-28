<style>
    #fimgbox{
        padding: 0px 5% 0 5%;
        font-size: 10px;
        width: 90%;
        display: inline-block;
    }
    #fimgs{
        width: fit-content;
    }
    #fimgs li{
        vertical-align: top;
        display: inline-block;
        text-align: center;
        width: 120px;
    }
</style>
<!--FIMG MOD-->
<div id="fimgbox">
    <button class="button" id="fimg">Find image</button>
    <input type="text" class="gs-input" placeholder="search feature image by text" id="ftitle">
    <div id="fimgs" style="padding-top: 9px;" class="media-gallery"></div>
</div>



<script>
    //find image from google api
   // Event listener for saving the image
   document.addEventListener('click', function (event) {
       if (event.target && event.target.id === 'savefimg') {
           var url = document.querySelector("input[name='fitems']:checked").value;
           document.getElementById('bookimg').src = url;
           var name = document.querySelector("input[name='fitems']:checked").getAttribute('data');
           console.log(name);

           var table = G.page === 'profile' ? 'user' : (G.mode === '' ? 'book' : G.mode);
           var id = G.page === 'profile' ? G.my.id : G.id;
           // Save to db
           var params = {
               a: "copy",
               page: G.page,
               url: url,
               name: sanitizeFilename(name),
               id: id,
               table: table
           };
           console.log(params);

           gs.db.get(params, function (data) {
               console.log(data);
           });
       }
   });

   // Event listener for when G.id is 'new'
  // if (G.id === 'new') {
       document.addEventListener('click', function (event) {
           if (event.target && event.target.name === 'fitems') {
               var url = document.querySelector("input[name='fitems']:checked").value;
               var formBook = document.getElementById('form_book');
               var hiddenInput = document.createElement('input');
               hiddenInput.type = 'hidden';
               hiddenInput.name = 'img_url';
               hiddenInput.value = url;
               formBook.appendChild(hiddenInput);
           }
       });
  // }

   // Event listener for fetching images
   document.addEventListener('click', function (event) {
       // Check if the clicked element is the one we're interested in
  if (event.target && event.target.id === 'fimg') {
        var ftitle = document.getElementById('ftitle') || { value: '' }; // Default to empty if not found
        var writer = document.getElementById('writer') ? document.getElementById('writer').value : '';
        var publisher = document.getElementById('publisher') ? document.getElementById('publisher').value : '';
        var titleValue = document.querySelector('input[name="title"]') ? document.querySelector('input[name="title"]').value : '';
        var writerValue = document.querySelector('input[name="writer"]') ? document.querySelector('input[name="writer"]').value : '';
        var publisherValue = document.querySelector('input[name="publisher"]') ? document.querySelector('input[name="publisher"]').value : '';
        var name = document.getElementById('name') ? document.getElementById('name').value : '';

        // Construct the query by checking all values and filtering out empty strings
        var query = [titleValue, writerValue, publisherValue, ftitle.value, document.getElementById('title') ? document.getElementById('title').value : '', writer, publisher, name]
            .filter(function(value) { return value.trim() !== ''; }) // Remove any empty values
            .join(' ');

        // If name is not empty, update ftitle
        if (name.trim() !== '') {
            ftitle.value = name;
        }
           if (query !== '') {
               const url = `https://www.googleapis.com/customsearch/v1?num=6&searchType=image&fileType=jpg|gif|png&safe=off&q=${query}&cx=000897981024708010815%3Ah-9unlwfo7q&key=AIzaSyDNAIWEszhKEjT6E5fpT8OZjIJrPY_zRI8&alt=json`;

               fetch(url)
                   .then(response => response.json())
                   .then(res => {
                       let items = '';
                       const totalres = {};
                       console.log(res);
                       if (res.hasOwnProperty('items') && res.items.length > 0) {
                           res.items.forEach((item, i) => {
                               const width = item.image.width;
                               const height = item.image.height;
                               totalres[i] = width + height;
                               items += `
                                   <div class="list-inline-item">
                                       <input id="fimgres${i}" class="input-hidden" style="position: absolute; opacity: 0; width: 0; height: 0;" type="radio" name="fitems" data="${gs.greeklish(item.title)}" value="${item.link}">
                                       <label for="fimgres${i}"><img style="cursor: pointer;" draggable=true src="${item.link}"></label>
                                       <div style="width: 120px;"><b>${item.title}</b></div>
                                       <div style="width: 120px;">${item.snippet}</div>
                                       <div style="width: 120px;">Res: ${width}X${height}</div>
                                   </div>`;
                           });
                       }
                       document.getElementById('fimgs').innerHTML = items;

                       // Check the higher resolution
                       const keyWithHighestValue = getKeyWithHighestValue(totalres);
                       document.getElementById(`fimgres${keyWithHighestValue}`).checked = true;

                       if (!document.getElementById('savefimg')) {
                           const button = document.createElement('button');
                           button.className = 'button';
                           button.id = 'savefimg';
                           button.textContent = 'Save image';
                           document.getElementById('fimgs').insertAdjacentElement('beforebegin', button);
                       }
                   });
           }
       }
   });

   function getKeyWithHighestValue(obj) {
       return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
   }

</script>
