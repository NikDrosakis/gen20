import requests
from bs4 import BeautifulSoup

def fetch_gutenberg_book_data(title):
    """Search for a book title in Project Gutenberg's RSS feed and retrieve details if available."""
    search_url = f"http://www.gutenberg.org/ebooks/search/?query={title.replace(' ', '+')}"
    response = requests.get(search_url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        # Find the first book entry link (if exists)
        book_link = soup.find("a", class_="link")
        if book_link:
            book_url = "http://www.gutenberg.org" + book_link.get('href')
            book_page = requests.get(book_url)
            if book_page.status_code == 200:
                book_soup = BeautifulSoup(book_page.content, 'html.parser')
                title = book_soup.find("h1").text.strip()
                author = book_soup.find("a", {"title": "Find more by this author"}).text.strip()
                description = book_soup.find("p", class_="description")
                summary = description.text.strip() if description else "No summary available"

                return {
                    'title': title,
                    'author': author,
                    'summary': summary,
                    'url': book_url
                }
        else:
            return "No results found for this title on Project Gutenberg."
    else:
        return f"Error: {response.status_code}"

# Example usage
book_data = fetch_gutenberg_book_data("Pride and Prejudice")
print(book_data)
