# coding=utf-8
from core.Maria import Maria  # Import Maria class

# Initialize Maria instance for gen_admin database access
mariadmin = Maria("gen_admin")
import wikipedia

# Set the language to Greek
wikipedia.set_lang("en")

def update_writer_bio(id, bio):
    """Update the writer's bio in the database."""
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("UPDATE c_book_writer SET bio = %s WHERE id = %s", (bio, id))
    db.commit()
    cursor.close()
    db.close()

def ask(name):
    """Fetch summary from Wikipedia with additional context for specificity."""
    query = f"{name} writer"  # Add "writer" keyword to improve search relevance
    try:
        suggestion = wikipedia.search(query, results=1)  # Get only the top result
        if suggestion:
            page_title = suggestion[0]
            # Only proceed if the page title contains the name
            if name.lower() in page_title.lower():
                summary = wikipedia.summary(page_title)
                return summary
            else:
                return "No relevant result found."
        else:
            return "No results found."
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Disambiguation error: {e.options}"
    except wikipedia.exceptions.PageError:
        return "The page does not exist."
    except Exception as e:
        return f"An error occurred: {str(e)}"

def fetch_writers_without_bio(limit=100):
    """Fetch writers without bios from the database."""
    writers = mariadmin.fa("SELECT id, name FROM c_book_writer WHERE bio IS NULL LIMIT %s", (limit,))
    return writers

# Main execution
writers = fetch_writers_without_bio(1000)

for writer in writers:
    writer_id = writer['id']
    name = writer['name']
    print(f"Fetching Wikipedia summary for writer: {name}")
    bio = ask(name)

    if bio and bio not in ["No relevant result found.", "No results found."] and not bio.startswith("An error occurred:"):
        update_writer_bio(writer_id, bio)
        print(f"Updated Writer Bio for ID {writer_id}")
    else:
        print(f"Could not update bio for writer ID {writer_id}: {bio}")

