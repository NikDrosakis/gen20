from core.Mari import Mari
import logging
import os
from config import settings  # Configuration file or environment variables
import deepseek  # Replace with the DeepSeek SDK or use `requests` if it's a REST API
deepseek.api_key = settings.DEEPSEEK_API_KEY
# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Generate Bio using DeepSeek
def generate_bio(name: str) -> str:
    """
    Generate a short bio for a writer using DeepSeek.

    Args:
        name (str): The name of the writer.

    Returns:
        str: A generated biography or None if generation failed.
    """
    prompt = f"Write a short biography for a writer named {name}. Keep it under 100 words."
    try:
        response = deepseek.Completion.create(
            model="deepseek-text-model",  # Replace with the correct DeepSeek model name
            prompt=prompt,
            max_tokens=128
        )
        if response and response.choices:
            return response.choices[0].text.strip()
    except Exception as e:
        logging.error(f"Error generating bio for {name}: {e}")
    return None

# Update Writer's Bio in Database
def update_writer_bio(writer_id: int, bio: str) -> None:
    """
    Update the writer's bio in the database.

    Args:
        writer_id (int): The ID of the writer.
        bio (str): The biography to update.
    """
    try:
        maria.q(
            "UPDATE gen_vivalibrocom.c_book_writer SET bio = ? WHERE id = ?",
            (bio, writer_id)
        )
    except Exception as e:
        logging.error(f"Error updating bio for writer ID {writer_id}: {e}")
        raise

# Fetch Writers with NULL Bios
def fetch_writers_without_bio(limit: int = 100):
    """
    Fetch writers with NULL bios from the database.

    Args:
        limit (int): Maximum number of writers to fetch.

    Returns:
        list: A list of tuples containing writer IDs and names.
    """
    try:
        return maria.fa(
            f"SELECT id, name FROM gen_vivalibrocom.c_book_writer WHERE id < {limit} AND bio IS NULL"
        )
    except Exception as e:
        logging.error(f"Error fetching writers: {e}")
        return []

# Main Function
def update_bio():
    """
    Main function to generate and update bios for writers.
    """
    try:
        writers = fetch_writers_without_bio(limit=100)
        if not writers:
            logging.info("No writers found with NULL bios.")
            return

        for writer_id, name in writers:
            # Generate bio for each writer
            bio = generate_bio(name)
            if bio:
                # Update the database with the generated bio
                update_writer_bio(writer_id, bio)
                logging.info(f"Updated bio for writer ID {writer_id}: {bio}")
            else:
                logging.warning(f"Failed to generate bio for writer ID {writer_id}.")
    except Exception as e:
        logging.critical(f"Unexpected error in main function: {e}")


update_bio()
