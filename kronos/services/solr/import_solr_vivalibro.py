import mysql.connector
from pysolr import Solr

# Solr Connection
#solr = Solr('http://admin.vivalibro.com:8983/solr/solr_vivalibro')
solr = Solr('http://localhost:8983/solr/solr_vivalibro',timeout=3600);
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

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("""
    SELECT
        c_book.id,
        c_book.title,
        c_book.summary,
        c_book.published,
        c_book.isbn,
        c_book.lang,
        c_book.clas,
        c_book.img,
        c_book.img_s,
        c_book.img_l,
        c_book_writer.name AS writername,
        c_book_writer.bio AS writerbio,
        c_book_publisher.name AS publishername,
        c_book_publisher.profile AS publisherprofile
    FROM
        c_book
    LEFT JOIN c_book_writer ON c_book.writer = c_book_writer.id
    LEFT JOIN c_book_publisher ON c_book.publisher = c_book_publisher.id
""")
books = mycursor.fetchall()

# Prepare documents for Solr
solr_docs = []
for book in books:
    solr_docs.append({
        "id": book['id'],
        "title": book['title'],
        "lang": book['lang'],
        "img": book['img'],
        "img_s": book['img_s'],
        "img_l": book['img_l'],
        "writer": book['writername'],
        "bio": book['writerbio'],
        "publisher": book['publishername'],
        "profile": book['publisherprofile'],
        "clas": book['clas'],
        "summary": book['summary'],
        "isbn": book['isbn'],
        "published": book['published']
    })

# Index the documents into Solr
print("Number of books fetched from MySQL:", len(books))
print("Sending data to Solr...")
solr.add(solr_docs)
solr.commit()
print("Book data imported to Solr successfully!")
