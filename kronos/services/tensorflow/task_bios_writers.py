import mysql.connector
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer
import tensorflow as tf

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

# Initialize GPT-2 model and tokenizer
model_name = "gpt2-medium"  # You can use other variants like "gpt2" or "gpt2-large"
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = TFGPT2LMHeadModel.from_pretrained(model_name)

# Prepare to fetch writers from the database
mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Create a professional bio for a writer named {name}. Include details about their writing style, themes, career highlights, and a link to their latest book. Keep it concise and engaging, under 100 words."

    try:
        # Tokenize the input prompt
        inputs = tokenizer(prompt, return_tensors="tf")

        # Generate output
        outputs = model.generate(
            inputs['input_ids'],
            max_length=150,  # Limit the length of the generated text
            num_return_sequences=1,
            num_beams=5,
            early_stopping=True,
            do_sample=True,
            top_k=50,  # Smaller range of token choices
            top_p=0.9,  # Use the top 90% probability distribution
            no_repeat_ngram_size=3  # Prevent repeats
        )

        # Decode the output and clean it up
        bio = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        if bio.startswith(prompt):
            bio = bio[len(prompt):].strip()

        # Update the database with the generated bio
        mycursor.execute("UPDATE vl_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()
