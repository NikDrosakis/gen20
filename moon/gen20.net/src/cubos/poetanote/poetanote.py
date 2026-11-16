"""
PoetaNote | FastAPI backend
---------------------------
Install:
    pip install fastapi uvicorn python-multipart

Run:
    uvicorn poetanote:app --host 127.0.0.1 --port 8010

Endpoints:
    GET  /health
    POST /upload       Upload a .txt or .md poetry collection
    POST /context      Find related lines in the author's indexed corpus
    GET  /poems        List indexed poems

The backend stores the corpus in SQLite. It does not serve UI or CSS.
"""

from collections import Counter
from pathlib import Path
import hashlib
import math
import re
import sqlite3
import unicodedata
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "poetanote.db"
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".txt", ".md"}

app = FastAPI(
    title="PoetaNote",
    description="Personal poetry corpus indexing and contextual line search.",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def init_db():
    with connect() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS poems (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS lines (
                id TEXT PRIMARY KEY,
                poem_id TEXT NOT NULL,
                line_no INTEGER NOT NULL,
                text TEXT NOT NULL,
                normalized TEXT NOT NULL,
                FOREIGN KEY (poem_id) REFERENCES poems(id) ON DELETE CASCADE,
                UNIQUE (poem_id, line_no)
            );

            CREATE INDEX IF NOT EXISTS idx_lines_poem
                ON lines(poem_id, line_no);
            """
        )


@app.on_event("startup")
def startup():
    init_db()


# ---------------------------------------------------------------------------
# Text processing
# ---------------------------------------------------------------------------

def normalize(text: str) -> str:
    """Lowercase and remove Greek/Latin diacritics for lexical matching."""
    text = text.lower().replace("ς", "σ")
    text = unicodedata.normalize("NFD", text)
    return "".join(
        char for char in text
        if unicodedata.category(char) != "Mn"
    )


def tokenize(text: str) -> list[str]:
    """Extract Greek and Latin tokens; this is lexical, not lemmatization."""
    return [
        word
        for word in re.findall(r"[a-zα-ω]+", normalize(text))
        if len(word) > 2
    ]


def split_lines(text: str) -> list[str]:
    # Preserve each non-empty source line as a separate poetic unit.
    return [line.strip() for line in text.replace("\r\n", "\n").split("\n")
            if line.strip()]


# ---------------------------------------------------------------------------
# Upload and indexing
# ---------------------------------------------------------------------------

@app.post("/upload")
async def upload_poem(file: UploadFile = File(...)):
    filename = Path(file.filename or "poem.txt").name
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Υποστηρίζονται αρχεία TXT και MD."
        )

    raw = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(raw) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Το αρχείο ξεπερνά τα 10 MB.")

    try:
        source_text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Το αρχείο πρέπει να είναι κωδικοποιημένο σε UTF-8."
        )

    source_lines = split_lines(source_text)
    if not source_lines:
        raise HTTPException(status_code=400, detail="Δεν βρέθηκαν στίχοι.")

    file_hash = hashlib.sha256(raw).hexdigest()
    poem_id = str(uuid.uuid4())
    title = Path(filename).stem

    try:
        with connect() as con:
            con.execute(
                """
                INSERT INTO poems (id, title, filename, file_hash)
                VALUES (?, ?, ?, ?)
                """,
                (poem_id, title, filename, file_hash),
            )

            con.executemany(
                """
                INSERT INTO lines (id, poem_id, line_no, text, normalized)
                VALUES (?, ?, ?, ?, ?)
                """,
                [
                    (
                        str(uuid.uuid4()),
                        poem_id,
                        number,
                        line,
                        normalize(line),
                    )
                    for number, line in enumerate(source_lines, start=1)
                ],
            )

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Το συγκεκριμένο αρχείο έχει ήδη εισαχθεί."
        )

    return {
        "poem_id": poem_id,
        "title": title,
        "filename": filename,
        "lines_indexed": len(source_lines),
    }


# ---------------------------------------------------------------------------
# Contextual search within the author's own corpus
# ---------------------------------------------------------------------------

class ContextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    limit: int = Field(default=8, ge=1, le=30)


def make_vector(words: list[str], document_frequency: Counter, total_docs: int):
    frequencies = Counter(words)
    vector = {}

    for word, frequency in frequencies.items():
        tf = 1 + math.log(frequency)
        idf = math.log(1 + total_docs / (1 + document_frequency[word]))
        vector[word] = tf * idf

    return vector


def cosine_similarity(left: dict, right: dict) -> float:
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))

    if not left_norm or not right_norm:
        return 0.0

    dot = sum(value * right.get(word, 0.0) for word, value in left.items())
    return dot / (left_norm * right_norm)


@app.post("/context")
def find_context(request: ContextRequest):
    query_words = tokenize(request.text)
    if not query_words:
        return {"results": []}

    with connect() as con:
        rows = con.execute(
            """
            SELECT
                lines.id,
                lines.text,
                lines.line_no,
                poems.id AS poem_id,
                poems.title AS poem
            FROM lines
            JOIN poems ON poems.id = lines.poem_id
            """
        ).fetchall()

    if not rows:
        return {"results": []}

    documents = [(row, tokenize(row["text"])) for row in rows]
    document_frequency = Counter()

    for _, words in documents:
        document_frequency.update(set(words))

    total_docs = len(documents)
    query_vector = make_vector(
        query_words, document_frequency, total_docs
    )

    results = []
    for row, words in documents:
        if not words:
            continue

        line_vector = make_vector(
            words, document_frequency, total_docs
        )
        score = cosine_similarity(query_vector, line_vector)

        if score > 0:
            results.append(
                {
                    "id": row["id"],
                    "poem_id": row["poem_id"],
                    "poem": row["poem"],
                    "line": row["line_no"],
                    "text": row["text"],
                    "score": round(score, 4),
                }
            )

    results.sort(key=lambda item: item["score"], reverse=True)

    return {
        "query": request.text,
        "total_matches": len(results),
        "results": results[:request.limit],
    }


# ---------------------------------------------------------------------------
# Corpus overview
# ---------------------------------------------------------------------------

@app.get("/poems")
def list_poems():
    with connect() as con:
        rows = con.execute(
            """
            SELECT
                poems.id,
                poems.title,
                poems.filename,
                poems.created_at,
                COUNT(lines.id) AS lines_indexed
            FROM poems
            LEFT JOIN lines ON lines.poem_id = poems.id
            GROUP BY poems.id
            ORDER BY poems.created_at DESC
            """
        ).fetchall()

    return {"poems": [dict(row) for row in rows]}


@app.get("/health")
def health():
    return {"status": "ok", "service": "PoetaNote"}
