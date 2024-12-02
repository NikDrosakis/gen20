# coding=utf-8
import mysql.connector
import wikipedia

# Set the language to Greek
wikipedia.set_lang("en")

# MySQL Connection Configuration
def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="n130177!",  # Replace with your MySQL password
        database="gen_vivalibrocom",
        use_unicode=True,
        charset="utf8mb4",
        collation='utf8mb4_general_ci'
    )

def update_writer_bio(id, bio):
    """Update the writer's bio in the database."""
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
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
    db = connect_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT %s", (limit,))
    writers = cursor.fetchall()
    cursor.close()
    db.close()
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

