import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from core.Yaml import Yaml  # Ensure the Yaml import points to the correct handler

logging.basicConfig(level=logging.INFO)  # Setting up logging for the application

# Define a handler class for YAML files
class YamlWatchHandler(FileSystemEventHandler):
    def __init__(self, filename, table_name):
        self.filename = filename
        self.table_name = table_name

    def on_modified(self, event):
        if event.src_path.endswith(self.filename):  # Ensure it matches the specific filename
            logging.info(f"Detected changes in {self.filename}. Syncing...")
            try:
                yaml_data = Yaml.read_yaml_and_convert_to_json(self.filename)
                Yaml.sync_with_database(yaml_data, self.table_name)
                logging.info(f"Synchronization with database for {self.filename} completed.")
            except Exception as e:
                logging.error(f"Error while syncing {self.filename}: {e}")

# Define the base Watch class
class Watch:
    @staticmethod
    def start_watching(filename, table_name, file_type):
        """
        Starts watching the file for changes and processes the corresponding file type.
        """
        if file_type == "yaml":
            # Create a handler for YAML files
            watch_handler = YamlWatchHandler(filename, table_name)
        else:
            logging.error(f"Unsupported file type: {file_type}")
            return

        Watch._start_observer(filename, watch_handler)

    @staticmethod
    def _start_observer(filename, event_handler):
        """
        Initializes and starts the file observer.
        """
        observer = Observer()
        directory_to_watch = os.path.dirname(filename)

        # Ensure the directory exists before starting the observer
        if not os.path.isdir(directory_to_watch):
            logging.error(f"The specified directory {directory_to_watch} does not exist.")
            return

        observer.schedule(event_handler, directory_to_watch, recursive=False)
        observer.start()

        logging.info(f"Started watching {filename} for changes...")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logging.info("Shutting down the file observer...")
            observer.stop()
        observer.join()
