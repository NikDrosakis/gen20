<!--------with $this->addMetric() use plan -->
<div style="display:flex">
  <div class="chart-container"><canvas id="progressPieChart" width="400" height="200"></canvas></div>
  <div class="chart-container"><canvas id="progressLineChart" width="400" height="200"></canvas></div>
  <div class="chart-container"><canvas id="progressBarChart" width="400" height="200"></canvas></div>
</div>
<div style="display:flex">
      <div class="chart-container"><canvas id="pieChart" width="400" height="200"></canvas></div>
      <div class="chart-container"><canvas id="lineChart" width="400" height="200"></canvas></div>
      <div class="chart-container"><canvas id="barChart" width="400" height="200"></canvas></div>
    </div>
<?php
//$lineDataRaw= $this->db->fa("SELECT YEARWEEK(published) AS week, COUNT(*) AS num_posts
  //                           FROM post
    //                         WHERE published IS NOT NULL
      //                       GROUP BY YEARWEEK(published)
        //                     ORDER BY week");

//$chart=$this->buildCharts("gen_".TEMPLATE.".post");

//xecho($lineDataRaw);
//xecho($barDataRaw);
//$pieDataRaw=$this->db->fa("SELECT postgrpid FROM post ");
//$lineDataRaw= $this->db->fa("SELECT YEARWEEK(created) as week FROM post GROUP BY week ORDER BY week");
//$barDataRaw=$this->db->fa("SELECT taxid FROM post GROUP BY taxid");
   // Pie Chart Data (postgrpid and totals)
  //  $pieLabels = array_column($pieDataRaw, 'postgrpid');
   // $pie = array_combine($pieLabels, 20);
    // Line Chart Data (weekly posts count)
  //  $lineLabels = array_column($lineDataRaw, 'week');
//    $line = array_combine($lineLabels, $totals);

    // Bar Chart Data (taxid and totals)
  //  $barLabels = array_column($barDataRaw, 'taxid');
//    $bar = array_combine($barLabels, $totals);
//$line= $this->db->fa("SELECT YEARWEEK(created) AS week, COUNT(*) AS total FROM post GROUP BY week ORDER BY week");
//$bar=$this->db->fa("SELECT taxid, COUNT(*) AS total FROM post GROUP BY taxid");
//xecho($pie);
//xecho($line);
//xecho($bar);
//$data= json_encode($this->addMetric());
?>
<script>
   const data='<?=$data?>';
    // Call the function to create the chart
    buildChart(data, 'line','progressLineChart');
    buildChart(data, 'pie','progressPieChart');
    buildChart(data, 'bar','progressBarChart');



               const pie='<?=json_encode(["res"=>$chart["pie"]])?>';
               console.log(pie)
               const line='<?=json_encode(["res"=>$chart["line"]])?>';
               console.log(line)
               const bar='<?=json_encode(["res"=>$chart["bar"]])?>';
               console.log(bar)
              buildChart2(line, "line","lineChart");
              buildChart2(pie, "pie","pieChart");
              buildChart2(bar, "bar","barChart");

</script>