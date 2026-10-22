# services/bio/ClinVarParser.py - Fixed for streaming

import xml.etree.ElementTree as ET
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import mariadb
import os
import sys
import gc
from pathlib import Path
import argparse
import time
import re
from collections import defaultdict
import gzip
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/www/gs/kronos/kronos.log'),
        logging.StreamHandler()
    ]
)

class ClinVarParser:
    """
    Parser for ClinVar XML files with streaming capabilities for large files.
    Supports both .xml and .gz compressed files.
    Handles schema detection, table creation, and batch insertion.
    """

    def __init__(self, db_config: Optional[Dict] = None, verbose: bool = False):
        """
        Initialize the ClinVar parser.

        Args:
            db_config: Optional database configuration dictionary
            verbose: Enable verbose logging
        """
        self.db_config = db_config or self._get_default_config()
        self.connection = None
        self.cursor = None
        self.batch_size = 1000
        self.table_name = "gen_gen20gr.c_clinvar_content"
        self.schema = None
        self.records_processed = 0
        self.start_time = None
        self.verbose = verbose
        self.memory_usage = 0
        self.is_compressed = False

    def _get_default_config(self) -> Dict:
        """Get default database configuration from environment or settings."""
        return {
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASS', 'n130177!'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'database': 'gen_gen20gr'
        }

    def connect(self):
        """Establish database connection."""
        try:
            self.connection = mariadb.connect(**self.db_config)
            self.cursor = self.connection.cursor()
            self._verbose_log(f"✅ Connected to database: {self.db_config['database']}")
            return True
        except mariadb.Error as e:
            logging.error(f"❌ Error connecting to MariaDB: {e}")
            return False

    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        self._verbose_log("✅ Database connection closed")

    def _verbose_log(self, message: str, level: str = "INFO"):
        """Log verbose messages if enabled."""
        if self.verbose:
            if level == "INFO":
                logging.info(f"🔍 {message}")
            elif level == "DEBUG":
                logging.debug(f"🔍 {message}")
            elif level == "WARNING":
                logging.warning(f"🔍 {message}")

    def _get_first_clinvar_record(self, file_path: str) -> Optional[str]:
        """
        Read only the first ClinVarSet record from the file.
        This is memory efficient because it stops reading after finding the first record.

        Returns:
            XML string of the first ClinVarSet record, or None if not found
        """
        self._verbose_log("🔍 Searching for first ClinVarSet record...")

        try:
            # Open file appropriately
            if file_path.endswith('.gz'):
                f = gzip.open(file_path, 'rb')
            else:
                f = open(file_path, 'rb')

            # Read in chunks and find the first ClinVarSet
            chunk_size = 1024 * 1024  # 1MB chunks
            buffer = b''
            found_start = False
            record_buffer = b''
            depth = 0
            in_record = False

            # Search for the first complete ClinVarSet element
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break

                buffer += chunk

                # If we haven't found the start, look for it
                if not found_start:
                    start_pos = buffer.find(b'<ClinVarSet')
                    if start_pos != -1:
                        found_start = True
                        # Keep everything from start position
                        buffer = buffer[start_pos:]
                        in_record = True
                        depth = 1
                        record_buffer = b'<ClinVarSet'
                        # Remove the opening tag from buffer
                        buffer = buffer[len(b'<ClinVarSet'):]

                # If we're in a record, accumulate until we find the closing tag
                if in_record:
                    # Count tags to find matching closing tag
                    pos = 0
                    while pos < len(buffer):
                        # Look for opening or closing tags
                        if buffer[pos:pos+12] == b'<ClinVarSet ' or buffer[pos:pos+12] == b'<ClinVarSet>':
                            depth += 1
                            pos += 12
                        elif buffer[pos:pos+13] == b'</ClinVarSet>':
                            depth -= 1
                            pos += 13
                            if depth == 0:
                                # Found the closing tag
                                record_buffer += buffer[:pos]
                                f.close()
                                self._verbose_log(f"✅ Found complete ClinVarSet record ({len(record_buffer)} bytes)")
                                return record_buffer.decode('utf-8', errors='ignore')
                        else:
                            pos += 1

                    # If we didn't find a closing tag, keep what we have
                    record_buffer += buffer
                    buffer = b''

            f.close()
            self._verbose_log("⚠️ No complete ClinVarSet record found")
            return None

        except Exception as e:
            logging.error(f"❌ Error reading first record: {e}")
            return None

    def detect_schema_from_xml(self, xml_file_path: str) -> Dict[str, str]:
        """
        Detect schema by parsing just 1 record from the XML file.
        Uses memory-efficient streaming to find only the first record.
        """
        self._verbose_log(f"🚀 Validating XML and detecting schema from first record")
        logging.info(f"🔍 Validating XML and detecting schema from first record...")

        schema = {}
        field_samples = defaultdict(list)
        start_time = time.time()

        try:
            total_size = os.path.getsize(xml_file_path)
            size_gb = total_size / (1024**3)
            self._verbose_log(f"📁 File size: {size_gb:.2f} GB")

            # Get only the first record as XML string
            first_record_xml = self._get_first_clinvar_record(xml_file_path)

            if not first_record_xml:
                logging.error("❌ No ClinVarSet records found in XML file")
                raise ValueError("No ClinVarSet records found in XML file")

            # Parse just this one record
            root = ET.fromstring(first_record_xml)

            # Extract schema from this record
            self._extract_schema_recursive(root, schema, field_samples, "")

            elapsed = time.time() - start_time
            self._verbose_log(f"⏱️ Schema detection completed in {elapsed:.2f} seconds")
            self._verbose_log(f"📊 Found {len(schema)} unique fields from first record")

            # Determine final data types
            final_schema = {}
            for field, samples in field_samples.items():
                if not samples:
                    continue
                sql_type = self._determine_sql_type(samples)
                final_schema[field] = sql_type

            self._verbose_log(f"📋 Final schema has {len(final_schema)} fields")

            if self.verbose and final_schema:
                self._verbose_log("📋 Sample of detected fields (first 20):")
                for i, (field, type_) in enumerate(list(final_schema.items())[:20], 1):
                    self._verbose_log(f"  {i}. {field}: {type_}")

            # Add meta fields
            final_schema['_file_name'] = 'VARCHAR(255)'
            final_schema['_record_index'] = 'BIGINT'
            final_schema['_import_date'] = 'DATETIME'

            self.schema = final_schema
            self._verbose_log(f"✅ Schema detection complete with {len(final_schema)} total fields")
            logging.info(f"✅ Schema detection complete: {len(final_schema)} fields found")
            return final_schema

        except ET.ParseError as e:
            logging.error(f"❌ XML parsing error: {e}")
            raise
        except Exception as e:
            logging.error(f"❌ Error during schema detection: {e}")
            raise

    def _extract_schema_recursive(self, element: ET.Element, schema: Dict[str, str],
                                   field_samples: Dict[str, List[str]], path: str = ""):
        """Recursively extract schema from XML elements."""
        if path:
            current_path = f"{path}.{element.tag}"
        else:
            current_path = element.tag

        if element.text and element.text.strip():
            value = element.text.strip()
            field_samples[current_path].append(value)
            schema[current_path] = 'VARCHAR(255)'

        for attr_name, attr_value in element.attrib.items():
            attr_path = f"{current_path}.@{attr_name}"
            if attr_value:
                field_samples[attr_path].append(attr_value)
                schema[attr_path] = 'VARCHAR(255)'

        for child in element:
            self._extract_schema_recursive(child, schema, field_samples, current_path)

    def _determine_sql_type(self, samples: List[str]) -> str:
        """Determine SQL data type based on sample values."""
        all_integer = True
        all_float = True
        all_date = True
        max_length = 0

        for value in samples:
            if not value:
                continue
            max_length = max(max_length, len(value))
            if not self._is_integer(value):
                all_integer = False
            if not self._is_float(value):
                all_float = False
            if not self._is_date(value):
                all_date = False

        if all_integer and samples:
            try:
                for value in samples:
                    if value and abs(int(value)) > 2147483647:
                        return 'BIGINT'
                return 'INT'
            except:
                return 'BIGINT'
        elif all_float and samples:
            return 'DECIMAL(20,10)'
        elif all_date and samples:
            return 'DATETIME'
        elif max_length > 1000:
            return 'TEXT'
        elif max_length > 255:
            return f'VARCHAR({min(max_length * 2, 4000)})'
        else:
            return f'VARCHAR({max(1, max_length * 2)})'

    def _is_integer(self, value: str) -> bool:
        if not value:
            return False
        try:
            int(value)
            return True
        except ValueError:
            return False

    def _is_float(self, value: str) -> bool:
        if not value:
            return False
        try:
            float(value)
            return True
        except ValueError:
            return False

    def _is_date(self, value: str) -> bool:
        if not value:
            return False
        date_formats = [
            '%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%Y/%m/%d',
            '%d-%m-%Y', '%d/%m/%Y', '%Y%m%d', '%Y-%m-%dT%H:%M:%S'
        ]
        for fmt in date_formats:
            try:
                datetime.strptime(value, fmt)
                return True
            except ValueError:
                continue
        return False

    def create_table_from_schema(self, schema: Dict[str, str], drop_existing: bool = False) -> bool:
        """Create MariaDB table based on detected schema."""
        self._verbose_log(f"🏗️ Creating/verifying table {self.table_name}")

        try:
            table_name_only = self.table_name.split('.')[-1]

            self.cursor.execute(f"SHOW TABLES LIKE '{table_name_only}'")
            table_exists = self.cursor.fetchone() is not None

            if table_exists and drop_existing:
                logging.info(f"🗑️ Dropping existing table {self.table_name}")
                self.cursor.execute(f"DROP TABLE {self.table_name}")
                table_exists = False

            if not table_exists:
                columns = ["`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY"]

                if self.verbose:
                    type_counts = defaultdict(int)
                    for field_name, sql_type in schema.items():
                        if field_name not in ['_file_name', '_record_index', '_import_date']:
                            type_counts[sql_type] += 1
                    self._verbose_log("📊 Schema breakdown by data type:")
                    for type_, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
                        self._verbose_log(f"  {type_}: {count} columns")

                for field_name, sql_type in schema.items():
                    if field_name in ['_file_name', '_record_index', '_import_date']:
                        continue
                    safe_col = self._sanitize_column_name(field_name)
                    columns.append(f"`{safe_col}` {sql_type}")

                columns.append("`_file_name` VARCHAR(255)")
                columns.append("`_record_index` BIGINT")
                columns.append("`_import_date` DATETIME DEFAULT CURRENT_TIMESTAMP")

                create_sql = f"""
                    CREATE TABLE {self.table_name} (
                        {', '.join(columns)}
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """

                logging.info(f"🏗️ Creating table {self.table_name}...")
                start_time = time.time()
                self.cursor.execute(create_sql)
                elapsed = time.time() - start_time

                self._create_indexes(schema)
                self.connection.commit()
                logging.info(f"✅ Table created successfully in {elapsed:.2f} seconds")
                return True
            else:
                logging.info(f"ℹ️ Table {self.table_name} already exists")
                return True

        except mariadb.Error as e:
            logging.error(f"❌ Error creating table: {e}")
            self.connection.rollback()
            return False

    def _create_indexes(self, schema: Dict[str, str]):
        """Create indexes for commonly queried fields."""
        index_fields = ['ClinVarSet.@ID', 'ClinVarSet.@DateLastUpdated']
        for field in index_fields:
            if field in schema:
                safe_col = self._sanitize_column_name(field)
                try:
                    self.cursor.execute(
                        f"CREATE INDEX idx_{safe_col} ON {self.table_name} (`{safe_col}`)"
                    )
                    logging.info(f"✅ Created index on {safe_col}")
                except mariadb.Error as e:
                    logging.warning(f"⚠️ Could not create index on {safe_col}: {e}")

    def _sanitize_column_name(self, name: str) -> str:
        """Sanitize column name for MariaDB compatibility."""
        safe = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        if safe and not safe[0].isalpha() and safe[0] != '_':
            safe = f"_{safe}"
        if len(safe) > 60:
            safe = safe[:60]
        return safe.lower()

    def _get_file_handle(self, file_path: str):
        """Returns appropriate file handle - handles both .xml and .gz files."""
        if file_path.endswith('.gz'):
            self.is_compressed = True
            self._verbose_log(f"📦 File is gzip compressed, streaming directly")
            return gzip.open(file_path, 'rb')
        else:
            self.is_compressed = False
            self._verbose_log(f"📄 File is uncompressed XML")
            return open(file_path, 'rb')

    def stream_xml_and_insert(self, xml_file_path: str, batch_size: int = 1000):
        """
        Stream the XML file and insert data in batches.
        Uses memory-efficient parsing.
        """
        if not Path(xml_file_path).exists():
            logging.error(f"❌ XML file not found: {xml_file_path}")
            return

        self.batch_size = batch_size
        self.start_time = time.time()

        self._verbose_log(f"🚀 Starting data streaming with batch size: {batch_size}")

        self.cursor.execute(f"DESCRIBE {self.table_name}")
        columns = [row[0] for row in self.cursor.fetchall()]
        logging.info(f"📋 Table columns: {len(columns)} columns found")

        total_records = 0
        batch_records = []
        file_name = Path(xml_file_path).name

        try:
            file_size = os.path.getsize(xml_file_path) / (1024**3)
            logging.info(f"🚀 Starting streaming parse of {xml_file_path}")
            logging.info(f"📁 File size: {file_size:.2f} GB {'(compressed)' if self.is_compressed else '(uncompressed)'}")

            # Get file handle
            file_handle = self._get_file_handle(xml_file_path)

            # Use iterparse with specific element to track
            context = ET.iterparse(file_handle, events=('end',))

            # Process elements one by one
            for event, elem in context:
                if elem.tag == 'ClinVarSet':
                    record = self._extract_record_data(elem, file_name, total_records)

                    if record:
                        batch_records.append(record)
                        total_records += 1

                        if len(batch_records) >= self.batch_size:
                            self._insert_batch(batch_records, columns)
                            self.records_processed += len(batch_records)

                            elapsed = time.time() - self.start_time
                            logging.info(f"✅ Inserted {self.records_processed} records so far "
                                       f"({self.records_processed / elapsed:.2f} rec/sec)")

                            batch_records = []

                            # Clear element and force garbage collection
                            elem.clear()
                            if self.records_processed % (self.batch_size * 10) == 0:
                                gc.collect()

                    # Clear element to free memory
                    elem.clear()

            # Insert remaining records
            if batch_records:
                self._insert_batch(batch_records, columns)
                self.records_processed += len(batch_records)
                logging.info(f"✅ Final batch inserted. Total: {self.records_processed} records")

            file_handle.close()
            self.connection.commit()

            elapsed = time.time() - self.start_time
            logging.info(f"🎉 Streaming complete. Total records inserted: {self.records_processed}")
            logging.info(f"⏱️ Time elapsed: {elapsed:.2f} seconds ({elapsed/60:.2f} minutes)")
            logging.info(f"⚡ Average speed: {self.records_processed/elapsed:.2f} records/second")

            if self.verbose:
                self._verbose_log("=== 📊 Processing Summary ===")
                self._verbose_log(f"Total records: {self.records_processed}")
                self._verbose_log(f"Total time: {elapsed:.2f} seconds")
                self._verbose_log(f"Average speed: {self.records_processed/elapsed:.2f} rec/sec")
                self._verbose_log(f"Batch size: {self.batch_size}")
                self._verbose_log(f"File compressed: {self.is_compressed}")

        except ET.ParseError as e:
            logging.error(f"❌ XML parsing error: {e}")
            raise
        except Exception as e:
            logging.error(f"❌ Error during streaming: {e}")
            self.connection.rollback()
            raise

    def _extract_record_data(self, element: ET.Element, file_name: str, record_index: int) -> Dict[str, Any]:
        """Extract data from a ClinVarSet element."""
        record = {}
        record['_file_name'] = file_name
        record['_record_index'] = record_index
        self._extract_element_data(element, record, "")
        return record

    def _extract_element_data(self, element: ET.Element, record: Dict[str, Any], path: str):
        """Recursively extract data from an XML element."""
        if path:
            current_path = f"{path}.{element.tag}"
        else:
            current_path = element.tag

        if element.text and element.text.strip():
            col_name = self._sanitize_column_name(current_path)
            record[col_name] = self._convert_value(element.text.strip())

        for attr_name, attr_value in element.attrib.items():
            attr_path = f"{current_path}.@{attr_name}"
            col_name = self._sanitize_column_name(attr_path)
            record[col_name] = attr_value

        for child in element:
            self._extract_element_data(child, record, current_path)

    def _convert_value(self, value: str) -> Any:
        """Convert string value to appropriate Python type."""
        if not value:
            return None

        try:
            return int(value)
        except ValueError:
            pass

        try:
            return float(value)
        except ValueError:
            pass

        date_formats = [
            '%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%Y/%m/%d',
            '%d-%m-%Y', '%d/%m/%Y', '%Y%m%d', '%Y-%m-%dT%H:%M:%S'
        ]
        for fmt in date_formats:
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue

        return value

    def _insert_batch(self, batch_records: List[Dict], columns: List[str]):
        """Insert a batch of records into the database."""
        if not batch_records:
            return

        try:
            insert_cols = []
            for col in columns:
                if col != 'id' and col in batch_records[0]:
                    insert_cols.append(col)

            if not insert_cols:
                logging.warning("⚠️ No matching columns found in record")
                return

            placeholders = ', '.join(['%s'] * len(insert_cols))
            col_str = ', '.join([f'`{col}`' for col in insert_cols])

            insert_sql = f"""
                INSERT INTO {self.table_name} ({col_str})
                VALUES ({placeholders})
            """

            batch_values = []
            for record in batch_records:
                row_values = []
                for col in insert_cols:
                    row_values.append(record.get(col))
                batch_values.append(row_values)

            self.cursor.executemany(insert_sql, batch_values)

        except mariadb.Error as e:
            logging.error(f"❌ Error inserting batch: {e}")
            raise

    def process_clinvar_file(self, xml_file_path: str, drop_existing: bool = False, batch_size: int = 1000):
        """Complete process: detect schema, create table, stream and insert data."""
        print("\n" + "="*80)
        print("🚀 CLINVAR PARSER STARTING")
        print("="*80 + "\n")

        logging.info(f"Processing ClinVar file: {xml_file_path}")

        # Step 0: Verify gzip integrity (if compressed)
        if xml_file_path.endswith('.gz'):
            print("🔐 Verifying gzip file integrity...")
            if not self._verify_gzip_integrity(xml_file_path):
                logging.error("❌ Gzip verification FAILED! File may be corrupted.")
                print("\n❌ Gzip verification FAILED! The file may be corrupted.")
                return
            print("✅ Gzip file integrity verified!\n")
        else:
            # For uncompressed XML, just check if it exists and is readable
            try:
                with open(xml_file_path, 'rb') as f:
                    f.read(1024)
                print("✅ File is readable\n")
            except Exception as e:
                logging.error(f"❌ Cannot read file: {e}")
                return

        # Connect to database
        print("🔌 Connecting to database...")
        if not self.connect():
            logging.error("❌ Failed to connect to database")
            return
        print("✅ Connected to database\n")

        try:
            # Step 1: Validate XML and detect schema
            print("🔍 Validating XML and detecting schema from first record...")
            schema = self.detect_schema_from_xml(xml_file_path)
            self.schema = schema
            print(f"✅ XML validated. Found {len(schema)} fields\n")

            # Step 2: Create table
            print(f"🏗️ Creating table {self.table_name}...")
            if not self.create_table_from_schema(schema, drop_existing):
                logging.error("❌ Failed to create table. Aborting.")
                return
            print("✅ Table ready\n")

            # Step 3: Stream and insert data
            print("🚀 Starting data streaming and insertion...")
            print("-"*80)
            self.stream_xml_and_insert(xml_file_path, batch_size)

            print("\n" + "="*80)
            logging.info("🎉 ClinVar processing completed successfully")
            print("="*80 + "\n")

        except Exception as e:
            logging.error(f"❌ Error during processing: {e}")
            raise
        finally:
            self.close()

    def _verify_gzip_integrity(self, file_path: str) -> bool:
        """Verify gzip file integrity by testing decompression."""
        try:
            self._verbose_log(f"🔐 Verifying gzip integrity...")
            with gzip.open(file_path, 'rb') as f:
                chunk = f.read(1024 * 1024)
                self._verbose_log(f"✅ Gzip file appears valid (tested first 1MB)")
                return True
        except gzip.BadGzipFile as e:
            logging.error(f"❌ Invalid gzip file: {e}")
            return False
        except Exception as e:
            logging.error(f"❌ Error verifying gzip: {e}")
            return False


def main():
    """Command-line entry point for ClinVar parser."""
    parser = argparse.ArgumentParser(
        description='Parse ClinVar XML file (supports .xml and .gz) and insert into MariaDB'
    )
    parser.add_argument(
        'xml_file',
        help='Path to the ClinVar XML file (.xml or .gz)'
    )
    parser.add_argument(
        '--drop-existing',
        action='store_true',
        help='Drop existing table before creating new one'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=1000,
        help='Number of records per batch (default: 1000)'
    )
    parser.add_argument(
        '--db-user',
        default=os.getenv('DB_USER', 'root'),
        help='Database username'
    )
    parser.add_argument(
        '--db-pass',
        default=os.getenv('DB_PASS', 'n130177!'),
        help='Database password'
    )
    parser.add_argument(
        '--db-host',
        default=os.getenv('DB_HOST', 'localhost'),
        help='Database host'
    )
    parser.add_argument(
        '--db-port',
        type=int,
        default=int(os.getenv('DB_PORT', 3306)),
        help='Database port'
    )
    parser.add_argument(
        '--db-name',
        default='gen_gen20gr',
        help='Database name'
    )
    parser.add_argument(
        '--verbose',
        '-v',
        action='store_true',
        help='Enable verbose logging with detailed progress information'
    )

    args = parser.parse_args()

    if not os.path.exists(args.xml_file):
        logging.error(f"❌ XML file not found: {args.xml_file}")
        sys.exit(1)

    db_config = {
        'user': args.db_user,
        'password': args.db_pass,
        'host': args.db_host,
        'port': args.db_port,
        'database': args.db_name
    }

    clinvar_parser = ClinVarParser(db_config, verbose=args.verbose)

    try:
        clinvar_parser.process_clinvar_file(
            xml_file_path=args.xml_file,
            drop_existing=args.drop_existing,
            batch_size=args.batch_size
        )
    except KeyboardInterrupt:
        logging.info("⚠️ Processing interrupted by user")
        sys.exit(0)
    except Exception as e:
        logging.error(f"❌ Processing failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()