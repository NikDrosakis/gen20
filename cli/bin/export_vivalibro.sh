#!/bin/bash

source /var/www/gs/.env

mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" <<EOF
SELECT
    c_book.id AS id,
    c_book.title AS title,
    c_book.summary AS summary,
    c_book.published AS published,
    c_book.isbn AS isbn,
    c_book.clas AS classification,
    c_book.img AS img,
    c_book.img_s AS img_small,
    c_book.img_l AS img_large,
    c_book_writer.name AS writer_name,
    c_book_writer.bio AS writer_bio,
    c_book_publisher.name AS publisher_name,
    c_book_publisher.profile AS publisher_profile
FROM c_book
LEFT JOIN c_book_writer ON c_book.writer = c_book_writer.id
LEFT JOIN c_book_publisher ON c_book.publisher = c_book_publisher.id
INTO OUTFILE '$DEPLOY_DIR/exported_vivalibro.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
EOF

curl "http://localhost:8983/solr/solr_vivalibro/update/csv?commit=true&header=true" \
     -F "file=@$DEPLOY_DIR/exported_vivalibro.csv" \
     -H "Content-Type: application/csv"

# Check if the Solr upload was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to upload data to Solr."
    exit 1
fi

echo "Data successfully exported and uploaded to Solr."