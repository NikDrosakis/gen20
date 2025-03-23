import os
import time
import logging
import yaml
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from core.Maria import Maria  # Adjust this import as necessary

logging.basicConfig(level=logging.INFO)  # Setting up logging for the application

# Initialize Maria instance for gen_admin database access
mariadmin = Maria("gen_admin")

class Yaml(FileSystemEventHandler):
    @staticmethod
    def read_yaml_and_convert_to_json(filename):
        """
        Reads a YAML file and converts its contents into a JSON-like Python dictionary.
        """
        try:
            with open(filename, 'r') as file:
                yaml_data = yaml.safe_load(file)
            print("Converted YAML to JSON:", yaml_data)
            return yaml_data
        except yaml.YAMLError as e:
            raise ValueError(f"Error reading YAML file: {e}")

    @staticmethod
    def sync_with_database(yaml_data: dict, table_name: str):
        """
        Synchronize the YAML data with the MariaDB table.
        """
        for key, value in yaml_data.items():
            # Check if the record exists
            result = mariadmin.f(f"SELECT 1 FROM {table_name} WHERE name = %s", (key,))

            if result:
                # Update the existing row
                update_query = f"""
                    UPDATE {table_name}
                    SET {", ".join([f"{k} = %s" for k in value.keys()])}
                    WHERE name = %s
                """
                mariadmin.q(update_query, (*value.values(), key))
            else:
                # Insert a new row
                mariadmin.inse(table_name, {"name": key, **value})

    @staticmethod
    def watch_and_sync_manifest(filename, table_name):
        """
        Watches a YAML file for changes and synchronizes it with the database.
        """
        # Start the observer and watch the file using the Yaml class
        observer = Observer()
        event_handler = Yaml(filename, table_name)
        observer.schedule(event_handler, os.path.dirname(filename), recursive=False)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logging.info("Shutting down the file observer...")
            observer.stop()
        observer.join()
