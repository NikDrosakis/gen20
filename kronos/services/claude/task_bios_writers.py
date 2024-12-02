import mysql.connector
import requests

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

# Claude API details
claude_api_url = "https://api.anthropic.com/v1/complete"  # Replace with actual Claude endpoint
api_key = "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"  # Replace with your API key

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Create a professional bio for a writer named {name}. Include details about their writing style, themes, and career highlights. Keep it under 100 words."

    try:
        # Call Claude API to generate the bio
        response = requests.post(
            claude_api_url,
            headers={
                "Authorization": "Bearer " + api_key,
                "Content-Type": "application/json"
            },
            json={
                "prompt": prompt,
                "max_tokens": 150,
                "temperature": 0.7,  # Adjust as necessary for variability in output
                "top_p": 0.8,        # Top probability distribution
                "n": 1               # Number of responses to generate
            }
        )

        if response.status_code == 200:
            bio_data = response.json()
            bio = bio_data.get("completion", "").strip()

            # Update the database with the generated bio
            mycursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
            mydb.commit()
            print(f"Updated Writer Bio for ID {id}")
        else:
            print(f"Error from Claude API for writer '{name}': {response.text}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()