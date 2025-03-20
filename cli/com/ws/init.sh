#!/bin/bash
  WS_URL="wss://0.0.0.0:3010/?userid=1"  # Αντικατάστησε με την πραγματική URL

  if command -v wscat &> /dev/null; then
      echo "▶ Σύνδεση στον WebSocket server ($WS_URL)..."
      wscat -c "$WS_URL"
  else
      echo "❌ Σφάλμα: Το wscat δεν είναι εγκατεστημένο."
      exit 1
  fi
  ;;