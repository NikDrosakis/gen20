from typing import Union, List, Dict, Optional
import mariadb
import logging
from config import settings

# Configure logging
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

class Mari:
    def __init__(self):
        try:
            # Default database is None if not provided
            self.config = mariadb.connect(
                user=settings.DB_USER,
                password=settings.DB_PASS,
                host=settings.DB_HOST,
                port=3306
            )
            # Establish the connection and create a cursor
            self._db = self.config.cursor()
            logging.info("Connection successful!")
        except mariadb.Error as e:
            logging.error(f"Error connecting to MariaDB: {e}")
            self._db = None
            self.config = None

    def close(self):
        """Ensure the cursor and connection are properly closed."""
        if self._db:
            self._db.close()
        if self.config:
            self.config.close()

    def __del__(self):
        """Destructor to close connection if not already done."""
        self.close()

    def audit(self, interval_minutes: int = 5) -> Optional[List[Dict]]:
        try:
            query = f"""
                SELECT * FROM mysql.audit_log
                WHERE timestamp >= NOW() - INTERVAL {interval_minutes} MINUTE;
            """
            self._db.execute(query)
            results = self._db.fetchall()
            return results
        except Exception as error:
            logging.error(f"Error fetching audit logs: {error}")
            return None

    def inse(self, table: str, params: dict, id: Optional[int] = None) -> Optional[int]:
        try:
            columns = ', '.join(params.keys())
            placeholders = ', '.join(['%s'] * len(params))
            values = list(params.values())

            if id is not None:
                columns = 'id, ' + columns
                placeholders = '%s, ' + placeholders
                values.insert(0, id)

            sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
            self._db.execute(sql, values)
            self._db.commit()
            last_id = self._db.lastrowid
            return last_id
        except Exception as error:
            logging.error(f"Error inserting data into {table}: {error}")
            return None

    def listTables(self) -> list:
        try:
            self._db.execute("SHOW TABLES")
            return [table[0] for table in self._db.fetchall()]
        except Exception as error:
            logging.error(f"Error listing tables: {error}")
            return []

    def types(self, table: str) -> dict:
        try:
            self._db.execute(f"SELECT * FROM {table} LIMIT 1")
            result = {desc[0]: desc[1] for desc in self._db.description}
            return result
        except Exception as error:
            logging.error(f"Error fetching column types for {table}: {error}")
            return {}

    def comments(self, table: str) -> dict:
        try:
            self._db.execute(f"SHOW FULL COLUMNS FROM {table}")
            result = {column[0]: column[8] for column in self._db.fetchall()}
            return result
        except Exception as error:
            logging.error(f"Error fetching column comments for {table}: {error}")
            return {}

    def char_types(self, table: str) -> list:
        types = self.types(table)
        VARCHAR = 253
        CHAR = 254
        BLOB = 252
        return [col for col, type_ in types.items() if type_ in (VARCHAR, CHAR, BLOB)]

    def fa(self, query: str, params: tuple = ()) -> list:
        try:
            self._db.execute(query, params)
            return self._db.fetchall()
        except Exception as error:
            logging.error(f"Error fetching all data with query: {query} and params: {params}: {error}")
            return []

    def f(self, q: str, params: tuple = ()) -> Union[dict, None]:
        try:
            self._db.execute(q, params)
            return self._db.fetchone()
        except Exception as error:
            logging.error(f"Error fetching one row with query: {q} and params: {params}: {error}")
            return None

    def q(self, q: str, params: tuple = ()) -> bool:
        try:
            self._db.execute(q, params)
            self._db.commit()
            return bool(self._db.rowcount)
        except Exception as error:
            logging.error(f"Error executing query: {q} and params: {params}: {error}")
            return False

    def counter(self, query: str, params: tuple = ()) -> Optional[int]:
        try:
            self._db.execute(query, params)
            return self._db.fetchone()[0]
        except Exception as error:
            logging.error(f"Error fetching count with query: {query} and params: {params}: {error}")
            return None

    def columns(self, table: str, list_: bool = False) -> Union[list, dict]:
        try:
            self._db.execute(f"DESCRIBE {table}")
            result = self._db.fetchall()
            return result if not list_ else [column[0] for column in result]
        except Exception as error:
            logging.error(f"Error fetching columns for {table}: {error}")
            return [] if list_ else {}

    def fGroup(self, query: str, group_key: Optional[str] = None) -> dict:
        try:
            self._db.execute(query)
            result = {}
            for row in self._db.fetchall():
                key = row.pop(group_key, None) if group_key else row.pop(list(row.keys())[0], None)
                if key is not None:
                    result.setdefault(key, []).append(row)
            return result
        except Exception as error:
            logging.error(f"Error fetching grouped results with query: {query}: {error}")
            return {}

    def fList(self, rows: Union[str, list], table: str, clause: str = '') -> list:
        try:
            rows_str = rows if isinstance(rows, str) else ', '.join(rows)
            self._db.execute(f"SELECT {rows_str} FROM {table} {clause}")
            return [row[0] for row in self._db.fetchall()]
        except Exception as error:
            logging.error(f"Error fetching list with query: SELECT {rows_str} FROM {table} {clause}: {error}")
            return []

    def trigger_list(self) -> list:
        try:
            self._db.execute("SHOW TRIGGERS")
            triggers = self._db.fetchall()
            return [trigger['Trigger'] for trigger in triggers] if triggers else []
        except Exception as error:
            logging.error(f"Error fetching trigger list: {error}")
            return []
