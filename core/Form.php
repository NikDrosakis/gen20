<?php
namespace Core;
use CKEditor\CKEditor;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

/*
DOC
====
TRAIT FORM (based in Maria.COMMENT) ADMIN to all page tables - Form class dynamic forms from mysql.comment
v.1 reusable method buildForm for all admin pages / used in tables for select join [USED IN 12 PAGEVIEWS (post,postgrp,postgrp_edit,post_edit,user,usergrp,tax,taxgrp,tax_edit,taxgrp_edit)]
v.2 added buildTable with pagination,search,sort,uploadMedia,dropdown filters, metrics, boxes on top of table [to use in > 30 pageviews]
v.3 Create Table from JSON

DOC
====
table page (with table & grouptable)
Byid page _edit, sort drag&drop
new record
orderby +
searchby +
Form head
Form bottom pagination
Form upload media+
Form class reusable of method buildForm
sortability with gs.ui.sort
Form table add pagination
Form footer provide array for 2 metrics (js Chart) using mysql datetime type. which types ?

TODO
====
- add meta
- add event change pagination
- add filter based select + selectjoin
- add header sorc arc to desc
- fix search
- connect add links to selectjoined table
*/


//version 2
trait Form {

use Media;
protected $labeled;
protected $formid;
protected $table;
protected $resultsPerPage=9;
protected $totalRes;
protected $currentPage;
protected $searchTerm;
protected $dbForm;
protected $twig;
protected $res;
/*
USAGE
echo $form->buildForm($table, $schema, $columns, true, $formData);
echo $this->buildTable($table);

 * Adds pagination and search functionality to a query
 *
 * @param string $query The base query to paginate
 * @param ?string $searchTerm Optional search term
 * @param int $currentPage Current page number for pagination
 * @param int $resultsPerPage Results per page
 * @return ?array Returns an array of results or null if none found
 */

   protected function getInputType(string $table): ?array {
    // Fetch metadata for the table columns (including comments)
    $columns = $this->dbForm->tableMeta($table);

    // Define a mapping of SQL data types to HTML input types
    $typeMapping = [
        'varchar'    => 'text',
        'char'       => 'text',
        'text'       => 'textarea',
        'longtext'   => 'editor',
        'mediumtext' => 'editor',
        'int'        => 'number',
        'tinyint'    => 'number',
        'smallint'    => 'number',
        'bigint'     => 'number',
        'decimal'    => 'number',
        'float'      => 'number',
        'double'     => 'number',
        'date'       => 'date',
        'datetime'   => 'datetime-local',
        'timestamp'  => 'datetime-local',
        'time'       => 'time',
        'enum'       => 'select',
        'boolean'    => 'checkbox',
    ];
    // Initialize an array to store input types for each column
    $inputTypes = [];

    // Loop through each column and map the SQL type to the HTML input type
    foreach ($columns as $column) {
        $colName = $column['COLUMN_NAME'];
        $colType = strtolower($column['COLUMN_TYPE']); // Get the SQL type (e.g., varchar, int)
        $colComment = $column['COLUMN_COMMENT']; // Get the comment
        $list = [];

            if (strpos($colType, 'enum') !== false){
                    $htmlType = 'select';
                     $list=$this->getEnumOptions($colType);
                     $colType = substr($colType, 0, strpos($colType, '('));
                  }
              //after get the type clean the types from parenthesis
            if (strpos($colType, '(') !== false) {
                   $colType = substr($colType, 0, strpos($colType, '('));
             }
               // Default HTML type based on SQL type mapping
               $htmlType = $typeMapping[$colType] ?? 'text'; // Fallback to 'text' if no match

               // Override HTML type based on the column comment
               if ($colComment=='readonly' || $colName=='id' || $colName=='sort') {
                   $htmlType = 'label'; // Render as label for readonly

               } elseif ($colComment=='json' ){
                $htmlType = 'json';
                } elseif ($colComment=='twig' ){
                $htmlType = 'twig';
                } elseif ($colComment=='sql' ){
                $htmlType = 'sql';
               } elseif (strpos($colComment, 'selectG') !== false){
                $htmlType = 'select';
                $createList= explode('-',$colComment)[1];
                if($list!=null){
                $list=$this->G[$createList];
                }

               }elseif (strpos($colComment, 'exe') !== false) {
                   $htmlType = 'button'; // Render as button

               }elseif (strpos($colComment, 'selectjoin') !== false) {
                   $htmlType = 'select'; // Render as select dropdown for custom selection

               } elseif (strpos($colComment, 'upload') !== false) {
                   $uploadType=explode('-',$colComment)[0];
                   $htmlType = $uploadType; // Render file input for uploads

               }elseif ($colType === 'tinyint' && $colComment === 'boolean') {
                 $htmlType= 'checkbox';
               }
               // Store the input type for this column
               $inputTypes[$colName] = [
                   'type'     => $htmlType,  // HTML input type
                   'sql_type' => $colType,   // SQL type
                   'comment'  => $column['COLUMN_COMMENT'], // Original column comment
                   'list'  =>  $list ?? [], // Original column comment
               ];
           }
    return $inputTypes;
}


 /*
  abstraction to all tables
  counter UC
 */
 protected function buildCharts(string $table){
 if(!$this->dbForm){
 $this->dbForm=$this->getDBInstance($table);
 }

$chart['line'] = $this->dbForm->fa("SELECT YEARWEEK(published) AS week, COUNT(*) AS num_posts
                                 FROM $table
                                 WHERE published IS NOT NULL
                                 GROUP BY YEARWEEK(published)
                                 ORDER BY week");
$chart['pie'] = $this->dbForm->fa("SELECT postgrp.name AS label, COUNT(*) AS total
                                FROM $table
                                LEFT JOIN postgrp ON post.postgrpid = postgrp.id
                                GROUP BY post.postgrpid");
$chart['bar'] = $this->dbForm->fa("SELECT tax.name AS label, COUNT(*) AS total
                                FROM $table
                                LEFT JOIN tax ON tax.id = post.taxid
                                GROUP BY post.taxid");
   // Pie Chart Data (postgrpid and totals)
    //$pieLabels = array_column($pieDataRaw, 'postgrpid');
    //$chart['pie'] = array_combine($pieLabels, $totals);
    // Line Chart Data (weekly posts count)
    //$lineLabels = array_column($lineDataRaw, 'week');
    //$chart['line'] = array_combine($lineLabels, $totals);

    // Bar Chart Data (taxid and totals)
    //$barLabels = array_column($barDataRaw, 'taxid');
    //$chart['bar'] = array_combine($barLabels, $totals);
//return $chart;
$piejson = json_encode(["res" => $chart["pie"]]);
$linejson = json_encode(["res" => $chart["line"]]);
$barjson = json_encode(["res" => $chart["bar"]]);
return '<div style="display:flex">
  <div class="chart-container"><canvas id="pieChart" width="400" height="200"></canvas></div>
  <div class="chart-container"><canvas id="lineChart" width="400" height="200"></canvas></div>
  <div class="chart-container"><canvas id="barChart" width="400" height="200"></canvas></div>
</div><script>
  const pie = "' . addslashes($piejson) . '";
  buildChart2(pie, "pie", "pieChart");

  const line = "' . addslashes($linejson) . '";
  buildChart2(line, "line", "lineChart");

  const bar = "' . addslashes($barjson) . '";
  buildChart2(bar, "bar", "barChart");
    </script>';

}
/**
 * Build an HTML table based on the data provided.
 *
 * @param string $table The table name or alias.
 * @param array $cols Optional. Column definitions; if empty, inferred from getInputType.
 * @return string HTML table as a string.
 USAGE
$this->buildTable([table,"cols"=[]);

 */

protected function buildTable($tableName,array $params=[]): string {

$table = is_array($tableName) ? $tableName['table'] : $tableName;
//instantiate those public vars
$cols = $params['cols'] ?? [];
$this->dbForm=$this->getDBInstance($table);
$this->table=$table;
$subpage=explode('.',$table)[1];
$searchTerm=$params['q'];
$style = $this->sub!=''
        ? "margin:0;" //in subpage large
        : "zoom:0.8;";  //in 6channel small
$tableHtml =  $this->renderFormHead($table);
$tableHtml .= '<div class="table-container" style="'.$style.'">';
//handleNewRow(event, \'' . $table . '\', {0: {row: \'name\', placeholder: \'Give a Name\'}, 1: {row: \'created\', type: \'hidden\', value: gs.date(\'Y-m-d H:i:s\')}})
$tableHtml .= '<button class="bare right" onclick="gs.ui.switcher(\'#new_' . $subpage . '_box\')">
    <span class="glyphicon glyphicon-plus"></span> New ' . $subpage . '</button>';
$tableHtml .= '<div style="display:none" id="new_'.$subpage.'_box">
    <div class="gform"><div class="gs-span"><label for="name">Name</label>
    <input class="gs-input" name="name" placeholder="Give a Name" id="' . $subpage . '_name" type="text" value=""></div>
        <button class="button" name="' . $table . '" onclick="insertNewRow(event)">DO</button>
    </div></div>';
$tableHtml .= $this->formSearch($table);

$tableHtml .= $this->buildCoreTable($tableName,$params);

$tableHtml .= $this->formPagination($this->totalRes, $this->currentPage);

     if($table=='post'){   $tableHtml .= $this->buildCharts($table); }
    $tableHtml .= '</div>';
    return $tableHtml;
}

protected function buildCoreTable($tableName) {

    $table = is_array($tableName) ? $tableName['table'] : $tableName;
    $subpage=explode('.',$table)[1];
    $searchTerm=is_array($tableName) ? $tableName['q'] : null;
    $orderbyTerm=$tableName['orderby'] ?? null;
   // Fetch current page from query parameters (default to 1)
    $this->currentPage =is_array($tableName) && $tableName['pagenum'] ? str_replace($subpage,'',$tableName['pagenum']) : 1;

    $searchTerm=is_array($tableName) ? $tableName['q'] : null;
    //instantiate those public vars
    $cols = $params['cols'] ?? [];
    $this->dbForm=$this->getDBInstance($table);
    $this->table=$table;
    $subtable = explode('.',$this->table)[1];
    // Fetch column types and definitions via getInputType
    if (empty($cols)) {
        $cols = $this->getInputType($table); // Get column metadata
    }
    // Calculate the starting row for the current page
   // $offset = ((int)$this->currentPage - 1) * $this->resultsPerPage;

      $query= "SELECT * FROM $table";
      // Modify query for search functionality
        if ($searchTerm) {
            $query .= " WHERE name LIKE '%$searchTerm%'";
        }
      //include pagination
      if($orderbyTerm){
        $query .= " ORDER BY  $orderbyTerm";
      }elseif(in_array('sort',array_keys($cols))){
        $query .= " ORDER BY sort";
      }
        //$query .=" LIMIT $offset, $this->resultsPerPage ";

         // Fetch paginated rows based on current page and results per page
         $rows = $this->dbForm->fetch($query,[],$this->resultsPerPage,$this->currentPage);
       //  xecho($rows);
        // Fetch total number of rows in the table
         $this->totalRes = $rows['total'];
         $data= $rows['data'];

//xecho($countQuery);
//xecho($this->totalRes);
    //create the table container
    $tableHtml .= '<table  id="' . $subpage . '_table" class="styled-table">';

    $tableHtml .= '<thead>';
    $tableHtml .= '<tr>';

    //loop of head
    foreach ($cols as $colName => $colData) {
     //       xecho($colData['type']);
        // Skip 'textarea', 'MEDIUMTEXT', and 'LONGTEXT' columns entirely
        if (in_array($colData['type'], ['textarea', 'editor'])) {
            continue;
        }
        $label = ucfirst($colName); // Use comment or column name as label
        $tableHtml .= '<th>';
        // Check if the column is 'sort' for sorting behavior
        $tableHtml .= '<button class="orderby" onclick="gs.form.updateTable(this, \'buildCoreTable\');" data-table="'.$table.'" data-orderby="'.$colName . '" id="order:' . $subtable.':'.$colName . '">' . $label . '</button>';
        $tableHtml .= '</th>';
    }
    $tableHtml .= '<th>Action</th></tr>';
    $tableHtml .= '</thead>'; // End header row
    // Build table body
    $tableHtml .= '<tbody id="list">';

    //loop of body
    foreach ($data as $row) {
    $this->formid=$row['id'];

    //add sortable <tr "
     $tableHtml .= '<tr id="'.$table.'_'.$row['id'].'" class="menuBox">';
       //loop of data
        foreach ($cols as $colName => $colData) {
            // Skip 'textarea', 'MEDIUMTEXT', and 'LONGTEXT' fields entirely
            if (in_array($colData['type'], ['textarea', 'editor'])) {
                continue;
            }
            $tableHtml .= '<td>';
            $inputType = $colData['type'];

            // Auto ID column
            if ($colName === 'id') {
                 $tableHtml .= '<a href="/admin/'.$this->page.'/'.$subpage.'?id='.$row['id'].'"><span class="glyphicon glyphicon-edit"></span></a>';
                 $tableHtml .= htmlspecialchars($row['id']);

            }elseif ($colName === 'sort') {
                 $tableHtml .= '<span id="menusrt'.$row['id'].'">'.$row['sort'].'</span>';

            // Render label for readonly fields
            } elseif ($inputType === 'label') {
                $tableHtml .= htmlspecialchars($row[$colName]);

            } elseif ($inputType === 'button') {
                $tableHtml .= $this->renderButtonField($colData['comment'],$row[$colName]);
            // Handle selectjoin to create a link
            } elseif (strpos($colData['comment'], 'selectjoin') !== false) {
                        $rowtable = str_replace('selectjoin-', '', $colData['comment']);
                        $tableName = explode('.', $rowtable)[0];
                        $rowId = explode('.', $rowtable)[1];
                        $link=$this->page==$tableName ? $tableName.'?id=' . $row[$rowId] : $this->page.'/'.$tableName.'?id=' . $row[$rowId];
                        $tableHtml .= '<a href="/admin/' . $link . '"><span class="glyphicon glyphicon-link"></span></a> ';
                        $options=$this->getSelectOptions($colData['comment'],$row[$colName]);
                        $tableHtml .=  $this->renderSelectField($colName, $row[$colName], $options);

            // Render select field (fetch options using getSelectOptionsFromComment)
            }elseif ($inputType === 'checkbox') {
                $tableHtml .= '<input id="'.$colName.$row['id'].'"   onchange="updateRow(this, \'' . $table . '\')" type="checkbox" switch="" '.($row[$colName] ? "checked":"").' class="switcher">';

           }elseif ($inputType === 'select') {

            if($colData['sql_type']=='enum'){
                $options=$colData['list'];
            }else{
                $options=$this->getSelectOptions($colData['comment'],$row[$colName]);
            }
                $tableHtml .= $this->renderSelectField($colName, $row[$colName], $options);

            // Render an image for img fields
            }elseif ($inputType === 'img') {
                $imgPath = $this->validateImg($row[$colName]);
                $tableHtml .= '<img src="' . htmlspecialchars($imgPath) . '" alt="' . $colName . '" style="height:50px; max-width:100px;" />';

          }elseif ($inputType == 'datetime-local') {
                          $tableHtml .= '<input type="' . htmlspecialchars($inputType) . '"
                                         onchange="updateRow(this, \'' . $table . '\')"
                                         name="' . $colName . '"
                                         id="' . $colName . $row['id'] . '"
                                         value="' . ($row[$colName] != '' ? htmlspecialchars($row[$colName]) : '') . '" />';

          }elseif ($inputType == 'text') {
                    $tableHtml .= '<input type="' . htmlspecialchars($inputType) . '"
                                         onkeyup="updateRow(this, \'' . $table . '\')"
                                         name="' . $colName . '"
                                         id="' . $colName . $row['id'] . '"
                                         value="' . ($row[$colName] != '' ? htmlspecialchars($row[$colName]) : '') . '" />';
          }elseif ($inputType !== 'editor') {
      $tableHtml .= '<textarea type="' . htmlspecialchars($inputType) . '"
                                               onkeyup="updateRow(this, \'' . $table . '\')"
                                               name="' . $colName . '"
                                               id="' . $colName . $row['id'] . '"/>' . ($row[$colName] != '' ? htmlspecialchars($row[$colName]) : '') . '</textarea>';

           }

            $tableHtml .= '</td>';
        }
        $tableHtml .= '<td><button id="del' . $row['id'] . '" type="button" value="' . $row['id'] . '" title="delete"
          onclick="deleteRow(this, \'' . $table . '\')"
        class="bare"><span class="glyphicon glyphicon-trash"></span></button></td></tr>';
    }
    $tableHtml .= '</tbody>';
        $tableHtml .= '</table>';
        // Add pagination AFTER the table

    return $tableHtml;
}

protected function formSearch($table): string {
    $params = [];
    $params['q'] = htmlspecialchars($this->searchTerm ?? ''); // Keep the previous search term
    // Use json_encode to safely embed PHP variables into JavaScript as a string
    return <<<HTML
    <div class="search-container">
        <input type="text" data-table='$table' onkeyup="this.dataset.q = this.value; gs.form.updateTable(this, 'buildCoreTable')" placeholder="Search..." class="search-input">
        <button class="icon-button"><i class="icon">🔍</i></button>
    </div>
HTML;
}

protected function formPagination(int $totalRes,int $cur=1): string {
    // Use the pagination details from the buildForm call
    $current = $this->currentPage ??  $cur;
    $this->resultsPerPage= $this->resultsPerPage ?? 10;
    $table= explode('.',$this->table)[1];
    $totalPages = ceil($totalRes / 9);
    if ($totalRes <= $this->resultsPerPage) {
        return '';  // No need for pagination if everything fits on one page
    }

    // Fix the onclick syntax here
$onclick = 'data-table="' . $this->table . '" onclick="this.dataset.pagenum = this.id.replace(\'page_\',\'\'); gs.form.updateTable(this, \'buildCoreTable\');gs.form.go2page(this)"';
    $previous = $current > 1 ? '<button class="page-link" ' . $onclick . ' id="page_' . ($current - 1) . '">Previous</button>' : '';
    $firstb = '<button ' . $onclick . ' id="page_1" ' . ($current == 1 ? ' class="page-link active"' : '') . '>1</button>';

    $starting = $current <= 5 ? 2 : $current - 4;
    $ending = min($totalPages, $current <= 5 ? 10 : $current + 4);

    $list = '';
    for ($i = $starting; $i <= $ending; $i++) {
        $list .= '<button ' . $onclick . ' class="' . ($current == $i ? 'page-link active' : 'page-link') . '" id="page_' . $table.$i . '">' . $i . '</button>';
    }

    $lastb = $totalPages >= 10 && $current != $totalPages ? '<button ' . $onclick . ' class="page-link" id="page_' .$table.$totalPages . '">Last</button>' : '';
    $next = $current < $totalPages ? '<button ' . $onclick . ' class="page-link" id="page_' . $table.($current + 1) . '">Next</button>' : '';

    return '<div id="pagination">' . $previous . $firstb . $list . $lastb . $next . '</div>';
}

public function renderTwigContent($post) {
    // Decode JSON template
    $template = is_json($post) ? json_decode($post, true) : $post;

    if (!$template) {
        return "Error: Invalid JSON template format.";
    }

    // Initialize Twig with the decoded template
    $loader = new ArrayLoader(["index"=>$template]);
    $twig = new Environment($loader);

    // Ensure `$this->res` contains the required data
    if (!isset($this->res) || !is_array($this->res)) {
        return "Error: Template data (`\$this->res`) is not set or invalid.";
    }

    try {
        // Render the "Archive" template
        $htmlContent = $twig->render('index', $this->res);
        return $htmlContent;
    } catch (\Exception $e) {
        // Catch and return any Twig rendering errors
        return "Error rendering Twig template: " . $e->getMessage();
    }
}

protected function renderFormHead($table){
$subpage=explode('.',$table)[1];
 $page = $this->G['subparent'][$subpage];
return '<h3>
            <input id="cms_panel" class="red indicator">
            <a href="/admin/'.$page.'/'.$subpage.'"><span class="glyphicon glyphicon-edit"></span>'.ucfirst($table).'</a>
  </h3>';
}

    // Method to generate a form for a given table, schema, columns, etc.
  protected function buildForm(string $table,array $params=[]): string {
         // Default values for each parameter
         $this->table=$table;
         $defaults = [
             'db' => "gen_".TEMPLATE,
             'table' => '',
             'res' => [],
             'form' => false,
             'cols' => [],
             'id' => $this->id,
             'labeled' => true,
         ];
         // Merge provided params with defaults
         $params = array_merge($defaults, $params);
         $this->dbForm = $this->getDBInstance($table);
        //set db
       // $this->dbForm=$params['db']=="gen_".TEMPLATE ? $this->db: $this->admin;
         if(empty($params['res'])){
         $params['res'] = $this->dbForm->f("SELECT * from $table where id=?",[$params['id']]);
        }
         // Access parameters using $params array
         $res = $this->res = $params['res'];
         $form = $params['form'];
         $cols = $params['cols'];
         $labeled = $params['labeled'];

      //instantiate those public vars
         $this->labeled=$labeled;
         $this->formid=$res['id'];

        $formHead=$this->renderFormHead($table);
//TODO add metadata links
        $return = $formHead.'<div class="pagetitle-container">
                           <span onclick="previd(this)" class="btn btn-secondary">
                               <i class="glyphicon glyphicon-chevron-left"></i> Previous
                           </span><div id="title" class="pagetitle">'.$table.'
                               <a href="/architecture" target="_blank" class="btn btn-link" style="font-size: small;">Public View</a>
                           </div>
                           <span onclick="nextid()" class="btn btn-secondary">
                               Next <i class="glyphicon glyphicon-chevron-right"></i>
                           </span>
                   </div>';
        $img = $this->validateImg($res['img']);
        // If we are building a form, start with form tags
        if ($form) {
            $return .= "<form id='form_$table'><input type='hidden' name='a' value='new'>";
            $return .= "<input type='hidden' name='table' value='$table'>";
        }else{
            $return .= "<section id='form_$table'>";
        }

        $tableMeta = $this->getInputType($table);  // Get column type and related info
        // Loop through each column to build form fields
//        xecho($tableMeta);
        if(empty($cols)){
        $cols=array_keys($tableMeta);
        }
        foreach ($cols as $col) {
             $resVal = $res[$col] ?? '';  // Get the value from the result array or use an empty string
            // Render form fields based on the column type
            $return .= $this->renderFormField($col, $tableMeta[$col], $resVal);
        }
        // If form tags were opened, close them
        if ($form) {
            $return .= "</form>";
        }else{
            $return .= "</section>";
        }
        return $return;
    }

protected function drop(array $options, $dbtable, string $method="", string $onchangeMethod=""): string {
      $select = "<select id='$method' class='gs-select' onchange=\"updateForm(this, '$onchangeMethod')\"><option value=''>Select</option>";
            $selectedkey= $method=='getMariaTree' ? $_COOKIE['selected_db'] :$_COOKIE['selected_table'];
                  foreach ($options as $key => $label) {
                     $selected = ($label == $selectedkey) ? 'selected="selected"' : '';
                      $select .= "<option value='$label' $selected>$label</option>";
                     }
                     $select .= "</select>";
        return $select;
     }
    // Helper function to parse the column type
   // protected function getColumnType(string $type): array {
     //   $typ = explode('-', $type);  // Split the type on "-"
       // return [
         //   'main' => $typ[0],  // Main type (text, number, select, etc.)
           // 'related' => $typ[1] ?? null  // Related data (like foreign key or editor type)
        //];
    //}
protected function renderFileFormList(array $list, string $title = "File List"): string {
    $html = "<div class='file-list-container'>";

    // Add the title
    $html .= "<h3 class='file-list-title'>$title</h3>";

    // Begin file list container
    $html .= "<div class='file-list'>";
    foreach ($list as $fileName) {
        $safeFileName = htmlspecialchars($fileName, ENT_QUOTES, 'UTF-8');

        // Each file card container
        $html .= "<div class='file-item'>";

        // Checkbox for selecting the file
        $html .= "<input type='checkbox' name='selectedFiles[]' value='$safeFileName'
                     onchange='updateFileSelection(this, \"$safeFileName\")'>";

        // Display the file name
        $html .= "<span class='file-name'>$safeFileName</span>";

        // Delete button with JavaScript call
        $html .= "<button type='button' class='delete-button' onclick='deleteFile(\"$safeFileName\")'>X</button>";

        $html .= "</div>"; // Close file card container
    }

    $html .= "</div></div>"; // Close file list and container
    return $html;
}

    // Helper function to render select dropdowns
   // Helper to render select dropdowns
//$this->getMariaTree(),$domain,'getMariaTree',"listMariaTables","listMariaTables"
//$this->drop($this->listMariaTables($domain),'','listMariaTables',"buildTable")
protected function renderSelectField($fieldName, $selectedValue, array $options): string {
        $select= "<select class='gs-select' onchange='updateRow(this, \"$this->table\")' name='$fieldName' id='$fieldName$this->formid'><option value=0>Select</option>";
                  foreach ($options as $key => $label) {
                     $selected = ($key == $selectedValue) ? 'selected="selected"' : '';
                      $select .= "<option value='$key' $selected>$label</option>";
                     }
                     $select .= "</select>";
        $html = !$this->labeled ? $select : "<div class='gs-span'><label for='$col'>$col</label>$select</div>";
        return $html;
     }

protected function renderButtonField($comment,$value): string {
    // Define the load command
    $loadCommand = str_replace('exe-', '', $comment);
    // Check mark or X based on $value
    $icon = $value == 1
        ? '<span style="color: green; font-size: 1.2em;">✔️</span>'
        : '<span style="color: red; font-size: 1.2em;">❌</span>';

    // Return the HTML with icon and button
        return "
        <div id='{$loadCommand}_container'>
            <div id='{$loadCommand}'>$icon</div>
               <button class='button' onclick=\"const val = document.getElementById('name').value; gs.form.loadButton('$loadCommand', '{$this->table}', val)\">{$loadCommand}</button>
        </div>";
}


// Function to handle select dropdown options from comment or subtable
protected function getSelectOptions(string $comment): array {
    // If selectG or selectjoin, parse and fetch options dynamically from a subtable
    if (strpos($comment, 'selectG') !== false) {
        // Handle logic to fetch dynamic options from a table or predefined array
        $list=str_replace('selectG-','',$comment);
        return $this->G[$list]; // Example static options
    }elseif(strpos($comment, 'selectjoin') !== false){
        $rowtable=str_replace('selectjoin-','',$comment);
        $table=explode('.',$rowtable)[0];
        $row=explode('.',$rowtable)[1];
        return $this->dbForm->flist("SELECT id,$row FROM $table order by $row");
    }
    return [];
}

protected function getEnumOptions($sqlType) {
    // Extract ENUM values from the SQL type definition (e.g., "ENUM('value1', 'value2')")
    if (preg_match("/^enum\((.*)\)$/i", $sqlType, $matches)) {
        // Extract the values and trim any quotes around them
        $enumValues = explode(',', str_replace("'", "", $matches[1]));

        // Return key-value pairs where the key and value are the same
        $enumOptions = [];
        foreach ($enumValues as $value) {
            $enumOptions[$value] = $value; // Key and value are the same
        }
        return $enumOptions;
    }
    return [];
}

protected function renderFormField(string $col, array $fieldData, $value = ''): string{
    // Extract the type and any additional data (e.g., comments or SQL type)
    $inputType = $fieldData['type'];
    $comment   = $fieldData['comment'] ?? '';
    $sqlType   = $fieldData['sql_type'] ?? '';
    $list   = $fieldData['list'] ?? [];

    // Generate the appropriate HTML field based on the type

    switch ($inputType) {
        case 'label':  // Read-only field rendered as label
            return "<div class='gs-span'><label for='$col'>$col</label><p class='static-value'>$value</p></div>";
        break;
        case 'select':  // Dropdown field
            // Generate options from the comment or an external source
          if ($sqlType == 'enum') {
                $options = $list; // Extract ENUM options
            }else{
                $options = $this->getSelectOptions($comment, $value);
            }
                return $this->renderSelectField($col, $value,$options);
        break;
        case 'img':  // File upload field
          $imgPath = $this->validateImg($value);
            return "<div class='gs-span' id='drop-zone' ondrop='handleDrop(event)' ondragover='handleDragOver(event)'><label for='$col'>$col</label>
                <button onclick='openMedia()'><img src='$imgPath' style='height:250px;width: 229px;margin: -21px 0 0 -21px;' draggable='false'></button>
            </div>";
        break;
        /*
         case 'twig':
                // Handle Twig preview (rendered HTML)
                $value=json_decode($value,true)['Archive'];
                $renderedTwigContent = $this->renderTwigContent($this->res);  // Render the Twig content here
return '<div class="gs-span">
            <label for="' . $col . '">' . $col . '</label>
            <div class="gs-preview-container">
            <textarea class="gs-textarea" name="' . $col . '" id="' . $col . '" placeholder="' . $col . '">' . $value . '</textarea>
                ' . $renderedTwigContent . '
            </div>
        </div>
        <button class="button save-button" onclick="saveContent(\'' . $col . '\', \'' . $table . '\')" type="button" id="save_' . $col . '">Save Content</button>';

        break;
        */
        case 'twig':
            // Handle Twig preview (rendered HTML)
            //$value = json_decode($value, true)['Archive'];
            $renderedTwigContent = $this->renderTwigContent($value);  // Render the Twig content here
      //      xecho($renderedTwigContent);
        //    xecho($value);
            return '
                <div class="gs-span">
                    <label for="' . $col . '">' . $col . '</label>
                    <div class="gs-preview-container">
                        <textarea class="gs-textarea" name="' . $col . '" id="' . $col . '" placeholder="' . $col . '">' . $value . '</textarea>
                        ' . $renderedTwigContent . '
                        <div class="twig-editor" id="twig-editor' . $col . '" style="height: 500px;"></div>
                    </div>
                </div>
                <button class="button save-button" onclick="saveContent(\'' . $col . '\', \'' . $table . '\')" type="button" id="save_' . $col . '">Save Content</button>
                <script>
                    const editor = CodeMirror(document.getElementById("twig-editor' . $col . '"), {
                        mode: "twig",
                        lineNumbers: true,
                        theme: "dracula",
                        value: `' . addslashes($value) . '`, // Set initial content from the $value variable
                    });
                    document.getElementById("save_' . $col . '").addEventListener("click", () => {
                        const template = editor.getValue();
                        fetch("/api/save-template", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ template })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            alert("Template saved successfully!");
                        })
                        .catch(error => console.error("Error:", error));
                    });
                </script>
            ';
            break;

        case 'sql':
                // Handle SQL preview (raw SQL code)
                $preview= xechox($this->db->fetch($value));
                return "<div class='gs-span'>
    <label for='$col'>$col</label>
    <div class='gs-preview-container'>
       <textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
       '.$preview.'
    </div>
    <button class='button save-button' onclick='saveContent(\'' . $col . '\', \'' . $table . '\')' type='button' id='save_$col'>Save Content</button>
        </div>";
         break;
        case 'json':
     //   $value = json_decode($value,true);
               return "<div class='gs-span'><label for='$col'>$col</label>
                       <code><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'><code>$value</code></textarea></code>
                       </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\")' type='button' id='save_$col'>Save Content</button>";
        break;
        case 'textarea':
        $col = htmlspecialchars($col, ENT_QUOTES, 'UTF-8');
        $table = htmlspecialchars($this->table, ENT_QUOTES, 'UTF-8');
        $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); // Escaping the value a
               if($comment =='code'){
               return "<div class='gs-span'><label for='$col'>$col</label>
                <button onclick='navigator.clipboard.writeText(this.nextElementSibling.innerText || this.nextElementSibling.value)' class='glyphicon glyphicon-copy'></button>
               <code><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea></code>
               </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\")' type='button' id='save_$col'>Save Content</button>";
               }else{
               return "<div class='gs-span'><label for='$col'>$col</label><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
                 </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\")' type='button' id='save_$col'>Save Content</button>";
              }
        break;
        case 'button':
          return $this->renderButtonField($comment,$value);
        break;
        case 'editor':  // CKEditor or rich-text editor
                $col = htmlspecialchars($col, ENT_QUOTES, 'UTF-8');
                $table = htmlspecialchars($this->table, ENT_QUOTES, 'UTF-8');
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); // Escaping the value a
        return "<div class='gs-span'>
                    <label for='$col'>$col</label>
                     <textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
                    <button class='bare save-button' onclick='saveContent(\"$col\", \"$this->table\")' type='save' id='save_$col'>Save Content</button>
                </div>
                <script>
                    if (CKEDITOR.instances['$col']) {
                        CKEDITOR.instances['$col'].destroy(true);
                    }
                    CKEDITOR.replace('$col');
                </script>";
        break;
        case 'number':  // Numeric input (int, float, etc.)
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input'  onkeyup='updateRow(this, \"$this->table\")'  onchange='updateRow(this, \"$this->table\")' type='number' name='$col' id='$col' value='$value'></div>";
        break;        case 'date':  // Date input
        case 'datetime-local':  // Datetime input
              $datevalue = date('Y-m-d', strtotime($value));
              return "<div class='gs-span'><label for='$col'>$col</label>
              <input class='gs-input' name='$col' id='$col' type='date' value='$datevalue' placeholder='$col'>
              </div>";
        break;
        case 'checkbox':  // Boolean input (checkbox)
            $checked = ($value) ? 'checked' : '';
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input' onclick='updateRow(this, \"$this->table\")'  type='checkbox' name='$col' id='$col' $checked></div>";
         break;
        case 'text':  // Default text input
        default:
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input' onkeyup='updateRow(this, \"$this->table\")'  type='text' name='$col' id='$col' value='$value'></div>";
        break;
    }
}
}