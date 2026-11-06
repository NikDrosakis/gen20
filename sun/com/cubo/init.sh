#!/bin/bash
CUBO_URL="http://localhost/cubos" # Αντικατάστησε με την πραγματική URL
CUBO_URL="$ROOT/gaia/cubos"

  if command -v curl &> /dev/null; then
      echo "▶ Έλεγχος προσβασιμότητας του $CUBO_URL..."
      curl -I "$CUBO_URL"
  else
      echo "❌ Σφάλμα: Το curl δεν είναι εγκατεστημένο."
      exit 1
  fi

