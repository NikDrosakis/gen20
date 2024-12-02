import mysql.connector
from transformers import AutoModelForCausalLM, AutoTokenizer

# MySQL Connection
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="n130177!",
    database="vivalibro",
    use_unicode=True,
    charset="utf8mb4",
    collation='utf8mb4_general_ci'
)
# Load Bloom model and tokenizer
model_name = "bigscience/bloomz-7b1-mt"  # Multilingual Bloom variant
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

mycursor = mydb.cursor(dictionary=True)

# Fetch books with missing summaries
mycursor.execute("SELECT id, title FROM vl_book WHERE lang='en' AND summary IS NULL")
books = mycursor.fetchall()

for book in books:
    id = book['id']
    title = book['title']
    prompt = f"Write a short summary for the book '{title}'."

    try:
        # Encode the prompt and generate response
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=150, temperature=0.7)

        # Decode the generated text
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        # Update the database with the Greek summary
        mycursor.execute("UPDATE vl_book SET summary = %s WHERE id = %s", (summary, id))
        mydb.commit()
        print(f"Updated summary for book ID {id}")

    except Exception as e:
        print(f"Error generating summary for book '{title}': {e}")
# Close database connection
mydb.close()
