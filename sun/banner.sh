#!/bin/bash
# /var/www/gs/sun/banner.sh

# Φωτεινό κόκκινο
RED='\033[1;31m'
NC='\033[0m'

show_banner() {
    echo -e "${RED}"
    # --- Το "20" (Κεντραρισμένο πάνω από το EN) ---
    echo "        #####   #####  "
    echo "       ##   ## ##   ## "
    echo "            ## ##   ## "
    echo "           ##  ##   ## "
    echo "          ##   ##   ## "
    echo "         ##    ##   ## "
    echo "        ######  #####  "
    echo ""
    # --- Το "GEN" ---
    echo "  ####   ######  ##   ## "
    echo " ##  ##  ##      ###  ## "
    echo " ##      #####   #### ## "
    echo " ## ###  ##      ## #### "
    echo " ##  ##  ##      ##  ### "
    echo "  ####   ######  ##   ## "
    echo -e "${NC}"
}