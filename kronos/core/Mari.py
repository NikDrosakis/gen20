import asyncio
from typing import Union, List, Dict, Optional
import mariadb
from fastapi import APIRouter, HTTPException, Request
import json
from config import settings
from action import add

router = APIRouter()
actiongrp = "maria"
a = []

class Mari:
    def __init__(self, database: str = None):
        # Default database is None if not provided
        self.config = {
            "host": "localhost",
            "user": "root",
            "password": "n130177!",
            "autocommit":True,
        }
        # If a database is provided, add it to the config
        if database:
            self.config["database"] = database

        # Establish the connection
        self._db = self.maria_con()
        self.cursor = self._db.cursor(dictionary=True)

    def maria_con(self):
        try:
            connection = mariadb.connect(**self.config)
            if "database" in self.config:
                print(f"Connecting successful to database: {self.config['database']}...")
            else:
                print("Connecting successful without specifying a database...")
            return connection
        except Exception as error:
            print(f"Error connecting to the database: {error}")
            raise  # Re-raise the exception for FastAPI to handle

    def close(self):
        if self._db:
            self._db.close()
            print("Database connection closed.")

    # 1. Show Databases
    a.append({
        "actiongrp": actiongrp,
        "name": "maria_show_databases",
        "description": "Fetch all databases.",
        "meta": "show_databases",
        "endpoint": "/databases",
        "method": "GET",
        "params": json.dumps({})
    })
    @router.get("/databases")
    async def show_databases_endpoint():
        """Fetch all databases."""
        try:
            maria = Maria()
            databases = maria.show_databases()
            return {"databases": databases}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching databases: {e}")

    def show_databases(self) -> List[str]:
        """Fetch all databases."""
        try:
            with self._db.cursor(dictionary=True) as cursor:
                cursor.execute("SHOW DATABASES")
                return [db['Database'] for db in cursor.fetchall()]
        except mariadb.Error as err:
            print(f"Error fetching databases: {err}")
            return []

    # 2. Get Tables
    a.append({
        "actiongrp": actiongrp,
        "name": "maria_get_tables",
        "description": "Get a list of all tables and their corresponding databases.",
        "meta": "tables",
        "endpoint": "/tables",
        "method": "GET",
        "params": json.dumps({})
    })
    @router.get("/tables")
    async def get_tables_endpoint():
        """Get a list of all tables and their corresponding databases."""
        try:
            maria = Maria()
            tables_with_dbs = maria.tables()
            return {"tables_with_dbs": tables_with_dbs}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving tables with databases: {e}")

    def tables(self):
        """Get a list of all tables and their corresponding databases."""
        try:
            self.cursor.execute("""
                SELECT TABLE_NAME, TABLE_SCHEMA
                FROM information_schema.TABLES WHERE
            """)
            # Fetch all tables and schemas into a dictionary
            tables_with_dbs = {}
            for row in self.cursor.fetchall():
                tables_with_dbs[row['TABLE_NAME']] = row['TABLE_SCHEMA']
            return tables_with_dbs
        except Exception as error:
            print(f"Error retrieving tables with databases: {error}")
            return {}

    # 3. Get Audit Logs
    a.append({
        "actiongrp": actiongrp,
        "name": "maria_get_audit_logs",
        "description": "Get audit logs.",
        "meta": "audit",
        "endpoint": "/audit",
        "method": "GET",
        "params": json.dumps({})
    })
    @router.get("/audit")
    async def get_audit_logs_endpoint():
        """Get audit logs."""
        try:
            maria = Maria()
            results = maria.audit()
            return {"audit_logs": results}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching audit logs: {e}")

    #Function to get audit logs
    def audit(self):
        try:
            query = """
                SELECT * FROM mysql.audit_log
                WHERE timestamp >= NOW() - INTERVAL 5 MINUTE;
            """
            self.cursor.execute(query)
            results = self.cursor.fetchall()
            return results
        except Exception as error:
            print(f"Error fetching audit logs: {error}")
            return None
        finally:
            self.cursor.close()
            self._db.close()

    # 4. Get Table Metadata
    a.append({
        "actiongrp": actiongrp,
        "name": "maria_get_table_meta",
        "description": "Retrieves metadata information for a table.",
        "meta": "table_meta",
        "endpoint": "/table_meta/{table_name}",
        "method": "GET",
        "params": json.dumps({})
    })
    @router.get("/table_meta/{table_name}")
    async def get_table_meta_endpoint(table_name: str):
        """
        Retrieves metadata information for a table from `information_schema`.
        This includes column name, type, nullability, default value, key, extra info, and comments.
        """
        try:
            maria = Maria()
            table_metadata = maria.table_meta(table_name)
            if table_metadata is None:
                raise HTTPException(status_code=404, detail=f"Table {table_name} not found.")
            return {"table_metadata": table_metadata}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving table metadata: {e}")

    def table_meta(self, table_name: str):
            """
            Retrieves metadata information for a table from `information_schema`.
            This includes column name, type, nullability, default value, key, extra info, and comments.
            """
            # Split table_name into schema and table if it contains a dot
            exp = table_name.split(".")

            if len(exp) == 2:
                db, table = exp
            else:
                print("Invalid table name format. Expected 'database_name.table_name'")
                return None

            query = """
                SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
                       COLUMN_KEY, EXTRA, COLUMN_COMMENT
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s
                AND TABLE_NAME = %s
            """

            try:
                self.cursor.execute(query, (db, table))
                result = self.cursor.fetchall()
                return result  # Returns a list of dictionaries containing metadata
            except Exception as e:
                print(f"Error retrieving table metadata: {e}")
                return None

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

    def trigger_list(self) -> list:
        triggers = self.fa("SHOW TRIGGERS")
        return [trigger['Trigger'] for trigger in triggers] if triggers else []


add(a)

