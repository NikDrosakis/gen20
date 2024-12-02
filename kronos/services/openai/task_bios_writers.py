import os
from openai import OpenAI
import mysql.connector

# Initialize OpenAI client with API key
client = OpenAI(api_key='sk-svcacct-fL6ZuXVYLsPT9dqIoGthgBFJNf7y5IItA2jT2GBy-rV_EDJpO7T3BlbkFJ0VJ_hWb5Y-3cY0YKki5qvVLRMcB11UbH69TVq3GW3Vhn2rouMA')

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

# Initialize OpenAI client with API key
#openai.api_key =
#openai.api_key = os.getenv("OPENAI_API_KEY")

mycursor = mydb.cursor(dictionary=True)

# Fetch writers with missing bios
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL limit 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Write a short bio for '{name}' [max 100 words]."

    try:
        # Generate bio using OpenAI's Completion API
        response = client.completions.create(
            model="gpt-4o-mini",
            prompt=prompt,
            max_tokens=100,
            temperature=0.7
        )

        bio = response.choices[0].text.strip()

        # Update the database with the generated bio
        mycursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except openai.error.RateLimitError:
        print(f"Rate limit exceeded for writer '{name}'. Skipping...")
    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()
