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
    database="vivalibro",
    use_unicode=True,
    charset="utf8mb4",
    collation='utf8mb4_general_ci'
)

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("""
    SELECT
        vl_book.id,
        vl_book.title,
        vl_book.summary,
        vl_book.published,
        vl_book.isbn,
        vl_book.lang,
        vl_book.clas,
        vl_book.img,
        vl_book.img_s,
        vl_book.img_l,
        vl_writer.name AS writername,
        vl_writer.bio AS writerbio,
        vl_publisher.name AS publishername,
        vl_publisher.profile AS publisherprofile
    FROM
        vl_book
    LEFT JOIN vl_writer ON vl_book.writer = vl_writer.id
    LEFT JOIN vl_publisher ON vl_book.publisher = vl_publisher.id
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
