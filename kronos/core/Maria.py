from typing import Union, List, Dict, Optional
import mysql.connector
from mysql.connector import Error
from config import settings

class Maria:
    def __init__(self, database: str):
        self.config = {
            "host": "localhost",
            "user": "root",
            "password": "n130177!",
            "database": database,  # Use the passed database name
            "use_unicode": True,
            "charset": "utf8mb4",
            "collation": "utf8mb4_unicode_ci",
            "buffered": True,
        }
        self._db = self.mysql_con()
        self.cursor = self._db.cursor(dictionary=True)


    def mysql_con(self):
            try:
                connection = mysql.connector.connect(**self.config)
                print(f"Connecting successful to database: {self.config['database']}...")
                return connection
            except Error as error:
                print(f"Error connecting to the database: {error}")
                raise  # Re-raise the exception for FastAPI to handle

    def switch_database(self, database_name: str):
        try:
            self.config['database'] = database_name
            self._db.close()  # Close the existing connection
            self._db = self.mysql_con()  # Create a new connection
            self.cursor = self._db.cursor(dictionary=True)  # Create a new cursor
            print(f"Switched to database: {database_name}")
        except Exception as e:
            raise Exception(f"Failed to switch database: {e}")

    def is_(self, name: str) -> Union[str, bool]:
        fetch = self.f("SELECT en FROM globs WHERE name = %s", (name,))
        if fetch:
            return fetch[0]['en']  # Assuming 'en' is the column you want
        else:
            return False

    def fjsonlist(self, query: str) -> list:
        res = self.fa(query)
        if not res:
            return []
        tags = []
        for row in res:
            if row.get('json') != '[]':
                jsdecod = json.loads(row['json'])
                if jsdecod:
                    for val in jsdecod.values():
                        tags.append(val.strip())
        return tags

    def inse(self, table: str, params: dict, id: Optional[int] = None) -> Union[int, bool]:
        columns = ', '.join(params.keys())
        placeholders = ', '.join(['%s'] * len(params))
        values = list(params.values())

        if id is not None:
            columns = 'id, ' + columns
            placeholders = '%s, ' + placeholders
            values.insert(0, id)

        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"

        cursor = self._db.cursor()
        cursor.execute(sql, values)
        self._db.commit()
        last_id = cursor.lastrowid
        cursor.close()
        return last_id if last_id else True

    def listTables(self) -> list:
        cursor = self._db.cursor()
        cursor.execute("SHOW TABLES")
        return [table[0] for table in cursor.fetchall()]

    def types(self, table: str) -> dict:
        cursor = self._db.cursor()
        cursor.execute(f"SELECT * FROM {table} LIMIT 1")  # Fetch one row to get column types
        result = {}
        for desc in cursor.description:
            result[desc[0]] = desc[1]
        cursor.close()
        return result

    def comments(self, table: str) -> dict:
        cursor = self._db.cursor()
        cursor.execute(f"SHOW FULL COLUMNS FROM {table}")
        result = {column[0]: column[8] for column in cursor.fetchall()}
        cursor.close()
        return result

    def char_types(self, table: str) -> list:
        types = self.types(table)
        return [col for col, type_ in types.items() if type_ in (253, 254, 252)]  # VARCHAR, CHAR, BLOB

    def fa(self, query: str, params: tuple = ()) -> list:
        cursor = self._db.cursor(dictionary=True)
        cursor.execute(query, params)
        result = cursor.fetchall()
        cursor.close()
        return result

    def f(self, q: str, params: tuple = ()) -> Union[dict, bool]:
        cursor = self._db.cursor(dictionary=True)  # Use dictionary cursor for easy access
        cursor.execute(q, params)
        result = cursor.fetchone()
        cursor.close()
        return result

    def q(self, q: str, params: tuple = ()) -> bool:
        cursor = self._db.cursor()
        cursor.execute(q, params)
        self._db.commit()
        return bool(cursor.rowcount)

    def ins(self, table: str, params: dict, id: Optional[int] = None) -> Union[int, bool]:
        columns = ', '.join(params.keys())
        placeholders = ', '.join(['%s'] * len(params))
        values = list(params.values())

        if id is not None:
            columns = 'id, ' + columns
            placeholders = '%s, ' + placeholders
            values.insert(0, id)

        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"

        cursor = self._db.cursor()
        cursor.execute(sql, values)
        self._db.commit()
        last_id = cursor.lastrowid
        cursor.close()
        return last_id if last_id else True

    def count_(self, rowt: str, table: str, clause: str = '', params: tuple = ()) -> int:
        cursor = self._db.cursor()
        cursor.execute(f"SELECT COUNT({rowt}) FROM {table} {clause}", params)
        count = cursor.fetchone()[0]  # Fetch the count
        cursor.close()
        return count

    def counter(self, query: str, params: tuple = ()) -> int:
        cursor = self._db.cursor()
        cursor.execute(query, params)
        count = cursor.fetchone()[0]  # Fetch the count
        cursor.close()
        return count

    def columns(self, table: str, list_: bool = False) -> Union[list, dict]:
        cursor = self._db.cursor(dictionary=True if not list_ else False)
        cursor.execute(f"DESCRIBE {table}")
        result = cursor.fetchall()
        cursor.close()
        return result if not list_ else [column[0] for column in result]

    def fPairs(self, row1: str, row2: str, table: str, clause: str = '') -> dict:
        cursor = self._db.cursor(dictionary=True)
        cursor.execute(f"SELECT {row1},{row2} FROM {table} {clause}")
        result = dict(cursor.fetchall())  # Convert to a dictionary
        cursor.close()
        return result

    def fUnique(self, query: str) -> dict:
        cursor = self._db.cursor(dictionary=True)
        cursor.execute(query)
        result = {}
        for row in cursor.fetchall():
            key = list(row.keys())[0]  # Get the first key
            result[row[key]] = row
        cursor.close()
        return result

    def fGroup(self, query: str) -> dict:
        cursor = self._db.cursor(dictionary=True)
        cursor.execute(query)
        result = {}
        for row in cursor.fetchall():
            key = row.pop(list(row.keys())[0])  # Get the first key and remove it
            result.setdefault(key, []).append(row)
        cursor.close()
        return result

    def fList(self, rows: Union[str, list], table: str, clause: str = '') -> list:
        rows_str = rows if isinstance(rows, str) else ', '.join(rows)
        cursor = self._db.cursor()
        cursor.execute(f"SELECT {rows_str} FROM {table} {clause}")
        result = [row[0] for row in cursor.fetchall()]  # Extract the first element from each row
        cursor.close()
        return result

    def fetchList(self, rows: Union[str, list], table: str, clause: str = '') -> Union[dict, bool]:
        list_ = {}
        if isinstance(rows, list):
            row1, row2 = rows
            fetch = self.fa(f"SELECT {row1}, {row2} FROM {table} {clause}")
            if fetch:
                for row in fetch:
                    row1_key = row1.split('.')[-1] if '.' in row1 else row1
                    row2_key = row2.split('.')[-1] if '.' in row2 else row2
                    list_[row[row1_key]] = row[row2_key]
                return list_
            else:
                return False
        else:
            fetch = self.fa(f"SELECT {rows} FROM {table} {clause}")
            if fetch:
                for row in fetch:
                    list_.append(row[rows])
                return list_
            else:
                return False

    def truncate(self, table: str):
        cursor = self._db.cursor()
        cursor.execute(f"TRUNCATE TABLE {table}")
        self._db.commit()
        cursor.close()

    def fl(self, rows: Union[str, list], table: str, clause: str = '') -> Union[dict, bool]:
        list_ = {}
        if isinstance(rows, list):
            row1, row2 = rows
            fetch = self.fa(f"SELECT {row1}, {row2} FROM {table} {clause}")
            if fetch:
                for row in fetch:
                    row1_key = row1.split('.')[-1] if '.' in row1 else row1
                    row2_key = row2.split('.')[-1] if '.' in row2 else row2
                    list_[row[row1_key]] = row[row2_key]
                return list_
            else:
                return False
        else:
            fetch = self.fa(f"SELECT {rows} FROM {table} {clause}")
            if fetch:
                for row in fetch:
                    list_.append(row[rows])
                return list_
            else:
                return False

    def trigger_list(self) -> list:
        triggers = self.fa("SHOW TRIGGERS")
        return [trigger['Trigger'] for trigger in triggers] if triggers else []