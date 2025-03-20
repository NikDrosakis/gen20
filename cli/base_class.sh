#!/bin/bash
# Αυτή η "κλάση" θα αναπαριστά ένα γενικό αντικείμενο.
declare -A BaseObject

# Συνάρτηση για την αρχικοποίηση του αντικειμένου (δημιουργία της "κλάσης")
initialize_base_object() {
    local name="$1"
    BaseObject[name]="$name"
    BaseObject[type]="Base Type"
    echo "✅ Δημιουργήθηκε το αντικείμενο με όνομα: ${BaseObject[name]}"
}

# Συνάρτηση για την προβολή των στοιχείων του αντικειμένου
show_base_object() {
    echo "Όνομα: ${BaseObject[name]}"
    echo "Τύπος: ${BaseObject[type]}"
}

# Συνάρτηση για να κάνεις κάτι με το αντικείμενο (π.χ., να εκτελέσεις μια ενέργεια)
perform_action() {
    echo "🚀 Εκτελείται δράση στο αντικείμενο: ${BaseObject[name]}"
}
