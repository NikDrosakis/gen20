<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="copyright" content="Nik Drosakis">
<meta name="googlebot" content="all">
<meta http-equiv="name" content="value">
<meta name="ROBOTS" CONTENT="NOARCHIVE">
<meta name="google" content="notranslate">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/css/dashboard.css">
<link rel="stylesheet" href="/css/gs.css">
<link rel="icon" href="/img/icon.png">

<title>Admin GEN20</title>

<?php if($this->sub=='timetable'){ ?>
<link rel="stylesheet" href="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css">
<?php } ?>

<?php if($this->sub=='globs'){ ?>
<!-- JSONEditor -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.1.0/jsoneditor.min.css" integrity="sha512-8G+Vb2+10BSrSo+wupdzJIylDLpGtEYniQhp0rsbTigPG7Onn2S08Ai/KEGlxN2Ncx9fGqVHtRehMuOjPb9f8g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.1.0/jsoneditor.min.js" integrity="sha512-PInE2t9LrzM/U5c/sB27ZCv/thNDKIA1DgRBzOcvaq21qlnQ/yI/YvzJMLdzsM1MvmX9j4TQLFi8+2+rTkdR4w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<!-- CodeMirror JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js" integrity="sha512-8RnEqURPUc5aqFEN04aQEiPlSAdE0jlFS/9iGgUyNtwFnSKCXhmB6ZTNl7LnDtDWKabJIASzXrzD0K+LYexU9g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css" integrity="sha512-uf06llspW44/LZpHzHT6qBOIVODjWtv4MxCricRxkzvopAlSWnTf6hpZTFxuuZcuNE9CBQhqE0Seu1CoRk84nQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<?php } ?>

<!-- ckEditor -->
<script src="https://cdn.ckeditor.com/4.22.0/standard/ckeditor.js"></script>
<script>
// Suppress CKEditor warning
     (function() {
         var originalWarn = console.warn;
         console.warn = function(message) {
             if (message.indexOf('not secure. Consider upgrading') === -1) {
                 originalWarn.apply(console, arguments);
             }
         };
     })();
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.3/Sortable.min.js" integrity="sha512-8AwTn2Tax8NWI+SqsYAXiKT8jO11WUBzTEWRoilYgr5GWnF4fNqBRD+hCr4JRSA1eZ/qwbI+FPsM3X/PQeHgpQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<script type="text/javascript">var G=<?php echo json_encode($this->G, JSON_UNESCAPED_UNICODE);?>;</script>
<script src="/js/gs.js"></script>
<script src="/js/admin.js"></script>