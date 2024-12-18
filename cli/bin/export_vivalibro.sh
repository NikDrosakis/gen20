#!/bin/bash

source /var/www/gs/cli/configs/.env

mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" <<EOF
SELECT
    vl_book.id AS id,
    vl_book.title AS title,
    vl_book.summary AS summary,
    vl_book.published AS published,
    vl_book.isbn AS isbn,
    vl_book.clas AS classification,
    vl_book.img AS img,
    vl_book.img_s AS img_small,
    vl_book.img_l AS img_large,
    vl_writer.name AS writer_name,
    vl_writer.bio AS writer_bio,
    vl_publisher.name AS publisher_name,
    vl_publisher.profile AS publisher_profile
FROM vl_book
LEFT JOIN vl_writer ON vl_book.writer = vl_writer.id
LEFT JOIN vl_publisher ON vl_book.publisher = vl_publisher.id
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