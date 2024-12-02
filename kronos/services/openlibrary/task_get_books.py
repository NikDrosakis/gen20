import requests
import mysql.connector
from mysql.connector import Error

# MySQL connection setup
def create_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="n130177!",
        database="gen_vivalibrocom",
        charset="utf8mb4",
        collation="utf8mb4_general_ci"
    )

# Fetch book data from Open Library API
def get_book_data_openlibrary(title):
    response = requests.get(f"https://openlibrary.org/search.json?title={title}")
    if response.status_code == 200:
        data = response.json()
        if data['numFound'] > 0:
            return data['docs'][0]  # Returns the first match
    return None

# Fetch book data from Gutenberg API
def get_book_data_gutenberg(title):
    response = requests.get(f"http://gutendex.com/books?search={title}")
    if response.status_code == 200:
        data = response.json()
        if data['count'] > 0:
            return data['results'][0]  # Returns the first match
    return None

# Insert book data into MySQL
def insert_book_data(book_data):
    try:
        connection = create_connection()
        cursor = connection.cursor()

        # Check if the book already exists based on title and author
        title, author = book_data.get('title', ''), book_data.get('author', '')
        cursor.execute("SELECT id FROM vl_book WHERE title = %s AND writer = %s", (title, author))
        if cursor.fetchone():
            print("Book already exists:", title)
            return

        # Insert the book data
        insert_query = """
        INSERT INTO vl_book (title, ptitle, img, isbn, uri, pages, lang, writer, publisher, published, summary, source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            title,
            book_data.get('ptitle', ''),
            book_data.get('img', ''),
            book_data.get('isbn', ''),
            book_data.get('uri', ''),
            book_data.get('pages', None),
            book_data.get('lang', 'en'),
            book_data.get('writer', ''),
            book_data.get('publisher', ''),
            book_data.get('published', 1977),
            book_data.get('summary', ''),
            book_data.get('source', 'Open Library' if 'openlibrary.org' in book_data.get('uri', '') else 'Gutenberg')
        ))
        connection.commit()
        print("Inserted book:", title)

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Main logic to process each book title
def process_books(book_titles):
    for title in book_titles:
        book_data = get_book_data_openlibrary(title) or get_book_data_gutenberg(title)
        if book_data:
            processed_data = {
                'title': book_data.get('title'),
                'ptitle': book_data.get('title_suggest', ''),
                'img': book_data.get('cover_i', ''),
                'isbn': book_data.get('isbn', [''])[0],
                'uri': f"https://openlibrary.org{book_data.get('key')}" if 'openlibrary.org' in book_data.get('key', '') else '',
                'pages': book_data.get('number_of_pages_median'),
                'lang': book_data.get('language', ['en'])[0],
                'writer': book_data.get('author_name', [''])[0],
                'publisher': book_data.get('publisher', [''])[0],
                'published': book_data.get('first_publish_year', 1977),
                'summary': book_data.get('subject', ''),
                'source': 'Open Library' if 'openlibrary.org' in book_data.get('key', '') else 'Gutenberg'
            }
            insert_book_data(processed_data)
        else:
            print(f"No relevant data found for: {title}")

# Example list of book titles to fetch
book_titles = ["Pride and Prejudice", "War and Peace", "The Great Gatsby"]

# Start the process
process_books(book_titles)
