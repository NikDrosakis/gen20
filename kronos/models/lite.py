from typing import Union
from pydantic import BaseModel
import sqlite3

class Book(BaseModel):
 title: str
 author: str

def create_connection():
 conn = sqlite3.connect("books.db()")
 cursor = conn.cursor()
 table_exists = cursor.fetchone()
 if not table_exists:
  cursor.execute("""
  CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL
  )
  """)
 return conn
def insert(book: Book):
 conn = create_connection()
 cursor = conn.cursor()
 cursor.execute("INSERT INTO books (title, author) VALUES (?, ?)", (book.title, book.author))
 conn.commit()
 conn.close()
 return cursor.lastrowid

def update(id,book: Book):
 conn = create_connection()
 cursor = conn.cursor()
 cursor.execute("UPDATE books SET title=?, author=? WHERE id=?", (book.title, book.author,id))
 conn.commit()
 conn.close()
 return id


def delete(id):
 conn = create_connection()
 cursor = conn.cursor()
 cursor.execute("DELETE FROM books WHERE id=?", (id))
 conn.commit()
 conn.close()
 return id


def fetchall(table):
 conn = create_connection()
 cur = conn.cursor()
 cur.execute("SELECT * FROM "+table)
 rows = cur.fetchall()
 conn.commit()
 conn.close()
 return rows


def fetch(id):
 conn = create_connection()
 cur = conn.cursor()
 cur.execute("SELECT * FROM books WHERE id=?",(id))
 rows = cur.fetchone()
 conn.commit()
 conn.close()
 return rows

