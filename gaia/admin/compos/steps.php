<style>
.step-progress-bar {
  display: flex;
  width: 100%;
  height: 3px; /* Base line height */
  background-color: #ccc;
  position: relative;
}

.step {
  flex: 1;
  position: relative;
  text-align: center;
  cursor: pointer;
}

.step .dot {
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.step .label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
}

.step.active .dot {
  background-color: #4caf50;
  width: 14px; /* Larger dot for active steps */
  height: 14px;
}

.step.active .label {
  color: #4caf50;
}

.step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 2px; /* Height of the progress line */
  background-color: #4caf50;
  width: 100%;
  z-index: -1;
}

.step.active::before {
  height: 3px; /* Thicker line for active steps */
}
</style>

<div class="step-progress-bar">
  <?php
  foreach (range(1, $steps) as $step) { ?>
    <div class="step" data-step="<?=$step?>" onclick="goToStep(<?=$step?>)">
      <div class="dot"></div>
      <span class="label"><?=$step?></span>
    </div>
  <?php } ?>
</div>

<script>
function goToStep(step) {
  // Remove 'active' class from all steps
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

  // Add 'active' class to the clicked step and all previous steps
  for (let i = 1; i <= step; i++) {
    document.querySelector(`.step[data-step="${i}"]`).classList.add('active');
  }

  // Execute action for the specific step (optional)
  executeStepAction(step);
}

function executeStepAction(step) {
  switch (step) {
    case 1:
      console.log("Executing action for Step 1");
      break;
    case 2:
      console.log("Executing action for Step 2");
      break;
    case 3:
      console.log("Executing action for Step 3");
      break;
    case 4:
      console.log("Executing action for Step 4");
      break;
    case 5:
      console.log("Executing action for Step 5");
      break;
    default:
      console.log("Unknown step");
  }
}
</script>
