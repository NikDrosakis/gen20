
document.addEventListener('DOMContentLoaded', async function () {
    /***********LOAD MAIN*****************/
    if ((G.page == "home" || G.page == "book" || G.page == "libraries" || G.page == "writer" || G.page == "publisher") && G.id == '') {
        //    const booklist = await get_booklist();
        // Container for the book cards


        //temp commented    await solr_vivalibro_search();

    }
    //  await start_cubos();
    //socapi.start(soc_success());
})


//s.ajaxfile='/bks/ajax.php';
function updateCardSize() {
    const screenWidth = window.innerWidth;
    let X = screenWidth / 1200; // Assuming 1200px as the base width for X=1
    document.documentElement.style.setProperty('--X', X);
}
/*
* GOOGLE BOOKS
* dependency on cubo similar
* */
function get_top_words(titles){
    const stopWords = new Set([
        'ο', 'η','ή','no', 'το', 'και', 'ένα', 'μια', 'στο', 'του', 'της', 'των', 'σε', 'με', 'για', 'είναι',
        'που', 'αυτό', 'αυτή', 'αυτά', 'αυτός', 'αυτές', 'εκείνος', 'εκείνη', 'εκείνα', 'εκείνος', 'το',
        'τα', 'οι', 'τους', 'τις', 'στον', 'στην', 'στο', 'από', 'ως', 'έως', 'έναν', 'κάποια', 'αυτός'
    ]);
    function countWords(titles) {
        const count = {};
        titles.forEach(title => {
            if(!!title) {
                const words = title.toLowerCase().split(/[\s.,!?;()]+/u).filter(word => !stopWords.has(word) && word.length > 0);
                words.forEach(word => {
                    count[word] = (count[word] || 0) + 1;
                });
            }
        });
        return count;
    }
    // Get the frequency count of words
    const wordCounts = countWords(titles);
    // Convert the count object to an array of [word, count] pairs
    const wordCountPairs = Object.entries(wordCounts);
    // Sort the array by count in descending order
    wordCountPairs.sort((a, b) => b[1] - a[1]);
    const top5Words = wordCountPairs.slice(0, 5).map(pair => pair[0]);
    return top5Words;
}

/*

SOLR solr_vivalibro core
for collapsible usified search (like linkedin)
http://localhost:8983/solr/solr_vivalibro/select?q=title:*query*&q=publisher:*query*&q=writer:*query*&q=classification:*query*&rows=10
http://localhost:8983/solr/your_core/select?q=*:*
&facet=true
&facet.field=title
&facet.field=publisher
&facet.field=writer
&facet.field=classification

* */

async function solr_vivalibro_search(q, pag=1, rows=10) {
    let qq = !!q ?  q : (!!gs.coo('q') ? gs.coo('q') : '');
    let querystring = qq!='' ? `title:*${qq}*`  : `title:*`;
    let pagenum = !!pag ? pag : (!!gs.coo('pagenum') ? gs.coo('pagenum') : 1);
    var html = '';
    console.log('searching',querystring,pagenum,rows)
    const booksolrlist = await gs.solr.select(querystring, pagenum, rows);
    console.log(booksolrlist)

    if (booksolrlist.numFound > 10) {
        // get: function (current, total_results, results_per_page, loopname)
        //    gs.ui.pagination.get(gs.coo('pagenum'),booksolrlist.numFound,10,booksolrlist.docs);
    }else{
        //     gs.ui.reset('pagination');
    }
    if (booksolrlist.docs.length > 0) {
        const books = booksolrlist.docs;
        html= `<div class="row">`
        // Loop through the books array
        for (var i in books) {
            html += `<div id="nodorder1_${books[i].id}" class="card">
                <div class="cover">                
                    <a style="display:grid;font-size:15px;" href="/books/${books[i].id}/read">
                        <img id="img${books[i].id}" src="${!books[i].img ? (books[i].img_l && books[i].img_l.startsWith('http') ? books[i].img_l : '/media/' + books[i].img_l) : (books[i].img.startsWith('http') ? books[i].img : '/media/' + books[i].img)}">
                    </a>
                </div>
                <div class="description">
                    <span class="published">
                        <a href="/publisher/${books[i].publisher}/read">${books[i].publishername}</a>, ${books[i].published}
                    </span>
                </div>
                 <p class="title">
                            <a style="display:grid;color:#000000;font-size:15px;" href="/books/${books[i].id}/read">${books[i].title}</a>
                        </p>
                          <div class="author">
                            <a href="/writer/${books[i].writer}/read">${books[i].writername ? books[i].writername : ''}</a>
                        </div>        
                        </div>
                ${books[i].summary ? `
                    <div class="card-summary">                                     
                        ${books[i].summary}
                    </div>
                ` : ''}                
        `;
        }
        html +=`</div>`
        // Insert the generated HTML into the document
        document.getElementById(G.page).innerHTML =html;
    }else{
        html +=`<h3>No Results</h3>`;
        document.getElementById(G.page).innerHTML = '<div class="row"><h3>No Results</h3></div>';
    }
}

/*DEPRECATED BY SOLR */
async function get_booklist(q) {
    var pagenum=!gs.coo('pagenum') ? 1: gs.coo('pagenum'),q=q ??'';
    //var params= {a:'booklist',page:G.page,pagenum:pagenum,q:q,mode:G.mode,name:G.name};
    //$buffer = $this->booklist(); converted to api method read this to booklist and get the buffer from there
    //const getlist=await gs.api.maria.fa("UPDATE c_book_libuser set col=? WHERE bookid=?", [val,G.id]]);
    var listparams= {page:G.page,pagenum:pagenum,q:q,name:G.name};
    const getlist = await gs.api.get("booklists",listparams);
    if(getlist && getlist.success) {
        var html='';
        console.log(getlist)
        var titles=[];
        for (var i in getlist.data) {
            var list=getlist.data[i];
            titles.push(list.title);
            html += `<div id="nodorder1_${list.id}"class="card">
                <button  type="button" class="close" aria-label="delete" id="del${list.id}">
                <span aria-hidden="true">&times;</span></button>
                <div class="cover">
                    <img id="img${list.id}" src="${list.img ?? ''}">
                </div>
                <div class="description">
                    <span class="published">
                    <a href="/publisher?id=${list.publisher}&mode=read">${list.publishername!= null ? list.publishername : ''}</a>, 
                    ${list.published}
                    </span>
                    <span class="">${G.isread[list.isread] ?? ''}</span>
                    <span class="">${G.book_status[list.status] ?? ''}</span>
                </div>            
            <a href="/writer?id=${list.writer}&mode=read">${list.writername ?? ''}</a>`
            if(list.summary!=null) {
                html +=     `<div><a class="booktitle" href="${list.booklink}&mode=read">${list.title}</a>
            <div class="card-summary">${list.summary}</div>
            <div>`;
            }
            html += `</div>`;
        }
        if (titles.length > 0) {
            console.log(Object.values(titles))
            //top5 of all titles
            var top5 = get_top_words(Object.values(titles));
            console.log(top5)
            //SIMILAR CUBO
            if(search_googlebookapi=='function') {
                var query = !!$('#search_book').val() ? $('#search_book').val() : top5.join(' ');
                search_googlebookapi(query);
            }
        }
        //results to main page
        $('#' + G.page).html(`<div class="row">${html}</div>`);
        $('#count_' + G.page).text(getlist.data.length + " " + G.page + "s");
        //   gs.ui.pagination.get(pagenum, getlist.data.length, 12, 'book');
    } else {
        gs.fail("No results");
    }
}

//onkeyup="$('#reset_book').css('display','block');$('#search_book').css('display','block');"
// onkeydown="if (event.keyCode === 13){var q= $('#search_book').val().trim();coo('page',1);if(!!q){coo('q',q)}booklist(q);}"

// Event delegation and event handling
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keyup', async (event) => {
        if (event.target.matches("#search_book")) {
            let query = document.getElementById('search_book').value;
            gs.coo('pagenum', 1);
            if (query.length>0) {
                gs.coo('q', query);
                //   await solr_vivalibro_search(query);
            }else{
                gs.cooDel('q')
            }
        }
    })
    document.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.matches('button[id^="save_"]')) {
            const col = target.id.replace('save_', '');
            const val = document.getElementById(col).innerHTML;
            let updatecol;
            if (col === 'summary') {
                updatecol = await gs.api.maria.q(`UPDATE ${G.publicdb}.c_book set col=? WHERE id=?`, [val, G.id]);
            } else if (col === 'notes') {
                updatecol = await gs.api.maria.q(`UPDATE ${G.publicdb}.c_book_libuser set col=? WHERE bookid=?`, [val, G.id]);
            }
            if (updatecol && updatecol.success) {
                gs.success("Updated!");
            } else {
                gs.fail("Category cannot be submitted");
            }

        } else if (target.matches('input[name="display"]')) {
            const val = target.checked ? 'dark' : 'light';
            gs.coo('display', val);
            document.body.className = val;

        } else if (target.matches("#ssearch_book")) {
            const q = document.getElementById('search_book').value.trim();
            gs.coo('pagenum', 1);
            if (!!q) {gs.coo('q', q);}
            await solr_vivalibro_search(q,1);

        } else if (target.matches("#submit_cat")) {
            event.preventDefault();
            const form = new FormData(document.getElementById("form_cat"));
            const formDataArray = Array.from(form.entries());
            const savenewcat = await gs.api.maria.form(formDataArray);
            if (savenewcat && savenewcat.success) {
                gs.success("New category saved");
            } else {
                gs.fail("Category cannot be submitted");
            }
            gs.db().post(formDataArray, (data, textStatus, jqXHR) => {
                if (data === 'no') {
                    console.log(textStatus, jqXHR);
                    gs.fail("Form cannot be submitted");
                } else {
                    console.log(data);
                    location.href = "/bks/cat";
                }
            }, 'json');

        } else if (target.matches("#newbks")) {
            const savebook = await gs.api.maria.inse("c_book", {title: "new book"});
            if (savebook && savebook.success) {
                location.href = "/book?id=" + savebook.id;
            }

        } else if (target.matches("#submit_book")) {
            event.preventDefault();
            const form = new FormData(document.getElementById("form_book"));
            const formDataArray = Array.from(form.entries());
            formDataArray.push(['saved', gs.time()]);
            console.log(formDataArray);
            const savenewbook = await gs.api.maria.form(formDataArray);
            if (savenewbook && savenewbook.success) {
                console.log(savenewbook);
                alert("Form cannot be submitted");
            }

        } else if (target.matches("select[id^='parent']")) {
            const catid = target.id.replace('parent', '');
            const obj = {
                id: catid,
                value: "parent='" + target.value + "'",
                table: "cat",
                where: "id=" + catid
            };
            console.log(obj);
            gs.db().queryhtml(obj, (data) => console.log(data), "POST");

        } else if (target.matches("#name")) {
            const name = target.value.trim();
            gs.db().query('UPDATE cat SET name=? WHERE id=?', [name, G.id]);
            console.log(name);

        } else if (target.matches("#savewri")) {
            const writer = document.getElementById('writer').value.trim();
            const writerlist = document.querySelector('input[name=writerlist]:checked')?.value;
            if (writerlist) {
                const updatebook = await gs.api.maria.q(`UPDATE book SET writer=' + writerlist + ' WHERE id=${G.id}`);
                if (updatebook && updatebook.success) {
                    const dataname = document.querySelector('input[name=writerlist]:checked').getAttribute('data-name');
                    document.getElementById('writer').value = dataname;
                }
            } else if (writer !== "") {
                const insertwriter = await gs.api.maria.inse("writer", {name: writer});
                if (insertwriter && insertwriter.success) {
                    if (insertwriter.id !== 'no') {
                        gs.api.maria.q(`UPDATE book SET writer=' + insertwriter.id + ' WHERE id=${G.id}`);
                        gs.ui.notify('alert', 'Writer saved');
                    }
                }
            } else {
                gs.ui.notify('alert', 'Please insert a writer');
            }

        } else if (target.matches("#savecat")) {
            const cat = document.getElementById('cat').value.trim();
            const catlist = document.querySelector('input[name=catlist]:checked')?.value;
            if (catlist) {
                console.log('case update');
                const updatebook = await gs.api.maria.q(`UPDATE ${G.publicdb}.book SET c_book_cat=? WHERE id=?`, [catlist, G.id]);
                if (updatebook && updatebook.success) {
                    const dataname = document.querySelector('input[name=catlist]:checked').getAttribute('data-name');
                    document.getElementById('cat').value = dataname;
                }
            } else if (cat !== "") {
                const updatebook = await gs.api.maria.inse("c_book_cat", {name: cat});
                if (updatebook && updatebook.success) {
                    gs.api.maria.q(`UPDATE book SET cat=${updatebook.id} WHERE id=${G.id}`);
                    gs.ui.notify('alert', 'Category saved');
                }
            } else {
                gs.ui.notify('alert', 'Please insert a category.');
            }

        } else if (target.matches("#savedi")) {
            const publisher = document.getElementById('publisher').value.trim();
            const publisherlist = document.querySelector('input[name=publisherlist]:checked')?.value;
            if (publisherlist) {
                console.log('case update');
                gs.api.maria.q('UPDATE book SET publisher=' + publisherlist + ' WHERE id=' + G.id);
                const dataname = document.querySelector('input[name=publisherlist]:checked').getAttribute('data-name');
                document.getElementById('publisher').value = dataname;
            } else if (publisher !== "") {
                console.log('case insert');
                gs.api.maria.inse("publisher", {name: publisher}, (res) => {
                    if (res.success) {
                        gs.api.maria.q(`UPDATE book SET publisher=${res.id} WHERE id=' + G.id`);
                        gs.ui.notify('alert', 'Publisher saved');
                    }
                });
            } else {
                gs.ui.notify('alert', 'Please insert a publisher.');
            }

        } else if (target.matches("#title, #meta, #vol, #status, #isread")) {
            const id = target.id;
            const val = target.value;
            const params = {a: "bookedit", b: id, val: val, id: parseInt(G.id)};
            gs.db().get(params, (res) => {
                console.log(res);
                if (id === "title") document.getElementById('titlebig').textContent = val;
            });

        } else if (target.matches("button[id^='del']")) {
            const id = target.id.replace('del', '');
            gs.confirm("This book record will be deleted. Are you sure?", (res) => {
                if (res) {
                    const params = {a: "del", b: G.page, c: id};
                    console.log(params);
                    gs.db().get(params, (data) => {
                        document.getElementById('nodorder1_' + id).style.display = 'none';
                    });
                }
            });

        } else if (target.matches("#savefinfo")) {
            const sel = document.querySelector("input[name='fitems']:checked")?.value;
            document.getElementById('bookimg').src = sel;
            // Download to media
            // Save to DB

        } else if (target.matches("a[id^='order_']")) {
            const name = target.id.replace('order_', '');
            const orderby = gs.coo('orderby') === name + ' ASC' ? name + ' DESC' : name + ' ASC';
            gs.coo('orderby', orderby);
            gs.coo.del('page');
            location.reload();

        } else if (target.matches("button[id^='page_']")) {
            const pagenum = target.id.replace('page_', '');
            gs.coo('pagenum', pagenum);
            gs.ui.reset('#bookbox');
            await solr_vivalibro_search(false,parseInt(pagenum));

        } else if (target.matches("input[fun='lookup']")) {
            lookup(target);

        } else if (target.matches("button[id^='new_']")) {
            const param = target.id.replace("new_", "");
            const val = document.getElementById(param).value.trim();
            const params = {a: "new", b: param, c: val, id: parseInt(G.id)};

            gs.db().post(params, function (res) {
                console.log(res);
                target.style.display = 'none'; // Hide the button
            });
        }
    })
})
/*
function search_googlebookapi(q){
    var query=q || "Similar Publications"
    $.get("https://www.googleapis.com/books/v1/volumes?q="+query,{},function(res){
        console.log(res)
        var items='';
        // var res= JSON.parse(res);
        for(var i in res.items){
            items += '<div class="smallcard">' +
                '<div class="author">' + gs.implode(',', res.items[i].volumeInfo.authors) + '</div>' +
                '<div class="cover">' +
                (typeof res.items[i].volumeInfo.imageLinks != 'undefined' ? '<img src="' + res.items[i].volumeInfo.imageLinks.thumbnail + '">' : '') +
                '</div>' +
                '<div class="description"><div class="title">' + res.items[i].volumeInfo.title + '<div class="published">'+res.items[i].volumeInfo.publisher+', '+res.items[i].volumeInfo.publishedDate+'</div></div></div></div>';
        }
        // $('#inforeply').html('<h2>'+res.AbstractText+'</h2>');
        $('#finfos').html(items)
        // $( "#finfos" ).after('<button id="savefinfo">Save Info</button>');
        // $('#bookimg').attr('src',)
    })
}
$(document)
    .on("click",'button[id^="save_"]',async function() {
        var col=this.id.replace('save_','');
        var val=$('#'+col).html();
        if(col=='summary') {
            const updatecol=await gs.api.maria.q("UPDATE c_book set col=? WHERE id=?", [val,G.id]);
        }else if(col=='notes') {
            const updatecol=await gs.api.maria.q("UPDATE c_book_libuser set col=? WHERE bookid=?", [val,G.id]);
        }
        if(updatecol && updatecol.success){
            gs.success("Updated!");
        }else{
            gs.fail("Category cannot be submitted");
        }
    })
    .on("click",'input[name="display"]',function(){
       var val=this.checked ? 'dark':'light'
        gs.coo('display',val);
        $('body').attr('class',val);
    })
.on('click', "#submit_cat", async function () {
	 var formid=$("#form_cat")
    event.preventDefault();
    var form = formid.serializeArray();
    const savenewcat=await gs.api.maria.form(form);
    if(savenewcat && savenewcat.success){
        gs.success("New category saved");
    }else{
        gs.fail("Category cannot be submitted");
    }
	s.db().post(form, function (data, textStatus, jqXHR) {
        if (data == 'no') {
            console.log(textStatus)
            console.log(jqXHR)
            gs.fail("Form cannot be submitted");
        } else {
            console.log(data)
              location.href="/bks/cat";
            // formid.reset();
        }
    },'json');

})
.on('click', "#newbks", async function () {
	const savebook=await gs.api.maria.inse("c_book",{title:"new book"});
        if(savebook && savebook.success) {
            location.href = "/book?id=" + res;
        }
})
.on('click', "#submit_book", async function () {
    var formid=$("#form_book");
    event.preventDefault();
    var form = formid.serializeArray();
 //   form[s.size(form)]={name:'uid',value: gs.coo('GID')}
   form[s.size(form)]={name:'saved',value: gs.time()}
    // form[s.size(form)]={name:'status',value: {0:'unread',1:'reading',2:'read'}}
    //form[s.size(form)]={name:'excerpt',value: $('#excerpt').summernote('code')}
    //form[s.size(form)]={name:'content',value: $('#content').summernote('code')}
    console.log(form)
const savenewbook=await gs.api.maria.form(form);
	if(savenewbook && savenewbook.success){
   console.log(data)
   alert("Form cannot be submitted");
    }
})
    .on('change', "select[id^='parent']", function () {
        var catid=this.id.replace('parent','')
        var obj = {
            id :catid,
            value : "parent='"+this.value+"'",
            table : "cat",
            where : "id="+catid
        }
        console.log(obj)
        gs.db().queryhtml(obj, function(data){console.log(data);},"POST");
    })
    .on('keyup', "#name", async function () {
        var name= this.value.trim();
        gs.db().query('UPDATE cat SET name=? WHERE id=?'+G.id,[this.value,G.id]);
        console.log(name)
    })
.on('click', "#savewri", async function () {
    var writer = $('#writer').val().trim();
    var writerlist = $('input[name=writerlist]:checked').val();
        if(typeof(writerlist)!='undefined'){
            const updatebook= await gs.api.maria.q("q",'UPDATE book SET writer='+writerlist+' WHERE id='+G.id);
            if(updatebook && updatebook.success) {
                var dataname = $('input[name=writerlist]:checked').attr('data-name');
                $('#writer').val(dataname);
            }
        }else if(writer!=""){
            const insertwriter= await gs.api.maria.inse("writer",{name:writer});
            if(insertwriter && insertwriter.success) {
                console.log(data)
                if (data != 'no') {
                    gs.api.maria.q('UPDATE book SET writer=' + data + ' WHERE id=' + G.id);
                    gs.ui.notify('alert', 'Writer saved')
                }
            }
        }else{
            gs.ui.notify('alert','Please insert a writer');
        }
})
.on('click', "#savecat", async function () {
        var cat= $('#cat').val().trim();
		var catlist = $('input[name=catlist]:checked').val();
         if(typeof(catlist)!='undefined'){
			 console.log('case update')
             const updatebook= await gs.api.maria.q('UPDATE book SET c_book_cat=? WHERE id=?',[catlist,G.id]);
             if(updatebook && updatebook.success) {
                 var dataname = $('input[name=catlist]:checked').attr('data-name');
                 $('#cat').val(dataname);
             }
        }else if(cat!=""){
             const updatebook= await gs.api.maria.inse("c_book_cat",{name: cat});
				if(updatebook && updatebook.success){
                    gs.api.maria.q('UPDATE book SET cat='+data+' WHERE id='+G.id);
					s.ui.notify('alert','Category saved')
				}
        }else{
            gs.ui.notify('alert','Please insert a category.')
        }
})
.on('click', "#savedi", async function () {
        var publisher= $('#publisher').val().trim();
		var publisherlist = $('input[name=publisherlist]:checked').val();
         if(typeof(publisherlist)!='undefined'){
			 console.log('case update')
             gs.api.maria.q('UPDATE book SET publisher='+publisherlist+' WHERE id='+G.id);
            var dataname= $('input[name=publisherlist]:checked').attr('data-name');
            $('#publisher').val(dataname);
        }else if(publisher!=""){
			console.log('case insert')
             gs.api.maria.inse("publisher",{name:publisher},function(res){
				if(res.success){
                    gs.api.maria.q('UPDATE book SET publisher='+data+' WHERE id='+G.id);
					s.ui.notify('alert','publisher saved')
					}
            });
        }else{
            gs.ui.notify('alert','Please insert a category.')
        }
})
.on('keyup change', "#title, #tag, #vol, #status, #isread", async function () {
	var id=this.id,val=this.value;
	var params={a:"bookedit",b:id,val:val,id:parseInt(G.id)};
	  gs.db().get(params,res=>{
		  console.log(res);
		  if(id=="title")$('#titlebig').text(val)
	  })
})
//delete
.on('click', "button[id^='del']", async function () {
	var id=this.id.replace('del','');
	s.confirm("This book record will be deleted. Are you sure?",function(res){
	if(res){
		var params={a:"del",b:G.page,c:id};
		console.log(params)
		 gs.db().get(params,function(data){
			$('#nodorder1_'+id).hide();
		 })
		 }
	})
})
//find image from google api
.on('click', "#savefinfo", function () {
    var sel= $("input[name='fitems']:checked"). val();
    $('#bookimg').attr('src',sel);
    //download to media
    //save to db
})
    .on("click","a[id^='order_']",function(){
        var name= this.id.replace('order_','')
//log(name)
        var orderby= gs.coo('orderby')== name+' ASC' ? name+' DESC': name+' ASC';
        gs.coo('orderby',orderby);
        gs.coo.del('page');
        // reset('mgr')
        location.reload();
    })
//page
.on('click', "button[id^='page_']", function () {
    var page= this.id.replace('page_', '');
    gs.coo('pagenum',page);
    gs.ui.reset('#bookbox');
    get_booklist()
})
//lista με writers , publishers
  .on('keyup',"input[fun='lookup']",function(){
	lookup(this)
  })
  //specific job help
  .on('click',"button[id^='new_']",function(){
	  var param=this.id.replace("new_","");
	  var val=$('#'+param).val().trim();
	  var params={a:"new",b:param,c:val,id:parseInt(G.id)};
	  	  gs.db().post(params,res=>{
		  console.log(res);
		  $(this).hide();
	  })
  })
  .on('click',"li[id^='loo']",function(){
    var param=this.parentNode.id.replace('loolist_','');
	console.log(param)
      var optionvalue= this.id.replace('loo','');
      var optionid= $(this).attr('val');
      $('#loolist_'+param).hide();
	  //save
	  var params={a:"lookupsave",b:param,c:parseInt(optionid),id:parseInt(G.id)};
	  console.log(params)
	  gs.db().get(params,res=>{
		  console.log(res);
		  $('#'+param).val(optionvalue)
	  })
  })
  function lookup(obj){
	  	var val=obj.value.trim().charAt(0).toUpperCase() + obj.value.trim().slice(1),param=obj.id,
	listi='',length=obj.value.length,counter=0;
	 gs.db().get({a:"lookup",b:param,c:val},function(newd){
	var re=new RegExp(val,"i"),keys=Object.keys(newd),values=Object.values(newd),
     z={},newd= keys.filter(val=>re.test(val)).map(x=>{z[x]=values[keys.indexOf(x)];return z})[0]
    for (var j in newd){
    var piece= j.split(val);
	console.log(piece)
    listi +='<li id="loo'+j+'" val="'+newd[j]+'">' +piece[0]+
        (!!piece[1] ? '<span style="background:yellow">'+val+'</span>'+piece[1]:'')+
        '</li>';
      counter +=1;
    }
	  if (counter >0 && length >0){
      $('#loolist_'+param).html(listi).show();
      //$('#lookupcounter').text(counter)
    } else {
      $('#loolist_'+param).hide()
      if(length > 8){$('#new_'+param).show();}
 //     $('#lookupcounter').text(0);
    }
	});
  }


/*
.on('keyup', "#writer, #publisher, #cat", function () {
  var id=this.id;
  var val=this.value.trim();
    gs.db().get({a:"radiolist",b:id,c:val},function(data){
   console.log(data);
   var list='';
   if(data!='no'){
       for(var i in data){
       list +='<div style="display:flex"><input type="radio" name="'+id+'list" value='+i+' data-name="'+data[i]+'">'+data[i]+'</div>';
       }
   $('#'+id+'list').html(list)
   }

   },'json');
})

.on('click', "input[name='writerlist'], input[name='publisherlist'], input[name='catlist']", function () {
  var name = this.name.replace('list','');
  //if($(this).is(':checked')){$('input[name="'+this.name+'"]').prop("checked", false);}
  var sel= $("input[name='"+this.name+"']:checked").data('name');
  $('#'+name).val(sel)
})
*/

/*queryhtml is this
$.ajax({
    method: method,
    dataType: "json",
    data: { a: 'query', value: obj.value, table: obj.table, where: obj.where },
    url: getAjaxFile(),
    success: callback,
    error: callback
});
*/

/*
.on('change', "#status","#isread", function () {
var obj = {
        id :G.id,
        value : this.id+"='"+this.value+"'",
        table : "book",
        where : "id="+G.id
        }
s.db().queryhtml(obj, function(data){console.log(data);},"POST");
})
*/
