<?php
namespace Core;
use Pug\Pug;
/**
TODO
====
switch default lang
add lang (auto translate custom posts)
cubo lang
ADD LANGUAGE
1) FIND ALL COMMENTS LOC
2) alter table with field_[LOC]
3) update table of active languages
 */
trait Lang {
use Form;

protected $defaultLang='en';
protected $localized;

protected function buildNewlangColumns(){
   $columns = $this->getInputType("gen_vivalibrocom.language");
   return $columns;
}
protected function pugTest(){
// Create a Pug instance
$pug = new Pug();

// Render a Pug template as a string
echo $pug->render('
    h2 Welcome to Pug in PHP!
    div This is a simple Pug example rendered in PHP.
');

// Or compile a file
return $pug->renderFile('path/to/template.pug');
}
}