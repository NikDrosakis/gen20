#!/bin/bash
  # Εκτέλεση του PHP script για το Gaia
  if [ -n "$FILENAME" ]; then
  # Pass all remaining arguments to the PHP script
  php "$CLI_ROOT/com/gaia/index.php" "$@"
  else
  echo "❌ Σφάλμα: Το FILENAME δεν έχει οριστεί για το Gaia."
  exit 1
  fi
  exit 0
  ;;