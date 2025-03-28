import requests

def fetch_openlibrary_book_data(title):
    """Fetch book details from Open Library by title."""
    url = f"https://openlibrary.org/search.json?title={title}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if data['docs']:
            book = data['docs'][0]  # Get the first matching book
            title = book.get('title', 'No Title Available')
            author = ', '.join(book.get('author_name', ['Unknown Author']))
            publish_date = book.get('first_publish_year', 'N/A')
            summary = book.get('first_sentence', {}).get('value', 'No summary available')
            return {
                'title': title,
                'author': author,
                'publish_date': publish_date,
                'summary': summary
            }
        else:
            return "No results found for this title."
    else:
        return f"Error: {response.status_code}"

# Example usage
book_data = fetch_openlibrary_book_data("Pride and Prejudice")
print(book_data)
