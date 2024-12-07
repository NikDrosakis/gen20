<style>
/* Base styles for the grid */
body.grid-enabled {
  background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 5px 5px; /* 5x5 pixel squares */
  position: relative;
}

.grid-mode-admin {
  background-color: rgba(255, 255, 255, 0.7); /* Light overlay for admin mode */
}

.grid-mode-public {
  background-color: transparent;
}
</style>
this is the language
<?php echo $this->pugTest();?>
<?php //xecho($this->buildNewlangColumns()); ?>
