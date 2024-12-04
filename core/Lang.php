<?php
namespace Core;
/**
TODO
====
switch default lang
add lang (auto translate custom posts)
cubo lang

 */
trait Lang {
use Form;
protected $defaultLang='en';
protected $localized;

protected function buildNewlangColumns(){
   $columns = $this->getInputType("gen_vivalibrocom.language");
   return $columns;
}

}