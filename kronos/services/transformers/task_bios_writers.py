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
#good for text-to-text tasks like translation or summarization
model_name = "google/flan-t5-base"
tokenizer = T5Tokenizer.from_pretrained(model_name, legacy=False,clean_up_tokenization_spaces=False)
model = T5ForConditionalGeneration.from_pretrained(model_name)

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT id, name FROM c_book_writer WHERE bio IS NULL LIMIT 100")
writers = mycursor.fetchall()

for writer in writers:
    id = writer['id']
    name = writer['name']
    print(name)
    prompt = f"Generate a detailed professional bio for a writer named {name}. Focus on their key achievements, writing style, influences, notable works, and themes they often explore. Here are some examples: \n\n" \
             "Example 1: 'John Doe is a celebrated author known for his exploration of historical fiction. His works, such as 'The Ancient King' and 'Lost in Time', delve into the complexities of human history with a deep understanding of ancient civilizations. John’s attention to detail and engaging narrative style has made him a prominent figure in the literary world.'\n\n" \
             "Example 2: 'Jane Smith’s novels have captivated readers worldwide with her blend of romance and adventure. Her book, 'The Forgotten Road', explores the delicate balance of love and loss, earning her multiple literary awards. A frequent collaborator with major publishers, Jane continues to inspire with her evocative storytelling.'\n\n" \
             "Please use a similar tone and structure to generate a bio for the writer named {name}. Keep the bio under 150 words."

    try:
        # Tokenize the input prompt
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

        outputs = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_length=250,  # Increased length for more content
            num_return_sequences=1,
            num_beams=5,
            temperature=0.4,
            do_sample=True,
            top_k=50,
            top_p=0.9,
            no_repeat_ngram_size=3,
            pad_token_id=tokenizer.pad_token_id
        )


        # Decode the output and remove any prompt echoes
        bio = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        if bio.startswith(prompt):
            bio = bio[len(prompt):].strip()

        # Update the database with the generated bio
        print(bio)
        mycursor.execute("UPDATE c_book_writer SET bio = %s WHERE id = %s", (bio, id))
        mydb.commit()
        print(f"Updated Writer Bio for ID {id}")

    except Exception as e:
        print(f"Error generating bio for writer '{name}': {e}")

# Close database connection
mycursor.close()
mydb.close()
