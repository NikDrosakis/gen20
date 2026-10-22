<!-----------------SLIDESHOW ADMIN WIDGET------------->
<div id="mainpage">
    <h1>Slideshow Management</h1>
    <?php
      // Fetch slides from the database
    $slides = $this->db->fa("SELECT * FROM c_slideshow ORDER BY sort ASC, id ASC");
  include ADMIN_ROOT."compos/mediac.php";
      ?>


  <h3>Slideshow Cubo</h3>
      <div class="table-container">
          <table id="sortableMedia" class="styled-table">
              <thead>
              <tr>
                  <th>Sort</th>
                  <th>Image</th>
                  <th>filename</th>
                  <th>Caption</th>
                  <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <?php foreach ($slides as $slide): ?>
                  <tr id="slide_<?php echo $slide['id']; ?>">
                      <td class="sort-order"><?php echo $slide['sort']; ?></td>
                      <td><img src="<?=SITE_URL?>media/<?php echo htmlspecialchars($slide['filename']); ?>" style="max-width:100px;"></td>
                      <td><?=$slide['filename']?></td>
                      <td><input name="caption" id="c_slideshow<?=$slide['id']?>" value="<?=$slide['caption']?>"></td>
                      <td><button class="delete-button" id="del<?=$slide['id']?>">Delete</td>
                  </tr>
              <?php endforeach; ?>
              </tbody>
          </table>

</div>

  <script>
          document.addEventListener('DOMContentLoaded', function () {
                      document.addEventListener('click', async function(event) {
                          if (event.target.classList.contains('delete-button')) {
                          console.log("delete event called")
                              await deleteImage(event.target);
                          }
                      });

              // Initialize Sortable on the table body
                      const sortable = new Sortable(document.querySelector('#sortableMedia tbody'), {
                          animation: 150,
                          onEnd: async function (evt) {
                              let orderList = [];

                              // Get all the table rows in the sortable tbody
                              const rows = document.querySelectorAll('#sortableMedia tbody tr');
                              rows.forEach((element, index) => {
                                  const id = element.getAttribute('id').replace('slide_', '');
                                  orderList.push({ id: id, sort: index + 1 });
                              });

                              // Update the database asynchronously for each order change
                              for (let i = 0; i < orderList.length; i++) {
                                  await updateSortOrder(orderList[i].id, orderList[i].sort);
                              }
                          }
                      });
          });
  //MEDIA JS
  async function updateSortOrder(id, sort) {
      try {
          // Assuming gs.api.maria.q is available and works as a query function
          const result = await gs.api.maria.q(`UPDATE ${G.publicdb}.c_slideshow SET sort = ? WHERE id = ?`, [sort, id]);
          return result;
      } catch (error) {
          console.error('Error updating sort order:', error);
      }
  }


  // Capture the blur event when the user finishes editing a caption
  async function deleteImage(checkbox) {
          let id = checkbox.id.replace('del','');
          const confirmation = confirm("This image is going to be deleted. Are you sure?");
          if (confirmation) {
              const delImage = await gs.api.maria.q(`DELETE FROM ${G.publicdb}.c_slideshow WHERE id = ?`, [id]);
              if (delImage.success) {
                  console.log('Slide deleted successfully');
                  document.getElementById(`slide_${id}`).remove();
              }
          }
  }
  </script>

