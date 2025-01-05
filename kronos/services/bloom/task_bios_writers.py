from transformers import AutoModelForCausalLM, AutoTokenizer

# Load Bloom model and tokenizer
model_name = "bigscience/bloomz-7b1-mt"  # Multilingual Bloom variant
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Fetch books with missing summaries
books = maria.fa("SELECT id, title FROM c_book WHERE lang='en' AND summary IS NULL")

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
        maria.q("UPDATE c_book SET summary = %s WHERE id = %s", (summary, id))
        print(f"Updated summary for book ID {id}")

    except Exception as e:
        print(f"Error generating summary for book '{title}': {e}")