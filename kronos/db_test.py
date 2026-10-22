import mariadb

try:
    # Establish connection to the MariaDB server without specifying the database
    conn = mariadb.connect(
        user="root",
        password="n130177!",
        host="localhost",
        port=3306
    )
    print("Connection successful!")
    # Create a cursor to interact with the server
    cur = conn.cursor()
    return cur
except mariadb.Error as e:
    print(f"Error connecting to MariaDB: {e}")
finally:
    if conn:
        conn.close()