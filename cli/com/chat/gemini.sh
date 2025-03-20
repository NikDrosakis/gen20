#!/bin/bash

set -x  # Ενεργοποίηση του debugging

# Εκτύπωση όλων των παραμέτρων
echo "Arguments passed: $@"

# Ελέγχουμε την πρώτη παράμετρο
echo "First argument: $1"

# Αν το πρώτο όρισμα είναι κενό, κάνουμε έλεγχο
if [ -z "$1" ]; then
  echo "Πρέπει να δώσεις μήνυμα ως πρώτο όρισμα."
  exit 1
fi

# Ορισμός μεταβλητών
API_URL="https://vivalibro.com/apy/v1/gemini/conversation"
CONVERSATIONID="1"

# Αποστολή μηνύματος
message="$1"
echo "Sending message: $message"

# Χρήση του jq για την αποστολή του μηνύματος
payload=$(jq -n --arg msg "$message" --arg conv_id "$CONVERSATIONID" '{message: $msg, conversation_id: $conv_id}')

# Εκτέλεση cURL για αποστολή του μηνύματος
response=$(curl -s -H "Content-Type: application/json" -d "$payload" "$API_URL")

# Έλεγχος αν η απόκριση είναι κενή
if [[ -z "$response" ]]; then
  echo "Σφάλμα: Δεν υπάρχει απόκριση από τον διακομιστή."
  exit 1
fi

# Εκτύπωση της απόκρισης
echo "Response from API:"
echo "$response" | jq .
