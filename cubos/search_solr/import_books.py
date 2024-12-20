import mysql.connector
from pysolr import Solr

# Solr Connection
solr = Solr('http://localhost:8983/solr/solr_vivalibro')

# MySQL Connection
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="n130177!",
    database="vivalibro"
)

mycursor = mydb.cursor(dictionary=True)
mycursor.execute("SELECT * FROM c_book")
books = mycursor.fetchall()

# Prepare documents for Solr
solr_docs = []
for book in books:
    solr_docs.append({
        "id": book['id'],
        "title": book['title'],
        "writer": book['writer'],
        "summary": book['summary'],
        "isbn": book['isbn']
        # ... add other fields ...
    })

# Index the documents into Solr
solr.add(solr_docs)

print("Book data imported to Solr successfully!")