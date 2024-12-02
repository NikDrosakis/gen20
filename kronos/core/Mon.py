from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from typing import List, Dict, Union

class Mon:
    def __init__(self, db_name: str, host: str = "localhost", port: int = 27017):
        self.client = MongoClient(host, port)
        self.db = self.client[db_name]

    def inse(self, collection: str, document: dict) -> Union[int, bool, None]:
        """Insert a document into a collection."""
        try:
            result = self.db[collection].insert_one(document)
            return result.inserted_id if result.inserted_id else True
        except DuplicateKeyError:
            print("Duplicate entry found. Entry was not added.")
            return False
        except Exception as e:
            print(f"Database error occurred: {e}")
            return None

    def q(self, collection: str, query: dict, update: dict = None) -> bool:
        """Insert, update or delete (handled by MongoDB's replace_one/update_one/delete_one)."""
        if not update:
            print("Missing update details for the query.")
            return False

        try:
            result = self.db[collection].update_one(query, {"$set": update})
            return result.modified_count > 0
        except Exception as e:
            print(f"Error executing update query: {e}")
            return False

    def f(self, collection: str, query: dict) -> Union[Dict, str, bool]:
        """Fetch a single document based on the query."""
        try:
            result = self.db[collection].find_one(query)
            return result if result else False
        except Exception as e:
            print(f"Error fetching document: {e}")
            return False

    def fa(self, collection: str, query: dict) -> Union[List[Dict], bool]:
        """Fetch multiple documents."""
        try:
            result = list(self.db[collection].find(query))
            return result if result else False
        except Exception as e:
            print(f"Error fetching documents: {e}")
            return False

    def fl(self, fields: Union[str, List[str]], collection: str, query: dict = {}) -> Union[Dict, bool]:
        """Fetch specific fields and return either a row or key-value pairs."""
        try:
            projection = {field: 1 for field in fields} if isinstance(fields, list) else {fields: 1}
            result = self.db[collection].find(query, projection)

            if isinstance(fields, list) and len(fields) == 2:
                # Couple List (key-value pairs)
                return {doc[fields[0]]: doc[fields[1]] for doc in result if fields[0] in doc and fields[1] in doc}
            else:
                # Row List
                return [doc[fields] for doc in result if fields in doc]
        except Exception as e:
            print(f"Error fetching specific fields: {e}")
            return False
