#!/bin/bash

# List of PHP .ini files to check and enable extensions
ini_files=(
    "/etc/php/8.2/cli/php.ini"
    "/etc/php/8.2/cli/conf.d/10-mysqlnd.ini"
    "/etc/php/8.2/cli/conf.d/10-opcache.ini"
    "/etc/php/8.2/cli/conf.d/10-pdo.ini"
    "/etc/php/8.2/cli/conf.d/15-xml.ini"
    "/etc/php/8.2/cli/conf.d/20-bcmath.ini"
    "/etc/php/8.2/cli/conf.d/20-calendar.ini"
    "/etc/php/8.2/cli/conf.d/20-ctype.ini"
    "/etc/php/8.2/cli/conf.d/20-curl.ini"
    "/etc/php/8.2/cli/conf.d/20-dom.ini"
    "/etc/php/8.2/cli/conf.d/20-exif.ini"
    "/etc/php/8.2/cli/conf.d/20-ffi.ini"
    "/etc/php/8.2/cli/conf.d/20-fileinfo.ini"
    "/etc/php/8.2/cli/conf.d/20-ftp.ini"
    "/etc/php/8.2/cli/conf.d/20-gd.ini"
    "/etc/php/8.2/cli/conf.d/20-gettext.ini"
    "/etc/php/8.2/cli/conf.d/20-iconv.ini"
    "/etc/php/8.2/cli/conf.d/20-intl.ini"
    "/etc/php/8.2/cli/conf.d/20-mbstring.ini"
    "/etc/php/8.2/cli/conf.d/20-mongodb.ini"
    "/etc/php/8.2/cli/conf.d/20-mysqli.ini"
    "/etc/php/8.2/cli/conf.d/20-pdo_mysql.ini"
    "/etc/php/8.2/cli/conf.d/20-phar.ini"
    "/etc/php/8.2/cli/conf.d/20-posix.ini"
    "/etc/php/8.2/cli/conf.d/20-readline.ini"
    "/etc/php/8.2/cli/conf.d/20-shmop.ini"
    "/etc/php/8.2/cli/conf.d/20-simplexml.ini"
    "/etc/php/8.2/cli/conf.d/20-soap.ini"
    "/etc/php/8.2/cli/conf.d/20-sockets.ini"
    "/etc/php/8.2/cli/conf.d/20-sysvmsg.ini"
    "/etc/php/8.2/cli/conf.d/20-sysvsem.ini"
    "/etc/php/8.2/cli/conf.d/20-sysvshm.ini"
    "/etc/php/8.2/cli/conf.d/20-tokenizer.ini"
    "/etc/php/8.2/cli/conf.d/20-xmlreader.ini"
    "/etc/php/8.2/cli/conf.d/20-xmlwriter.ini"
    "/etc/php/8.2/cli/conf.d/20-xsl.ini"
    "/etc/php/8.2/cli/conf.d/20-zip.ini"
)

# List of extensions to enable
extensions=(
    "mysqlnd"
    "opcache"
    "pdo"
    "xml"
    "bcmath"
    "calendar"
    "ctype"
    "curl"
    "dom"
    "exif"
    "ffi"
    "fileinfo"
    "ftp"
    "gd"
    "gettext"
    "iconv"
    "intl"
    "mbstring"
    "mongodb"
    "mysqli"
    "pdo_mysql"
    "phar"
    "posix"
    "readline"
    "shmop"
    "simplexml"
    "soap"
    "sockets"
    "sysvmsg"
    "sysvsem"
    "sysvshm"
    "tokenizer"
    "xmlreader"
    "xmlwriter"
    "xsl"
    "zip"
)

# Enable each extension in the appropriate .ini files
for extension in "${extensions[@]}"; do
    for ini_file in "${ini_files[@]}"; do
        if [[ -f "$ini_file" ]]; then
            # Check if the extension is already enabled (not commented out)
            if grep -q "extension=$extension.so" "$ini_file"; then
                echo "$extension is already enabled in $ini_file"
            else
                # Uncomment or add the extension in the ini file
                if grep -q ";extension=$extension.so" "$ini_file"; then
                    # Uncomment the extension line
                    sed -i "s/;extension=$extension.so/extension=$extension.so/" "$ini_file"
                    echo "Enabled $extension in $ini_file"
                else
                    # Add the extension at the end of the ini file
                    echo "extension=$extension.so" >> "$ini_file"
                    echo "Added $extension to $ini_file"
                fi
            fi
        else
            echo "File $ini_file does not exist."
        fi
    done
done

echo "All extensions have been enabled."
