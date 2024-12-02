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

# Fetch Greek books from Open Library API
def get_greek_books_openlibrary(page=1):
    response = requests.get(f"https://openlibrary.org/search.json?language=el&page={page}")
    if response.status_code == 200:
        data = response.json()
        return data['docs']
    return []

# Fetch Greek books from Gutenberg API
def get_greek_books_gutenberg(page=1):
    response = requests.get(f"http://gutendex.com/books?languages=el&page={page}")
    if response.status_code == 200:
        data = response.json()
        return data['results']
    return []

def insert_book_data(book_data):
    try:
        connection = create_connection()
        cursor = connection.cursor()

        # Check if the book already exists based on title and author
        title, author = book_data.get('title', ''), book_data.get('writer', '')
        cursor.execute("SELECT id FROM vl_book WHERE title = %s AND writer = %s", (title, author))
        if cursor.fetchone():
            print("Book already exists:", title)
            return

        # Handle list cases, ensure single values
        isbn = book_data.get('isbn', '')
        isbn = isbn[0] if isinstance(isbn, list) and isbn else None  # Get first ISBN if it's a list

        subjects = book_data.get('summary', '')
        subjects = ", ".join(subjects) if isinstance(subjects, list) else subjects  # Convert list to string

        # Insert the book data
        insert_query = """
        INSERT INTO vl_book (title, ptitle, img, isbn, uri, pages, lang, writer, publisher, published, summary, source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            title,
            book_data.get('ptitle', ''),
            book_data.get('img', ''),
            isbn,
            book_data.get('uri', ''),
            book_data.get('pages', None),
            book_data.get('lang', 'el'),
            author,
            book_data.get('publisher', ''),
            book_data.get('published', 1977),
            subjects,
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


# Main process to fetch and insert Greek books from both sources
def process_greek_books(pages=5):
    for page in range(1, pages + 1):
        # Open Library Greek books
        books_openlibrary = get_greek_books_openlibrary(page)
        for book in books_openlibrary:
            book_data = {
                'title': book.get('title'),
                'ptitle': book.get('title_suggest', ''),
                'img': book.get('cover_i', ''),
                'isbn': book.get('isbn', [''])[0],
                'uri': f"https://openlibrary.org{book.get('key')}" if 'openlibrary.org' in book.get('key', '') else '',
                'pages': book.get('number_of_pages_median'),
                'lang': 'el',
                'writer': book.get('author_name', [''])[0],
                'publisher': book.get('publisher', [''])[0],
                'published': book.get('first_publish_year', 1977),
                'summary': book.get('subject', ''),
                'source': 'Open Library'
            }
            insert_book_data(book_data)

        # Gutenberg Greek books
        books_gutenberg = get_greek_books_gutenberg(page)
        for book in books_gutenberg:
            book_data = {
                'title': book.get('title'),
                'ptitle': '',
                'img': '',
                'isbn': '',
                'uri': f"http://www.gutenberg.org/ebooks/{book.get('id')}",
                'pages': book.get('num_pages'),
                'lang': 'el',
                'writer': book.get('authors', [{}])[0].get('name', ''),
                'publisher': 'Gutenberg',
                'published': book.get('download_count', 0),  # Gutenberg doesn’t usually have publication years
                'summary': book.get('subjects', ''),
                'source': 'Gutenberg'
            }
            insert_book_data(book_data)

# Start the process with a specified number of pages to fetch
process_greek_books(5)
