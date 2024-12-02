from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from connection import get_db_connection
router = APIRouter()

# Load model and tokenizer globally
tokenizer, model = None, None

def load_model_and_tokenizer(model_name="bigscience/bloomz-7b1-mt"):
    global tokenizer, model
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
    return tokenizer, model

# Pydantic model for book data
class BookSummaryUpdate(BaseModel):
    id: int
    title: str

# Fetch books with missing summaries
def fetch_books_with_missing_summaries(cursor):
    cursor.execute("SELECT id, title FROM vl_book WHERE lang='en' AND summary IS NULL")
    return cursor.fetchall()

# Update book summary in the database
def update_book_summary(cursor, book_id, summary):
    cursor.execute("UPDATE vl_book SET summary = %s WHERE id = %s", (summary, book_id))

# Generate summary using the model
def generate_summary(model, tokenizer, title):
    prompt = f"Write a short summary for the book '{title}'."
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=150, temperature=0.7)
    return tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

@router.get("/test")
async def test_bloom():
    try:
        prompt = "Generate a brief test sentence."
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=50, temperature=0.7)

        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return {"message": "Test successful!", "generated_text": generated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed with error: {e}")

@router.get("/generate-summaries", response_model=List[BookSummaryUpdate])
async def generate_summaries():
    mydb = get_db_connection()
    mycursor = mydb.cursor(dictionary=True)

    # Load model and tokenizer
    load_model_and_tokenizer()
    books = fetch_books_with_missing_summaries(mycursor)

    updated_books = []
    for book in books:
        book_id = book['id']
        title = book['title']

        try:
            summary = generate_summary(model, tokenizer, title)
            update_book_summary(mycursor, book_id, summary)
            mydb.commit()
            updated_books.append(BookSummaryUpdate(id=book_id, title=title))
            print(f"Updated summary for book ID {book_id}")

        except Exception as e:
            print(f"Error generating summary for book '{title}': {e}")

    mycursor.close()
    mydb.close()

    return updated_books
