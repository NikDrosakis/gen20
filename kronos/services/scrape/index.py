#!/bin/sh
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
            try:
                pages = int(pages)  # Ensure pages is an integer
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
        result = cursor.execute(query, (summary, publisher, isbn, published, pages, uri))
        print(f"Database update result for {uri}: {result}")
    except pymysql.MySQLError as e:
        print(f"Error updating database for {uri}: {e}")

# Database connection parameters
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'n130177!',
    'database': 'gen_vivalibrocom',
}

# Establish a database connection
try:
    connection = pymysql.connect(**db_config)
    print("Connection successful")
    with connection.cursor() as cursor:
        # Fetch all URIs where lang='el'
        cursor.execute("SELECT uri FROM dataset WHERE lang='el'")
        uris = cursor.fetchall()
        # Iterate over the list of URIs and process each one
        total_uris = len(uris)
        for index, (uri,) in enumerate(uris):
            summary, publisher, isbn, published, pages = get_book_details(uri)
            if any([summary, publisher, isbn, published, pages]):
                update_book_details_in_db(cursor, uri, summary, publisher, isbn, published, pages)
                print(f"Successfully updated {uri} ({index + 1}/{total_uris})")
            else:
                print(f"No data found for {uri} ({index + 1}/{total_uris})")

        # Commit all changes
        connection.commit()
finally:
    connection.close()
    print("Connection closed")