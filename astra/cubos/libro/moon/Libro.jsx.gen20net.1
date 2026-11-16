import { useState } from 'react';
import './Libro.css';

const GOOGLE_BOOKS_KEY = import.meta.env?.VITE_GOOGLE_BOOKS_KEY || '';

// ---------- ISBN validation ----------

const isValidISBN10 = (isbn) => {
    if (!/^\d{9}[\dX]$/i.test(isbn)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += (i + 1) * parseInt(isbn.charAt(i), 10);
    sum += 10 * (isbn.charAt(9).toUpperCase() === 'X' ? 10 : parseInt(isbn.charAt(9), 10));
    return sum % 11 === 0;
};

const isValidISBN13 = (isbn) => {
    if (!/^\d{13}$/.test(isbn)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(isbn.charAt(i), 10) * (i % 2 === 0 ? 1 : 3);
    return (sum + parseInt(isbn.charAt(12), 10)) % 10 === 0;
};

const isValidISBN = (raw) => {
    const isbn = (raw || '').replace(/[\s-]+/g, '');
    if (isbn.length === 10) return isValidISBN10(isbn);
    if (isbn.length === 13) return isValidISBN13(isbn);
    return false;
};

const normalizeISBN = (raw) => (raw || '').replace(/[\s-]+/g, '');

// ---------- Google Books ----------

const fetchGoogleBookByISBN = async (isbn) => {
    const key = GOOGLE_BOOKS_KEY ? `&key=${GOOGLE_BOOKS_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.totalItems) return null;
    return data.items[0].volumeInfo;
};

const fetchGoogleISBNsByTitleAuthor = async (title, author) => {
    const key = GOOGLE_BOOKS_KEY ? `&key=${GOOGLE_BOOKS_KEY}` : '';
    const q = `${title}+inauthor:${author}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.totalItems) return null;
    return data.items[0].volumeInfo.industryIdentifiers || [];
};

// ---------- Open Library ----------

const fetchOpenLibraryByISBN = async (isbn) => {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    const data = await res.json();
    return data[`ISBN:${isbn}`] || null;
};

const fetchOpenLibraryISBNs = async (title, author) => {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.numFound) return null;
    return data.docs[0].isbn || [];
};

// ---------- Normalize both sources to a common shape ----------

const fromGoogle = (info) => ({
    title: info.title || 'N/A',
    authors: info.authors || [],
    publisher: info.publisher || 'N/A',
    publishedDate: info.publishedDate || 'N/A',
    description: info.description || '',
    thumbnail: info.imageLinks?.thumbnail || null,
    identifiers: info.industryIdentifiers || [],
});

const fromOpenLibrary = (info) => ({
    title: info.title || 'N/A',
    authors: (info.authors || []).map((a) => a.name),
    publisher: (info.publishers || []).map((p) => p.name).join(', ') || 'N/A',
    publishedDate: info.publish_date || 'N/A',
    description: info.excerpts?.[0]?.text || '',
    thumbnail: info.cover?.medium || info.cover?.small || null,
    identifiers: [],
});

// ---------- Component ----------

const Libro = () => {
    // ISBN lookup state
    const [isbn, setIsbn] = useState('');
    const [isbnBook, setIsbnBook] = useState(null);
    const [isbnError, setIsbnError] = useState('');
    const [isbnLoading, setIsbnLoading] = useState(false);

    // Title/Author lookup state
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbnList, setIsbnList] = useState(null);
    const [titleError, setTitleError] = useState('');
    const [titleLoading, setTitleLoading] = useState(false);

    // ----- ISBN lookup -----

    const handleIsbnLookup = async (e) => {
        e?.preventDefault();
        setErrorReset();
        const clean = normalizeISBN(isbn);
        if (!isValidISBN(clean)) {
            setIsbnError('Invalid ISBN (10 or 13 digits, ISBN-10 may end in X).');
            return;
        }
        setIsbnLoading(true);
        try {
            // Try Google first, fall back to Open Library
            let book = null;
            try {
                const g = await fetchGoogleBookByISBN(clean);
                if (g) book = fromGoogle(g);
            } catch (err) {
                console.warn('Google Books failed:', err);
            }
            if (!book) {
                const o = await fetchOpenLibraryByISBN(clean);
                if (o) book = fromOpenLibrary(o);
            }
            if (book) {
                setIsbnBook(book);
            } else {
                setIsbnError('No book found for this ISBN.');
            }
        } catch (err) {
            console.error(err);
            setIsbnError('Lookup failed. Try again.');
        } finally {
            setIsbnLoading(false);
        }
    };

    const setErrorReset = () => {
        setIsbnError('');
        setTitleError('');
        setIsbnBook(null);
        setIsbnList(null);
    };

    // ----- Title/Author lookup -----

    const handleTitleLookup = async (e) => {
        e?.preventDefault();
        setErrorReset();
        if (!title.trim() || !author.trim()) {
            setTitleError('Please enter both title and author.');
            return;
        }
        setTitleLoading(true);
        try {
            let list = null;
            try {
                const g = await fetchGoogleISBNsByTitleAuthor(title.trim(), author.trim());
                if (g) list = g.map((i) => ({ type: i.type, identifier: i.identifier }));
            } catch (err) {
                console.warn('Google Books failed:', err);
            }
            if (!list) {
                const o = await fetchOpenLibraryISBNs(title.trim(), author.trim());
                if (o) list = o.map((id) => ({ type: 'ISBN', identifier: id }));
            }
            if (list && list.length) {
                setIsbnList(list);
            } else {
                setTitleError('No ISBNs found for this title/author.');
            }
        } catch (err) {
            console.error(err);
            setTitleError('Lookup failed. Try again.');
        } finally {
            setTitleLoading(false);
        }
    };

    return (
        <div className="libro-panel">
            {/* ---------- ISBN lookup ---------- */}
            <section className="libro-section">
                <h3 className="libro-heading">Lookup by ISBN</h3>
                <form className="libro-form" onSubmit={handleIsbnLookup}>
                    <label htmlFor="libro-isbn">ISBN (10 or 13)</label>
                    <input
                        id="libro-isbn"
                        type="text"
                        className="libro-input"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="9780141036144"
                        autoComplete="off"
                    />
                    <button type="submit" className="libro-btn" disabled={isbnLoading}>
                        {isbnLoading ? 'Searching…' : 'Lookup'}
                    </button>
                </form>

                {isbnError && <p className="libro-error">{isbnError}</p>}

                {isbnBook && (
                    <div className="libro-result">
                        {isbnBook.thumbnail && (
                            <img
                                className="libro-cover"
                                src={isbnBook.thumbnail}
                                alt={isbnBook.title}
                            />
                        )}
                        <div className="libro-meta">
                            <h4>{isbnBook.title}</h4>
                            <p><strong>Authors:</strong> {isbnBook.authors.length ? isbnBook.authors.join(', ') : 'N/A'}</p>
                            <p><strong>Publisher:</strong> {isbnBook.publisher}</p>
                            <p><strong>Published:</strong> {isbnBook.publishedDate}</p>
                            {isbnBook.identifiers.length > 0 && (
                                <p>
                                    <strong>ISBNs:</strong>{' '}
                                    {isbnBook.identifiers.map((i) => `${i.type}: ${i.identifier}`).join(' • ')}
                                </p>
                            )}
                            {isbnBook.description && (
                                <p className="libro-desc">{isbnBook.description}</p>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* ---------- Title/Author lookup ---------- */}
            <section className="libro-section">
                <h3 className="libro-heading">Find ISBN by Title & Author</h3>
                <form className="libro-form" onSubmit={handleTitleLookup}>
                    <label htmlFor="libro-title">Book Title</label>
                    <input
                        id="libro-title"
                        type="text"
                        className="libro-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Hobbit"
                        autoComplete="off"
                    />

                    <label htmlFor="libro-author">Author</label>
                    <input
                        id="libro-author"
                        type="text"
                        className="libro-input"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="J.R.R. Tolkien"
                        autoComplete="off"
                    />

                    <button type="submit" className="libro-btn" disabled={titleLoading}>
                        {titleLoading ? 'Searching…' : 'Find ISBN'}
                    </button>
                </form>

                {titleError && <p className="libro-error">{titleError}</p>}

                {isbnList && isbnList.length > 0 && (
                    <div className="libro-isbn-list">
                        <h4>ISBNs found</h4>
                        <ul>
                            {isbnList.map((item, idx) => (
                                <li key={`${item.identifier}-${idx}`}>
                                    <span className="libro-isbn-type">{item.type}:</span>{' '}
                                    <code>{item.identifier}</code>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Libro;