<style>
    /* Star container */
    .stars {
        display: flex;
        justify-content: center;
        align-items: center;
        direction: rtl; /* Right-to-left for better clicking experience */
    }

    /* Hide the radio inputs */
    .stars input {
        display: none;
    }

    /* Style for each star label */
    .stars label {
        font-size: 2rem; /* Size of the stars */
        color: #ccc; /* Default star color */
        cursor: pointer;
        transition: color 0.2s;
    }

    /* Change the color of the stars when checked */
    .stars input:checked ~ label {
        color: #ffcc00; /* Star color when selected */
    }

    /* Change color on hover, keeping selected stars active */
    .stars label:hover,
    .stars label:hover ~ label {
        color: #ffcc00; /* Hover color */
    }

    /* Ensure checked stars stay highlighted when hovering over lower stars */
    .stars input:checked ~ label:hover,
    .stars input:checked ~ label:hover ~ label,
    .stars input:checked ~ label:hover ~ input ~ label {
        color: #ffcc00;
    }
</style>

<div class="stars">
    <?php foreach (range(5, 1) as $star) { ?>
        <input type="radio" <?=$sel['stars']==$star ? 'checked':''?> id="star<?=$star?>" name="rating" value="<?=$star?>">
        <label for="star<?=$star?>" title="<?=$star?> stars">★</label>
    <?php } ?>
</div>

<script>
    $(document)
        .on("click",'input[name="rating"]',async function() {
          const stars=this.id.replace('star','');
          const getuserid=await gs.api.maria.f("SELECT userid FROM vl_book_rating WHERE bookid=? AND userid=?",[G.id,coo('GSID')]);
          if(getuserid && getuserid.success){
          if(!!getuserid.data){
          const updaterating=await gs.api.maria.q("UPDATE vl_book_rating SET stars=? WHERE bookid=? and userid=?",[stars,G.id,getuserid.data]);
          }else{
          const updaterating=await gs.api.maria.inse('vl_book_rating',{'userid':coo('GSID'),'bookid':G.id,'stars':stars,'created':time()});
          }
      if(updaterating && updaterating.success){
           $(this).prop("checked", true);
           gs.success("Book rated");
           }else{
           gs.fail("Book not rated");
           }
       }
        });
</script>