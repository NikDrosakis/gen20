import mysql.connector
from transformers import AutoModelForCausalLM, AutoTokenizer
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

# Initialize GPT-Neo model and tokenizer
model_name = "EleutherAI/gpt-neo-125M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(model_name)

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT id, name FROM vl_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    prompt = f"Create a professional bio for a writer named {name}. Include details about their writing style, themes, and career highlights. Keep it under 100 words."

    try:
        # Tokenize the input prompt
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

        outputs = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_length=150,             # Limit the bio length
            num_return_sequences=1,
            num_beams=5,
            early_stopping=True,
            do_sample=True,
            top_k=60,                   # Smaller range of token choices
            top_p=0.8,                  # Use the top 80% probability distribution
            no_repeat_ngram_size=3,     # Prevent 3-token repeats for smoother text
            pad_token_id=tokenizer.pad_token_id
        )

        # Decode the output and remove any prompt echoes
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
