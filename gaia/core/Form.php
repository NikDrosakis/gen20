<?php
/** 
@filemeta.description CRUD Actions from Users & Admins, administers forms and tables, trait form (based in Maria.COMMENT) ADMIN to all page tables - Form class dynamic forms from mysql.comment
@fm.updatelog
v1 reusable method buildForm for all admin pages / used in tables for select join [USED IN all PAGEVIEWS where form or table is visible]
v2 added buildTable with pagination,search,sort,uploadMedia,dropdown filters, metrics, boxes on top of table [to use in > 30 pageviews]
v3 Create Table from JSON
v4 Updated file format for Filemeta
@filemeta.features
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
event change pagination
filter based select + selectjoin
meta added
sort desc added
search added on top
@filemeta.todo
automatic links to selectjoined table 
*/

namespace Core;
use CKEditor\CKEditor;
use Pug\Pug;
use Exception;

trait Form {

use Media;
use Tree;
protected $labeled; #
protected $formid; #
protected $table; #
protected $resultsPerPage=9; #used for pagination
protected $totalRes;         #total results
protected $currentPage;      #current page 
protected $searchTerm;      #
protected $db;           #instance of a new database
protected $res;             #results

//description analyzed db $table COMMENTS AND format, providing input types for table & forms
//doc use anywhere as a root function of dbcentrism
//todo instead of table, insert sql query for more complex inputs
protected function getInputType(string $table): ?array {
    // @fm.features Fetch metadata for the table columns (including comments)
    $columns = $this->db->tableMeta($table);
    // @fm.features Define a mapping of SQL data types to HTML input types
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
    // @fm.features Initialize an array to store input types for each column
    $inputTypes = [];
    // @fm.features Loop through each column and map the SQL type to the HTML input type
    foreach ($columns as $column) {
        $colName = $column['COLUMN_NAME'];
        $colType = strtolower($column['COLUMN_TYPE']); // @fm.features Get the SQL type (e.g., varchar, int)
        $colComment = $column['COLUMN_COMMENT']; // @fm.features Get the comment
        $list = [];
        $filters = [];

            if (strpos($colType, 'enum') !== false){
                    $htmlType = 'select';
                     $list=$this->getEnumOptions($colType);
                     $colType = substr($colType, 0, strpos($colType, '('));
                  }
              // @fm.features after get the type clean the types from parenthesis
            if (strpos($colType, '(') !== false) {
                   $colType = substr($colType, 0, strpos($colType, '('));
             }
               // @fm.features Default HTML type based on SQL type mapping
               $htmlType = $typeMapping[$colType] ?? 'text'; // @fm.features Fallback to 'text' if no match

               // @fm.features Override HTML type based on the column comment
               if ($colComment=='readonly' || $colName=='id' || $colName=='sort') {
                   $htmlType = 'label'; // @fm.features Render as label for readonly

               } elseif (in_array($colComment,['method','json','pug','cron','sql','md','comma','yaml','javascript'])){
                $htmlType = $colComment;
               } elseif (strpos($colComment, 'selectG') !== false){
                $htmlType = 'select';
                $createList= explode('-',$colComment)[1];
                if($list!=null){
                $list=$this->G[$createList];
                }

               }elseif (strpos($colComment, 'exe') !== false) {
                   $htmlType = 'button'; // @fm.features Render as button

               }elseif (strpos($colComment, 'selectjoin') !== false) {
                   $htmlType = 'select'; // @fm.features Render as select dropdown for custom selection

               } elseif (strpos($colComment, 'upload') !== false) {
                   $uploadType=explode('-',$colComment)[0];
                   $htmlType = $uploadType; // @fm.features Render file input for uploads

               }elseif ($colType === 'tinyint' && $colComment === 'boolean') {
                 $htmlType= 'checkbox';
               }
               // @fm.features Store the input type for this column
               $inputTypes[$colName] = [
                   'type'     => $htmlType,  // @fm.features HTML input type
                   'sql_type' => $colType,   // @fm.features SQL type
                   'comment'  => $column['COLUMN_COMMENT'], // @fm.features Original column comment
                   'list'  =>  $list ?? [], // @fm.features Original column comment
               ];
           }
    return $inputTypes;
}

/**
  abstraction to all tables
  counter UC
  updated to working $key_fields

foreign keys
bases on selectjoin/status/ENUM aka on children not on parents

*/
protected function buildChart(string $table, $joinedKeys){
   // Unset the table itself from $joinedKeys if it exists
   // xecho($table);
        unset($joinedKeys[$key]);
  // xecho($joinedKeys);
$types=['line','pie','bar'];
//xecho($joinedKeys);
$justTable=explode('.',$table)[1];

//get all strpos selectjoin,selectG & format ENUMS of $table
//$selectjoin="gen_vivalibrocom.postgrp";

$return=[];
foreach($joinedKeys as $selectjoin){

$joinedRow=explode('.',$selectjoin)[1];
try {
$query = "SELECT YEARWEEK(created) AS week,COUNT(*) AS num FROM $table WHERE status = 2 GROUP BY YEARWEEK(created) ORDER BY week";
$return[]["line"]= $this->db->flist($query);
 } catch (Exception $e) {
            $return[]["line"] = ['error' => $query . $e->getMessage()];
        }
try {
$query = "SELECT $justTable.name AS label,COUNT(*) AS total FROM $table LEFT JOIN $selectjoin ON $justTable.{$joinedRow}id = {$justTable}.id GROUP BY {$joinedRow}.id";
$return[]["pie"]= $this->db->flist($query);
} catch (Exception $e) {
            $return[]["pie"] = ['error' => $query . $e->getMessage()];
        }
try{
$query = "SELECT $justTable.name AS label,COUNT(*) AS total FROM $table LEFT JOIN $selectjoin ON $justTable.{$joinedRow}id = {$justTable}.id GROUP BY {$joinedRow}.id";
$return[]["bar"]= $this->db->flist($query);
} catch (Exception $e) {
            $return[]["bar"] = ['error' => $query . $e->getMessage()];
        }
}
return $return;
}
protected function renderTable($table) {
    $tableid = explode('.',$table)[1]."_table";
    return "<button onclick=\"gs.form.updateTable('$tableid', 'buildCoreTable');\" class=\"page-link\" >Render</button>";
}
/**
@fm.description Build an HTML table based on the data provided.
 1) creates the query
 2) switch cases of column format returning html
 */
protected function buildTable($tableName,array $params=[]): string {
$table = is_array($tableName) ? $tableName['key'] : $tableName;
//error_log(print_r($table));
#instantiate those public vars
$cols = $params['cols'] ?? [];
$this->table=$table;
$subpage=explode('.',$table)[1];
$searchTerm=$params['q'] ?? null;
$style = $this->sub!=''
        ? "margin:0;" #in subpage large
        : "zoom:0.8;";  #in 6channel small
// @fm.features Fetch column types and definitions via getInputType
if (empty($cols)) {
$cols = $this->getInputType($table); // @fm.features Get column metadata
}
//error_log(print_r($cols),true);
$tableHtml='';
$custom_tools_beforetable = ADMIN_ROOT."main/".$this->page."/".$subpage.".php";
if(file_exists($custom_tools_beforetable)){
$tableHtml .= $this->include_buffer($custom_tools_beforetable,$cols,$params);
}
$tableHtml .=  $this->renderFormHead($table);
$tableHtml .= '<div class="table-container" style="'.$style.'">';

//if($this->totalRes > 10){
$tableHtml .= $this->formSearch($table);

$tableHtml .= $this->renderTable($table);

$joinedKeys=[];
foreach($cols as $colName => $colData){
if(strpos($colData['comment'],'selectjoin')!==false || strpos($colData['comment'],'selectG')!==false ){
    $tableHtml .= $this->formFilters($colData);
    //$joinedKeys[]=$tableName.".".$colName;
    if(strpos($colData['comment'],'selectjoin')!==false){
    $join=explode('-',$colData['comment'])[1];
    $joinedKeys[]=explode('.',$join)[0].'.'.explode('.',$join)[1];
    }
}
}
 //  $tableHtml .= $this->buildChart($table,$joinedKeys);
//}

try {
$tableHtml .= $this->buildCoreTable($tableName,$cols=[]);
} catch (Exception $e) {
            $tableHtml .= "<div class='error'>Error loading $tableName. Please check table and db name.</div>";
  }

   if($this->totalRes > 0){
        $tableHtml .= $this->formPagination($this->totalRes, $this->currentPage);
    }
    $tableHtml .= '</div>';

    return $tableHtml;
}

// @fm.features only the core table without top inputs
/**
 abstraction with pug json
{
  "id": "td a(href=`/admin/${page}/${subpage}?id=${row.id}`) span.glyphicon.glyphicon-edit | ${row.id}",
  "sort": "td span(id=`menusrt${row.id}`) ${row.sort}",
  "label": "td | ${is_string(value) ? htmlspecialchars(value, 'ENT_QUOTES', 'UTF-8') : ''}",
  "javascript": "td = renderRunField(method, row.name, row[colName])",
  "button": "td = renderButtonField(colData.comment, row[colName])",
  "selectjoin": "td a(style='position: absolute;', href=`/admin/${link}`) span.glyphicon.glyphicon-link | #{renderSelectField(colName, row[colName], options)}",
  "checkbox": "td input#${colName}${row.id}(type='checkbox', switch='', checked='${row[colName] ? \"checked\" : \"\"}', class='switcher', onchange=`gs.form.updateRow(this, '${table}')`)",
  "method": "td = renderSelectField(colName, row[colName], getClassMethods())",
  "select": "td = renderSelectField(colName, row[colName], options)",
  "img": "td img(src=`${validateImg(row[colName])}`, alt='${colName}', style='height:34px; max-width:100px;') + button(onclick=`gs.form.loadButton('updateCuboImg', '${table}', '${row.name}')`) span.bare.glyphicon.glyphicon-refresh",
  "datetime-local": "td input(type='datetime-local', onchange=`gs.form.updateRow(this, '${table}')`, name='${colName}', id='${colName}${row.id}', value='${row[colName] !== '' ? htmlspecialchars(row[colName]) : ''}')",
  "text": "td input(type='text', onkeyup=`gs.form.updateRow(this, '${table}')`, name='${colName}', id='${colName}${row.id}', value='${row[colName] !== '' ? htmlspecialchars(row[colName]) : ''}')",
  "textarea": "td textarea(onkeyup=`gs.form.updateRow(this, '${table}')`, name='${colName}', id='${colName}${row.id}') | ${row[colName] !== '' ? htmlspecialchars(row[colName]) : ''}",
  "default": "td input(type='text', name='${colName}', value='${row[colName] !== '' ? htmlspecialchars(row[colName]) : ''}')",
  "deleteButton": "td button#del${row.id}(type='button', value='${row.id}', title='delete', onclick=`gs.form.deleteRow(this, '${table}')`, class='bare') span.glyphicon.glyphicon-trash"
}
 */

protected function tableBody($tableName,$cols=[],$data=[]) {
    $table = is_array($tableName) ? $tableName['table'] : $tableName;
    $subpage=explode('.',$table)[1];

   // @fm.features Build table body
   $tableHtml = '<tbody id="list">';
    #loop of body
    foreach ($data as $row) {
    $this->formid=$row['id'];

    #add sortable <tr "
     $tableHtml .= '<tr id="'.$table.'_'.$row['id'].'" class="menuBox">';
       #loop of data
        foreach ($cols as $colName => $colData) {
        $value=$row[$colName];
            // @fm.features Skip 'textarea', 'MEDIUMTEXT', and 'LONGTEXT' fields entirely
            if (in_array($colData['type'], ['textarea', 'editor'])) {
                continue;
            }
            $tableHtml .= '<td>';
            $inputType = $colData['type'];

            // @fm.features Auto ID column
            if ($colName === 'id') {
                 $tableHtml .= '<a href="/admin/'.$this->page.'/'.$subpage.'?id='.$row['id'].'"><span class="glyphicon glyphicon-edit"></span></a>';
                 $tableHtml .= htmlspecialchars($row['id']);

            }elseif ($colName === 'sort') {
                 $tableHtml .= '<span id="menusrt'.$row['id'].'">'.$row['sort'].'</span>';

            // @fm.features Render label for readonly fields
            } elseif ($inputType === 'readonly') {
                $tableHtml .= $value;
            } elseif ($inputType === 'label') {
                $tableHtml .= is_string($value) ? htmlspecialchars($value, ENT_QUOTES, 'UTF-8') : '';

            } elseif (strpos($colData['comment'], 'javascript') !== false) {
                $method = str_replace('javascript-', '', $colData['comment']);
                $tableHtml .= $this->renderRunField($method,$row['name'],$value);

            } elseif ($inputType === 'button') {
                $tableHtml .= $this->renderButtonField($colData['comment'],$value);

            // @fm.features Handle selectjoin to create a link
            } elseif (strpos($colData['comment'], 'selectjoin') !== false) {
                        $rowtable = str_replace('selectjoin-', '', $colData['comment']);
                        $tableName = explode('.', $rowtable)[0];
                        $rowId = explode('.', $rowtable)[1];
                        $link=$this->page==$tableName ? $tableName.'?id=' . $row[$rowId] : $this->page.'/'.$tableName.'?id=' . $row[$rowId];
                        $tableHtml .= '<a style="position: absolute;" href="/admin/' . $link . '"><span class="glyphicon glyphicon-link"></span></a> ';
                        $options=$this->getSelectOptions($colData['comment'],$value);
                        $tableHtml .=  $this->renderSelectField($colName, $value, $options);

            // @fm.features Render select field (fetch options using getSelectOptionsFromComment)
            }elseif ($inputType === 'checkbox') {
                $tableHtml .= '<input id="'.$colName.$row['id'].'"   onchange="gs.form.updateRow(this, \'' . $table . '\')" type="checkbox" switch="" '.($value ? "checked":"").' class="switcher">';

           }elseif ($inputType === 'file') {
                $options= glob(ADMIN_ROOT."main/*",GLOB_ONLYDIR);
                $tableHtml .= $this->renderSelectField($colName, $value, $options);

           }elseif ($inputType === 'method') {
              $options=$this->getClassMethods();
                $tableHtml .= $this->renderSelectField($colName, $value, $options);

           }elseif ($inputType === 'select' && $colData['sql_type']=='enum') {
                    $options=$colData['list'];
                $tableHtml .= $this->renderSelectField($colName, $value, $options);

          } elseif (strpos($colData['comment'], 'selectjoin') !== false) {
                    $options=$this->getSelectOptions($colData['comment'],$value);
                $tableHtml .= $this->renderSelectField($colName, $value, $options);

            // @fm.features Render an image for img fields
          }elseif ($inputType === 'img') {
                $imgPath = $this->validateImg($value);
                $tableHtml .= '<img src="' . htmlspecialchars($imgPath) . '" alt="' . $colName . '" style="height:34px; max-width:100px;" />';
                $actions = json_encode([
                  ['method' => 'updateCuboImg', 'params' => ['name' => $row['name']]]
                  ]);
            //       ['method' => 'buildTable', 'params' => ['table' => 'gen_vivalibro.action_task']],
            //instead of gs.form.loadButton(\'updateCuboImg\', \'' . $row['name'] . '\')
     //   $tableHtml .= '<button onclick="gs.form.loadButton(\'updateCuboImg\', \'' . $table . '\', \'' . $row['name'] . '\')"><span style="position:absolute" class="bare glyphicon glyphicon-refresh"></span></button>';
          }elseif ($col['type'] == 'int') {
                           $tableHtml .= '<input type="number"
                                                   onchange="gs.form.updateRow(this, \'' . $table . '\')"
                                                   name="' . $colName . '"
                                                   id="' . $colName . $row['id'] . '"
                                                   value="' . ($value != '' ? htmlspecialchars($value) : '') . '" />';

          }elseif ($inputType == 'datetime-local') {
                          $tableHtml .= '<input type="' . htmlspecialchars($inputType) . '"
                                         onchange="gs.form.updateRow(this, \'' . $table . '\')"
                                         name="' . $colName . '"
                                         id="' . $colName . $row['id'] . '"
                                         value="' . ($value != '' ? htmlspecialchars($value) : '') . '" />';

          }elseif ($inputType == 'text') {
                    $tableHtml .= '<input type="' . htmlspecialchars($inputType) . '"
                                         onkeyup="gs.form.updateRow(this, \'' . $table . '\')"
                                         name="' . $colName . '"
                                         id="' . $colName . $row['id'] . '"
                                         value="' . ($value != '' ? htmlspecialchars($value) : '') . '" />';
          }elseif ($inputType !== 'editor') {
      $tableHtml .= '<textarea type="' . htmlspecialchars($inputType) . '"
                                               onkeyup="gs.form.updateRow(this, \'' . $table . '\')"
                                               name="' . $colName . '"
                                               id="' . $colName . $row['id'] . '"/>' . ($value != '' ? htmlspecialchars($value) : '') . '</textarea>';
           }
            $tableHtml .= '</td>';
        }
        $tableHtml .= '<td><button id="del' . $row['id'] . '" type="button" value="' . $row['id'] . '" title="delete"
          onclick="gs.form.deleteRow(this, \'' . $table . '\')"
        class="bare"><span class="glyphicon glyphicon-trash"></span></button></td></tr>';
        }

        $tableHtml .= '</tbody>';
       // @fm.features Add pagination AFTER the table
    return $tableHtml;
}

protected function tableHead($table,$cols=[]) {
    #loop of head
     $subtable = explode('.',$table)[1];
     $tableHtml = '<thead>';
     $tableHtml .= '<tr>';
    foreach ($cols as $colName => $colData) {
        // @fm.features Skip 'textarea', 'MEDIUMTEXT', and 'LONGTEXT' columns entirely
        if (in_array($colData['type'], ['textarea', 'editor'])) {
            continue;
        }
        $label = ucfirst($colName); // @fm.features Use comment or column name as label
        $tableHtml .= '<th>';
        $tableHtml .= '<button class="orderby" onclick="gs.form.updateTable(this, \'buildCoreTable\');" data-table="'.$table.'" data-orderby="'.$colName . '" id="order:' . $subtable.':'.$colName . '">' . $label . '</button>';
        $tableHtml .= '</th>';
    }
    $tableHtml .= '<th></th></tr>';
    $tableHtml .= '</thead>';
    return $tableHtml;
}

protected function buildCoreTable($tableName,$cols=[]) {
         $table = is_array($tableName) ? $tableName['table'] : $tableName;
              $subpage=explode('.',$table)[1];
              $searchTerm=is_array($tableName) ? $tableName['q'] : null;
              $orderbyTerm=$tableName['orderby'] ?? false;
          if (empty($cols)) {
          $cols = $this->getInputType($table); // @fm.features Get column metadata
          }

           // @fm.features Fetch current page from query parameters (default to 1)
            $this->currentPage =is_array($tableName) && $tableName['pagenum'] ? str_replace($subpage,'',$tableName['pagenum']) : 1;

            $searchTerm=is_array($tableName) ? $tableName['q'] : null;
            #instantiate those public vars
            $this->table=$table;

            // @fm.features Calculate the starting row for the current page
           // @fm.features $offset = ((int)$this->currentPage - 1) * $this->resultsPerPage;
              $query= "SELECT * FROM $table";
              // @fm.features Modify query for search capabilities
                if ($searchTerm) {
                    $query .= " WHERE name LIKE '%$searchTerm%'";
                }
              #include pagination
              if($orderbyTerm){
                $q .= " ORDER BY $orderbyTerm desc";
              }elseif(in_array('sort',array_keys($cols))){
                $q .= " ORDER BY sort ASC";
              }
               #$query .=" LIMIT $offset, $this->resultsPerPage ";
               // @fm.features Fetch paginated rows based on current page and results per page

               $rows = $this->db->fetch($query,[],$this->resultsPerPage,$this->currentPage,$orderbyTerm);
               // @fm.features Fetch total number of rows in the table
               $this->totalRes = $rows['total'];
                $data= $rows['data'];

            #create the table container
        $tableHtml = '<table class="styled-table" data-table="'.$table.'" data-pagenum="1" id="' . $subpage . '_table">';
        //call buildHead
         $tableHtml .= $this->tableHead($table,$cols);
        //call buildCore
        $tableHtml .= $this->tableBody($table,$cols,$data);
        $tableHtml .= '</table>';
    return $tableHtml;
}


// @fm.description filters on top of the table from selectjoin or selectG
protected function formFilters($colData,$row=[]) {
        $rowtable = str_replace('selectjoin-', '', $colData['comment']);
        $tableName = explode('.', $rowtable)[1];
        $colName = explode('.', $rowtable)[2];
        $link=$this->page==$tableName ? $tableName.'?id=' . $row["id"] : $this->page.'/'.$tableName.'?id=';
        $tableHtml .= '<a href="/admin/' . $link . '"><span class="glyphicon glyphicon-link"></span></a> ';
        $options = $this->getSelectOptions($colData['comment'], $row[$colName]);
        if($options){
        return $this->renderSelectField($colData['comment'], $row[$colName], $options);
        }
        return '';
}

// @fm.description form search bar
protected function formSearch($table,$return='buildCoreTable'): string {
    $params = [];
    $params['q'] = htmlspecialchars($this->searchTerm ?? ''); // @fm.features Keep the previous search term
    // @fm.features Use json_encode to safely embed PHP variables into JavaScript as a string
    return <<<HTML
    <div class="search-container">
        <input type="text" data-table='$table' onkeyup="this.dataset.q = this.value; gs.form.updateTable(this, '$return')" placeholder="Search..." class="search-input">
        <button class="icon-button"><i class="icon">🔍</i></button>
    </div>
HTML;
}

// @fm.description form pagination bar
protected function formPagination(int $totalRes,int $cur=1): string {
    // @fm.features Use the pagination details from the buildForm call
    $current = $this->currentPage ??  $cur;
    $this->resultsPerPage= $this->resultsPerPage ?? 10;
    $table= explode('.',$this->table)[1];
    $totalPages = ceil($totalRes / 9);
    if ($totalRes <= $this->resultsPerPage) {
        return '';
    }

    // @fm.features Fix the onclick syntax here
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
protected function renderCronEditor($post) {
    $cronExpression = $post['cron_expression'] ?? '* * * * *'; // Default value or provided one
    return <<<HTML
<label for="cron_expression">Schedule (Command to Execute)</label>
<input
    type="text"
    class="gs-input"
    onchange="gs.form.updateRow(this, '{$this->table}')"
    id="cron_expression"
    name="cron_expression"
    value="$cronExpression"
    placeholder="e.g., * * * * *"
    required>
<small>Use standard cron format (minute, hour, day, month, weekday).</small>
HTML;
}
// @fm.description render doc
protected function renderDoc(string $table){
$html = "<h3>Documentation $table</h3>";
$doc= $this->db->f("select doc from gen_admin.alinks where name=?",[$table])['doc'];
$html .="<p>$doc</p>";
return $html;
}

/**
  @fm.description render form head
  works on tables in form           gen_admin.systems (with dot)
  and for files in this in format   developer/schema  (with slash)
 */
protected function renderFormHead($table){
if (strpos($table, "/") !== false) {
    $parts = explode('/', $table);
    $subpage = $parts[1];
    $page = $parts[0];
} elseif (strpos($table, ".") !== false) {
    $parts = explode('.', $table);
    $subpage = $parts[1];
    $page =$this->G['subparent'][$subpage];
}
 #gs.form.handleNewRow(event, \'' . $table . '\', {0: {row: \'name\', placeholder: \'Give a Name\'}, 1: {row: \'created\', type: \'hidden\', value: gs.date(\'Y-m-d H:i:s\')}})
return '<h3>
            <input id="cms_panel" class="red indicator">
           <button class="bare" onclick="openPanel(\'compos/doc.php\')"><span class="glyphicon glyphicon-info-sign bare"></span></button>
           <button class="bare" onclick="openPanel(\'compos/guide.php\')"><span class="glyphicon glyphicon-question-sign"></span></button>
            <a href="/admin/'.$page.'/'.$subpage.'"><span class="glyphicon glyphicon-edit"></span>'.ucfirst($subpage).'</a>
            <button class="bare right" onclick="gs.ui.switcher(\'#new_' . $subpage . '_box\')">
                <span class="glyphicon glyphicon-plus"></span></button>
                <div style="display:none" id="new_'.$subpage.'_box">
                <div class="gform"><div class="gs-span"><label for="name">Name</label>
                <input class="gs-input" name="name" placeholder="Give a Name" id="' . $subpage . '_name" type="text" value=""></div>
                    <button class="button" name="' . $table . '" onclick="gs.form.insertNewRow(event)">DO</button>
                </div></div>
  </h3>';
}

// @fm.description Generate a form for a given table, schema, columns.
  protected function buildForm(string $table,array $params=[]): string {
         // @fm.features Default values for each parameter
         $this->table=$table;
         $defaults = [
             'db' => $this->publicdb,
             'table' => '',
             'res' => [],
             'form' => false,
             'cols' => [],
             'id' => $this->id,
             'labeled' => true,
         ];
         // @fm.features Merge provided params with defaults
         $params = array_merge($defaults, $params);
        #set db
       // @fm.features $this->db=$params['db']=="gen_".TEMPLATE ? $this->db: $this->db;
         if(empty($params['res'])){
         $params['res'] = $this->db->f("SELECT * from $table where id=?",[$params['id']]);
        }
         // @fm.features Access parameters using $params array
         $res = $this->res = $params['res'];
         $form = $params['form'];
         $cols = $params['cols'];
         $labeled = $params['labeled'];

      #instantiate those public vars
         $this->labeled=$labeled;
         $this->formid=$res['id'];
// @fm.dependent renderFormHead
        $formHead=$this->renderFormHead($table);
#TODO add metadata links
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
// @fm.dependent validateImg
        $img = $this->validateImg($res['img']);
        // @fm.features If we are building a form, start with form tags
        if ($form) {
            $return .= "<form id='form_$table'><input type='hidden' name='a' value='new'>";
            $return .= "<input type='hidden' name='table' value='$table'>";
        }else{
            $return .= "<section id='form_$table'>";
        }
// @fm.dependent getInputType
        $tableMeta = $this->getInputType($table);  // @fm.features Get column type and related info
        // @fm.features Loop through each column to build form fields
       if(empty($cols)){
        $cols=array_keys($tableMeta);
        }
        foreach ($cols as $col) {
             $resVal = $res[$col] ?? '';  // @fm.features Get the value from the result array or use an empty string
            // @fm.features Render form fields based on the column type
            //error_log($tableMeta[$col]);
            $return .= $this->renderFormField($col, $tableMeta[$col], $resVal);
        }
        // @fm.features If form tags were opened, close them
        if ($form) {
            $return .= "</form>";
        }else{
            $return .= "</section>";
        }
        return $return;
    }

// @fm.description builds dropdown
//array $options, string $selected="", string $method="", string $name=""
protected function drop(array $params=[]): string {
    extract($params);
    $escapedMethod = $method;
    $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $appendid=$escapedMethod.$escapedName;
      $select = "<select id='$method' class='gs-select' onchange=\"gs.api.run('{$escapedName}','{$escapedMethod}','{$appendid}')\"><option value=''>Select</option>";
                  foreach ($output as $key => $label) {
                     $selectedQ = ($key == $selected) ? 'selected="selected"' : '';
                      $select .= "<option value='$label' $selectedQ>$label</option>";
                     }
                     $select .= "</select>";
        return $select;
     }

 // @fm.description builds list
protected function renderFileFormList(array $list, string $title = "File List"): string {
    $html = "<div class='file-list-container'>";
    //  Add the title
    $html .= "<h3 class='file-list-title'>$title</h3>";

    //  Begin file list container
    $html .= "<div class='file-list'>";
    foreach ($list as $fileName) {
        $safeFileName = htmlspecialchars($fileName, ENT_QUOTES, 'UTF-8');

        //  Each file card container
        $html .= "<div class='file-item'>";

        //  Checkbox for selecting the file
        $html .= "<input type='checkbox' name='selectedFiles[]' value='$safeFileName'
                     onchange='updateFileSelection(this, \"$safeFileName\")'>";

        //  Display the file name
        $html .= "<span class='file-name'>$safeFileName</span>";

        //  Delete button with JavaScript call
        $html .= "<button type='button' class='delete-button' onclick='deleteFile(\"$safeFileName\")'>X</button>";

        $html .= "</div>"; //  Close file card container
    }

    $html .= "</div></div>"; //  Close file list and container
    return $html;
}

// @fm.features Helper function to render select dropdowns
// @fm.features Helper to render select dropdowns
#$this->getMariaTree(),$domain,'getMariaTree',"listMariaTables","listMariaTables"
#$this->drop($this->listMariaTables($domain),'','listMariaTables',"buildTable")
protected function renderSelectField($fieldName, $selectedValue, array $options=[]): string {
        $select= "<select class='gs-select' onchange='gs.form.updateRow(this, \"$this->table\")' name='$fieldName' id='$fieldName$this->formid'><option value=0>Select</option>";
                  foreach ($options as $key => $label) {
                     $selected = ($key == $selectedValue) ? 'selected="selected"' : '';
                      $select .= "<option value='$key' $selected>$label</option>";
                     }
                     $select .= "</select>";
        $html = !$this->labeled ? $select : "<div class='gs-span'><label for='$col'>$col</label>$select</div>";
        return $html;
     }

// @fm.description builds button
protected function renderButtonField($comment,$value): string {
    // @fm.features Define the load command
    $loadCommand = str_replace('exe-', '', $comment);
    // @fm.features Check mark or X based on $value
    $icon = $value == 1
        ? '<span style="color: green; font-size: 1.2em;">✔️</span>'
        : '<span style="color: red; font-size: 1.2em;">❌</span>';
    // @fm.features Return the HTML with icon and button
        return "
        <div id='{$loadCommand}_container'>
            <div id='{$loadCommand}'>$icon</div>
               <button class='button' onclick=\"const val = document.getElementById('name').value; gs.form.loadButton('$loadCommand', '{$this->table}')\">{$loadCommand}</button>
        </div>";
}

protected function renderRunField($method, $name, $value): string {
    $escapedMethod = htmlspecialchars($method, ENT_QUOTES, 'UTF-8');
    $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $appendid=$escapedMethod.$escapedName;
    return "<button class='button' onclick=\"gs.api.run('{$escapedName}','{$escapedMethod}','{$appendid}')\">⚡</button><div id='{$appendid}'></div>";
}

// @fm.features Function to handle select dropdown options from comment or subtable
protected function getSelectOptions(string $comment,$value): array|false {
    // @fm.features If selectG or selectjoin, parse and fetch options dynamically from a subtable
    if (strpos($comment, 'selectG') !== false) {
        // @fm.features Handle logic to fetch dynamic options from a table or predefined array
        $list=str_replace('selectG-','',$comment);
        return $this->G[$list]; // @fm.features Example static options
    }elseif(strpos($comment, 'selectjoin') !== false){
        $dbqueryrow=explode('.',str_replace('selectjoin-','',$comment));
        $table=$dbqueryrow[0].'.'.$dbqueryrow[1];
        $row=$dbqueryrow[2];
        return $this->db->flist("SELECT id,$row FROM $table order by $row");
    }
    return [];
}

// @fm.description renders ENUM sql format
protected function getEnumOptions($sqlType) {
    // @fm.features Extract ENUM values from the SQL type definition (e.g., "ENUM('value1', 'value2')")
    if (preg_match("/^enum\((.*)\)$/i", $sqlType, $matches)) {
        // @fm.features Extract the values and trim any quotes around them
        $enumValues = explode(',', str_replace("'", "", $matches[1]));

        // @fm.features Return key-value pairs where the key and value are the same
        $enumOptions = [];
        foreach ($enumValues as $value) {
            $enumOptions[$value] = $value; // @fm.features Key and value are the same
        }
        return $enumOptions;
    }
    return [];
}

// @fm.description renderFormField with all file types for buildForm
protected function renderFormField(string $col, array $fieldData, $value = ''): string{
    // @fm.features Extract the type and any additional data (e.g., comments or SQL type)
    $inputType = $fieldData['type'];
    $comment   = $fieldData['comment'] ?? '';
    $sqlType   = $fieldData['sql_type'] ?? '';
    $list   = $fieldData['list'] ?? [];
    $table   = $this->table ?? $fieldData['table'];
    $id =     $this->G['id']!='' ?  $this->G['id']: $fieldData['id'];
  $supportedCodeMirrorModes = [
        'json' => 'application/json',
        'pug' => 'text/x-pug',
        'cron' => 'text/plain',  // Assuming cron syntax needs plain text, can be customized
        'sql' => 'text/x-sql',
        'md' => 'text/x-markdown',
        'yaml' => 'text/x-yaml',
        'javascript' => 'text/javascript'
    ];
$codeMirrorMode = $supportedCodeMirrorModes[$comment] ?? null;
    // @fm.features Generate the appropriate HTML field based on the type

    switch ($inputType) {
        case 'label':  // @fm.features Read-only field rendered as label
            return "<div class='gs-span'><label for='$col'>$col</label><p class='static-value'>$value</p></div>";
        break;
        case 'select':  // @fm.features Dropdown field
            // @fm.features Generate options from the comment or an external source
          if ($sqlType == 'enum') {
                $options = $list; // @fm.features Extract ENUM options
            }else{
                $options = $this->getSelectOptions($comment, $value);
            }
                return $this->renderSelectField($col, $value,$options);
        break;

        case 'file':
           $options= glob(ADMIN_ROOT."main/*",GLOB_ONLYDIR);
           $tableHtml .= $this->renderSelectField($colName, $value, $options);

        case 'method':
           $options=$this->getClassMethods();
           $tableHtml .= $this->renderSelectField($colName, $value, $options);

        case 'img':
        // @fm.features File upload field
          $imgPath = $this->validateImg($value);
            return "<label for='$col'>$col</label><button ondblclick='openPanel(`compos/mediac.php`)' class='gs-span' id='drop-zone' ondrop='handleDrop(event)' ondragover='handleDragOver(event)'>
                <img src='$imgPath' style='height: 100%;width:100%;' draggable='false'></button>";
        break;
        case 'sql':
        case 'javascript':
        case 'json':
        case 'pug':
        case 'md':
        case 'yaml':
            $escapedValue = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            return "<div class='gs-span'>
                    <div class='gs-preview-container'>
                         <p for='$col'>$col ($comment)-id.{$id}</p>
                        <textarea name='$col' id='$col' placeholder='$col'>$escapedValue</textarea>
                        <div class='code-editor' id='editor-$col'></div>
                    </div>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        var editor = CodeMirror.fromTextArea(document.getElementById('$col'), {
                            mode: '$codeMirrorMode',
                            lineNumbers: true,
                            matchBrackets: true,
                            autoCloseBrackets: true,
                            theme: 'default'
                        });
                        CodeMirror.instances = CodeMirror.instances || {};
                        CodeMirror.instances['$col'] = editor;
                    });
                </script>
                <button class='button save-button' onclick='saveContentMirror(\"$col\", \"$table\",$id)' type='button' id='save_$col'>Save Content</button>
            ";
        case 'sql':
                // @fm.features Handle SQL preview (raw SQL code)
              //  $preview= xechox($this->db->fetch($value));
                $preview= xechox($value);
                return "<div class='gs-span'>
    <label for='$col'>$col</label>
    <div class='gs-preview-container'>
       <textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
       '.$preview.'
    </div>
    <button class='button save-button' onclick='saveContentMirror(\'' . $col . '\', \'' . $table . '\',$id)' type='button' id='save_$col'>Save Content</button>
        </div>";
         break;
        case 'json':
     // @fm.features   $value = json_decode($value,true);
               return "<div class='gs-span'><label for='$col'>$col</label>
                       <code><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'><code>$value</code></textarea></code>
                       </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\",$id)' type='button' id='save_$col'>Save Content</button>";
        break;
        case 'cron':
        return $this->renderCronEditor($value);
        break;
        case 'pug':
        case 'textarea':
        $col = htmlspecialchars($col, ENT_QUOTES, 'UTF-8');
        $table = htmlspecialchars($this->table, ENT_QUOTES, 'UTF-8');
        $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); // @fm.features Escaping the value a
               if($comment =='code'){
               return "<div class='gs-span'><label for='$col'>$col</label>
                <button onclick='navigator.clipboard.writeText(this.nextElementSibling.innerText || this.nextElementSibling.value)' class='glyphicon glyphicon-copy'></button>
               <code><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea></code>
               </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\",$id)' type='button' id='save_$col'>Save Content</button>";
               }else{
               return "<div class='gs-span'><label for='$col'>$col</label><textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
                 </div><button class='button save-button' onclick='saveContent(\"$col\", \"$table\",$id)' type='button' id='save_$col'>Save Content</button>";
              }
        break;
        case 'button':
          return $this->renderButtonField($comment,$value);
        break;
        case 'editor':  // @fm.features CKEditor or rich-text editor
                $col = htmlspecialchars($col, ENT_QUOTES, 'UTF-8');
                $table = htmlspecialchars($this->table, ENT_QUOTES, 'UTF-8');
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); // @fm.features Escaping the value a
        return "<div class='gs-span'>
                    <label for='$col'>$col</label>
                     <textarea class='gs-textarea' name='$col' id='$col' placeholder='$col'>$value</textarea>
                    <button class='bare save-button' onclick='saveContent(\"$col\", \"$this->table\",$id)' type='save' id='save_$col'>Save Content</button>
                </div>
                <script>
                    if (CKEDITOR.instances['$col']) {
                        CKEDITOR.instances['$col'].destroy(true);
                    }
                    CKEDITOR.replace('$col');
                </script>";
        break;
        case 'number':  // @fm.features Numeric input (int, float, etc.)
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input'  onkeyup='gs.form.updateRow(this, \"$this->table\")'  onchange='gs.form.updateRow(this, \"$this->table\")' type='number' name='$col' id='$col' value='$value'></div>";
        break;        case 'date':  // @fm.features Date input
        case 'datetime-local':  // @fm.features Datetime input
              $datevalue = date('Y-m-d', strtotime($value));
              return "<div class='gs-span'><label for='$col'>$col</label>
              <input class='gs-input' name='$col' id='$col' type='date' value='$datevalue' placeholder='$col'>
              </div>";
        break;
        case 'checkbox':  // @fm.features Boolean input (checkbox)
            $checked = ($value) ? 'checked' : '';
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input' onclick='gs.form.updateRow(this, \"$this->table\")'  type='checkbox' name='$col' id='$col' $checked></div>";
         break;
        case 'text':  // @fm.features Default text input
        default:
            return "<div class='gs-span'><label for='$col'>$col</label><input class='gs-input' onkeyup='gs.form.updateRow(this, \"$this->table\")'  type='text' name='$col' id='$col' value='$value'></div>";
        break;
    }
}

}