#!/usr/bin/env python3

import pymysql
import requests
from bs4 import BeautifulSoup
import html


def get_book_details(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract summary
        summary = None
        summary_div = soup.find('div', class_='product attribute description')
        if summary_div:
            value_div = summary_div.find('div', class_='value')
            if value_div:
                summary = str(value_div)  

            # Extract publisher
        publisher = None
        publisher_td = soup.find('td', class_='col data', attrs={'data-th': 'Εκδότης'})
        if publisher_td:
            publisher = publisher_td.get_text(strip=True)

        # Extract ISBN
        isbn = None
        isbn_td = soup.find('td', class_='col data', attrs={'data-th': 'ISBN'})
        if isbn_td:
            isbn = isbn_td.get_text(strip=True)

        # Extract published year
        published = None
        published_td = soup.find('td', class_='col data', attrs={'data-th': 'Έτος παραγωγής'})
        if published_td:
            published = published_td.get_text(strip=True)

        # Extract number of pages
        pages = None
        numpages_td = soup.find('td', class_='col data', attrs={'data-th': 'Σελίδες'})
        if numpages_td:
            pages = numpages_td.get_text(strip=True)

        # Convert pages to integer if possible
        try:
            pages = int(pages.replace(',', '')) if pages else None
        except ValueError:
            pages = None

        return summary, publisher, isbn, published, pages
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None, None, None, None, None


def update_book_details_in_db(cursor, uri, summary, publisher, isbn, published, pages):
    try:
        query = """
        UPDATE dataset
        SET summary = %s, publisher = %s, isbn = %s, published = %s, pages = %s
        WHERE uri = %s
        """
        cursor.execute(query, (summary, publisher, isbn, published, pages, uri))
    except pymysql.MySQLError as e:
        print(f"Error updating database for {uri}: {e}")


# Database connection parameters
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'n130177!',
    'database': 'gen_vivalibrocom',
}

# Chunk size
chunk_size = 100
offset = 0
# Establish a database connection
try:
    connection = pymysql.connect(**db_config)
    print("Connection successful")

    while True:
        with connection.cursor() as cursor:
            # Fetch a chunk of URIs with LIMIT and OFFSET
            query = f"SELECT uri FROM dataset WHERE lang='el' LIMIT {chunk_size} OFFSET {offset}"
            cursor.execute(query)
            uris = cursor.fetchall()

            # If no more data, break the loop
            if not uris:
                break

            # Process each URI
            for (uri,) in uris:
                summary, publisher, isbn, published, pages = get_book_details(uri)
                if any([summary, publisher, isbn, published, pages]):
                    update_book_details_in_db(cursor, uri, summary, publisher, isbn, published, pages)

            # Commit the changes
            connection.commit()
            print(f"Processed {len(uris)} records, Offset: {offset}")

            # Update the offset for the next chunk
            offset += chunk_size

finally:
    connection.close()