import mysql.connector
import os
from gemini import Gemini  # Assuming you have a Gemini client

# Initialize Gemini client with API key from environment variable
client = Gemini(api_key=os.getenv('GEMINI_API_KEY'))

# MySQL Connection
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="n130177!",
    database="gen_vivalibrocom",
    use_unicode=True,
    charset="utf8mb4",
    collation='utf8mb4_general_ci'
)

mycursor = mydb.cursor(dictionary=True)

# Fetch writers with missing bios
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Write a short bio for '{name}' [max 100 words]."

    try:
        # Generate bio using Gemini API
        response = client.generate_text(prompt=prompt, max_tokens=100)

        # Extract the generated bio from the response
        bio = response['generated_text'].strip()  # Adjust based on actual response structure

        # Update the database with the generated bio
        mycursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()
