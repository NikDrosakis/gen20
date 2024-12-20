import mysql.connector
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch


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



model_name = "google/flan-t5-base"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT id, name FROM c_book_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Generate a professional bio for a writer named {name}. Include details about their writing style, themes, and career highlights. Keep it under 100 words."

    try:
        # Tokenize the input prompt
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

        outputs = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_length=150,
            num_return_sequences=1,
            num_beams=5,  # You might increase this for more diverse output
            temperature=0.7,  # Lower value for more deterministic output
            do_sample=True,
            top_k=50,  # Experiment with lower values
            top_p=0.9,
            no_repeat_ngram_size=3,
            pad_token_id=tokenizer.pad_token_id
        )


        # Decode the output and remove any prompt echoes
        bio = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        if bio.startswith(prompt):
            bio = bio[len(prompt):].strip()

        # Update the database with the generated bio
        mycursor.execute("UPDATE c_book_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()
