import openai
import mariadb
from config import config

# Set up OpenAI API key from config
openai.api_key = config.OPENAI_API_KEY

# Database Connection
db_conn = mariadb.connect(config.DB_URL)
cursor = db_conn.cursor()

def generate_bio(name):
    """Generate a short bio for a writer using OpenAI."""
    prompt = f"Write a short biography for a writer named {name}. Keep it under 100 words."
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        max_tokens=100
    )
    return response.choices[0].text.strip() if response else None

def update_writer_bio(writer_id, bio):
    """Update the writer's bio in the database."""
    cursor.execute("UPDATE c_book_writer SET bio = ? WHERE id = ?", (bio, writer_id))
    db_conn.commit()

def main():
    # Fetch writers with NULL bios
    cursor.execute("SELECT id, name FROM c_book_writer WHERE id < 100 AND bio IS NULL")
    writers = cursor.fetchall()

    for writer_id, name in writers:
        # Generate bio for each writer
        bio = generate_bio(name)
        if bio:
            # Update the database with the generated bio
            update_writer_bio(writer_id, bio)
            print(f"Updated bio for writer ID {writer_id}: {bio}")
        else:
            print(f"Failed to generate bio for writer ID {writer_id}")

    # Close the database connection
    cursor.close()
    db_conn.close()

if __name__ == "__main__":
    main()
