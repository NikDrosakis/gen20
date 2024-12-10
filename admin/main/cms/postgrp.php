<!---postgrp table dropdown opening post table,  update , delete, create new-->
<h3>
    <input id="cms_panel" class="red indicator">
    <a href="/cms/postgrp"><span class="glyphicon glyphicon-edit"></span>Postgroup</a>
</h3>

<!--------POSTGRP TABLE-------------->
<button class="bare right" id="create_new_postgrp">New Postgrp</button>
<div id="new_postgrp_box"></div>
    <?php
    // Fetch slides from the database
    $postgrps = $this->db->fa("SELECT * FROM postgrp");
    ?>
    <div class="table-container">
        <table id="postgrp_table" class="styled-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Img</th>
                <th>Name</th>
                <th>Title</th>
                <th>Status</th>
                <th>Template</th>
                <th>Action</th>
            </tr>

            </thead>
            <tbody>
            <?php foreach ($postgrps as $val){ ?>
                <tr id="postgrp_<?=$val['id']?>">
                    <td class="sort-order"> <?=$val['id']?> </td>
                    <td><img id="img<?=$val['id']?>" src="<?=$val['img']=='' ? '/admin/img/myface.jpg': UPLOADS.$val['img']?>" width="30" height="30"></td>
                    <td class="sort-order"><input name="name" id="<?=$val['id']?>" value="<?=$val['name']?>"></td>
                    <td><input id="<?=$val['id']?>" name="title" value="<?=$val['title']?>"></td>
                    <td><input id="<?=$val['id']?>" name="status" value="<?=$val['status']?>"></td>
                    <td><input id="<?=$val['id']?>" name="template" value="<?=$val['template']?>"></td>
                    <td><button class="bare" class="delete-postgrp" id="del<?=$val['id']?>" value="<?=$val['id']?>">Delete</td>
                </tr>
            <?php } ?>
            </tbody>
        </table>
    </div>

<script>
        async function handleNewPostgroup(event){
            // Check for 'globs_tab' in cookies
            const new_postgrp_box = document.getElementById('new_postgrp_box');
            if (new_postgrp_box.innerHTML === "") {
                try{
                const new_postgrp = await gs.form.generate({
                    adata: "postgrp", nature: "new", append: "#new_postgrp_box",
                    list: {
                        0: {
                            row: 'name',
                            placeholder: "PostGroup Name",
                            params: "required onkeyup='this.value=gs.greeklish(this.value)'"
                        },1: {
                            row: 'title',
                            placeholder: "Title"
                        },2: {
                            row: 'template',
                            placeholder: "Template"
                        },
                        3: {row: 'status', type: "drop", global: {0:'closed',1:'inactive',2:'active'}, globalkey: true, placeholder: "Select status"}
                    }
                })
                if (new_postgrp && new_postgrp.success) {
                    new_postgrp_box.innerHTML = '';
                };
                 } catch (error) {
                        console.warn('Error loading widget:', error);
                    }
            } else {
                new_postgrp_box.innerHTML = '';
            }
        }

    async function deletePostGroup(id) {
      try {
        await gs.api.maria.q("DELETE FROM postgrp WHERE id=?", [id]);
        console.log(`Deleted postgrp with ID ${id}`);
        const rowToDelete = document.getElementById(`postgrp_${id}`);
        if (rowToDelete) {
          rowToDelete.remove();
        }
      } catch (error) {
        console.error('Error deleting postgrp:', error);
      }
    }
    async function updatePostGroup(field,value,id) {
            if (field === 'name' || field === 'title' || field === 'status' || field === 'template') {
              try {
                await gs.api.maria.q(`UPDATE postgrp SET ${field}=? WHERE id=?`, [value, id]);
                console.log(`Updated ${field} for postgrp ID ${id}`);
              } catch (error) {
                console.error(`Error updating ${field}:`, error);
              }
            }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById("create_new_postgrp").addEventListener("click", handleNewPostgroup);

      const tableBody = document.querySelector('#postgrp_table tbody'); // Replace with the ID of your table's <tbody>

      // Event handler for input changes (name, title, status, template)
      tableBody.addEventListener('input', (event) => {
        const input = event.target;
        const id = input.id;
        const field = input.name; // Use the name attribute to identify the field
        const value = input.value;
        updatePostGroup(field,value,id);
      });

        tableBody.addEventListener('click', async (event) => {
         const suredelete= await gs.confirm("You are going to delete id ${id}. Are you sure?");
          if(suredelete.isConfirmed){
            const button = event.target;
            const id = button.id.replace('del','');
            // Call the async delete function
            deletePostGroup(id);
            }
          });

   });
</script>



<!--------POST TABLE-------------->
<h3>
    <input id="cms_panel" class="red indicator">
    <a href="/cms/post"><span class="glyphicon glyphicon-edit"></span>Post</a>
</h3>

<button class="bare right" id="create_new_post">New Post</button>
<div id="new_post_box"></div>

<div class="table-container">
<table id="post_table" class="styled-table">
    <thead>
	<tr class="">
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_sort">sort</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_id">ID</button></th>
		<th>img</th><th><button onclick="s.table.orderby(this);" class="orderby" id="order_name">Name</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_status">Status</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_uri">Uri</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_title">Title</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_subtitle">Taxonomy</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_postgrpid">Postgrpid</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_created">Created</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_published">Published</button></th>
		<th><button onclick="s.table.orderby(this);" class="orderby" id="order_delete">Action</button></th>
	</tr></thead>

	<tbody id="list1" class="group1">
	<?php
	   $posts = $this->db->fa("SELECT * FROM post");
	$langprefix=$this->G['langprefix'];
	foreach($posts as $vals){  ?>
		<tr id="nodorder1_<?=$postid?>" style="cursor:move;">
			<td><span id="menusrt<?=$postid?>"><?=$vals['sort']?></span></td>
			<td id="id<?=$postid?>"><span id="id<?=$postid?>"><?=$vals['id']?></span></td>
			<td><img id="img<?=$vals['id']?>" src="<?=$vals['img']=='' ? '/admin/img/myface.jpg': UPLOADS.$vals['img']?>" width="30" height="30"></td>
			<td><a href="/admin/user?uid=<?=$vals['uid']?>"><?=$vals['username']?></a></td>
			<td id="status<?=$vals['id']?>"><span id="status<?=$vals['id']?>"><?=$vals['status']?></span></td>
			<td>
                <a href="/cms/post?id=<?=$vals['id']?>">GOTO</a>
			    <input name="uri" id="post<?=$vals['id']?>" value="<?=$vals['uri']?>">
			</td>
			<td>
                <a href="/admin/post?id=<?=$vals['id']?>">GOTO</a>
                <input name="title" id="post<?=$vals['id']?>" value="<?=$vals['title'.$langprefix]?>">
                </td>
			<td><?=$vals['taxname']?></td>
			<td id="postgrpid<?=$vals['id']?>"><span id="postgrpid<?=$vals['postgrpid']?>"><?=$vals['postgrpid']?></span></td>
			<td id="published<?=$vals['id']?>"><?=$vals['created']?></td>
			<td id="published<?=$vals['id']?>"><?=$vals['published']?></td>
			<td><button id="delete<?=$vals['id']?>" value="<?=$vals['id']?>" name="DELETE FROM post WHERE id=@id" title="delete" class="btn btn-default btn-xs" onclick="gs.ui.table.execute(this.id,this.name,this.value,this.title,'nodorder1_')">Delete</button></td>
		</tr>
	<?php } ?>

	</tbody>
</table>

	</div>

<script>
     document.addEventListener('DOMContentLoaded', () => {

            document.getElementById("create_new_post").addEventListener("click", handleNewPost);
              const PostBody = document.querySelector('#post_table tbody');

              // Event handler for input changes (name, title, status, template)
              PostBody.addEventListener('input', (event) => {
                const input = event.target;
                const id = input.id;
                const field = input.name; // Use the name attribute to identify the field
                const value = input.value;
                updatePost(field,value,id);
              });

                PostBody.addEventListener('click', async (event) => {
                 const suredelete= await gs.confirm("You are going to delete id ${id}. Are you sure?");
                  if(suredelete.isConfirmed){
                    const button = event.target;
                    const id = button.id.replace('del','');
                    // Call the async delete function
                    deletePost(id);
                    }
                  });
        })




            async function deletePost(id) {
              try {
                await gs.api.maria.q("DELETE FROM post WHERE id=?", [id]);
                console.log(`Deleted postgrp with ID ${id}`);
                const rowToDelete = document.getElementById(`post_${id}`);
                if (rowToDelete) {
                  rowToDelete.remove();
                }
              } catch (error) {
                console.error('Error deleting post:', error);
              }
            }
            async function updatePost(field,value,id) {
                    if (field === 'uri' || field === 'title') {
                      try {
                        await gs.api.maria.q(`UPDATE post SET ${field}=? WHERE id=?`, [value, id]);
                        console.log(`Updated ${field} for post ID ${id}`);
                      } catch (error) {
                        console.error(`Error updating ${field}:`, error);
                      }
                    }
            }
      async function handleNewPost(event){
                // Check for 'globs_tab' in cookies
                const new_post_box = document.getElementById('new_post_box');
                if (new_post_box.innerHTML === "") {
                    try{
                    const new_post = await gs.form.generate({
                        adata: "post", nature: "new", append: "#new_post_box",
                        list: {
                        0: {row: 'title',placeholder: "Give a Title"},
                        1: {row: 'created',type:'hidden',value: gs.date('Y-m-d H:i:s')},
                        }
                        });
                    if (new_post && new_post.success) {
                        new_post_box.innerHTML = '';
                    };
                     } catch (error) {
                            console.warn('Error loading widget:', error);
                        }
                } else {
                    new_post_box.innerHTML = '';
                }
            }

</script>