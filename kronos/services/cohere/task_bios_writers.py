import cohere
import mysql.connector

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

# Initialize Cohere client
co = cohere.Client('kCt3uAMGFqMF8bkinkIdyjcR2dRdM6Fao9nUyLxG')

mycursor = mydb.cursor(dictionary=True)

# Fetch writers with missing bios
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id, name = writer['id'], writer['name']
    prompt = f"Write a short bio of '{name}' (max 100 words)."

    try:
        # Generate bio using Cohere
        response = co.generate(
            model='command-xlarge-nightly',
            prompt=prompt,
            max_tokens=100,
            temperature=0.7
        )

        bio = response.generations[0].text.strip()

        # Update the database with the generated bio
        mycursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mydb.close()
