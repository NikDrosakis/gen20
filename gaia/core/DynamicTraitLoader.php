<?php
namespace Core;
class DynamicTraitLoader {
    public function loadTrait($traitName) {
        $fullyQualifiedTrait = "\\Core\\$traitName"; // Adjust namespace if needed

        if (!trait_exists($fullyQualifiedTrait)) {
            throw new \Exception("Trait $fullyQualifiedTrait not found");
        }

        $classCode = "
            namespace Core;
            class DynamicClass {
                use $fullyQualifiedTrait;
            }
        ";

        eval($classCode); // Ensure proper namespacing

        return new \Core\DynamicClass(); // Return instance
    }
}
