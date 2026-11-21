#!/usr/bin/env python3
# clinvar_submissions_to_csv.py - Convert ClinVar tab-delimited to CSV

import csv
import re
import sys
from pathlib import Path

def parse_clinvar_tab_to_csv(input_file, output_file, header_line_num=1):
    """
    Convert ClinVar tab-delimited submissions file to CSV.
    Handles the special header format with ## and # comments.
    
    Args:
        input_file: Path to input tab-delimited file
        output_file: Path to output CSV file
        header_line_num: Line number where the header starts (1-indexed)
    """
    
    print(f"📖 Reading: {input_file}")
    print(f"📝 Writing: {output_file}")
    print(f"🔍 Looking for header at line {header_line_num}")
    
    # Read the file
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find the actual header line (starts with "VariationID")
    header_line = None
    header_index = None
    comment_lines = []
    data_lines = []
    
    for i, line in enumerate(lines):
        # Skip empty lines
        if not line.strip():
            continue
        
        # Collect comment lines (start with # or ##)
        if line.startswith('#') or line.startswith('##'):
            comment_lines.append(line.strip())
            continue
        
        # Check if this is the data header (starts with VariationID)
        if line.startswith('VariationID'):
            header_line = line.strip()
            header_index = i
            break
    
    if header_line is None:
        print(f"❌ Could not find header line starting with 'VariationID'")
        print("   Looking for line containing: VariationID")
        print(f"   File has {len(lines)} lines")
        return False
    
    # Get the headers
    headers = header_line.split('\t')
    
    # Get data lines (everything after the header)
    for line in lines[header_index + 1:]:
        if line.strip():
            data_lines.append(line.strip())
    
    print(f"✅ Found {len(headers)} columns")
    print(f"✅ Found {len(data_lines)} data rows")
    print(f"✅ Found {len(comment_lines)} comment lines")
    
    # Show first few columns
    print(f"\n📋 Headers: {', '.join(headers[:10])}...")
    
    # Write to CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write headers
        writer.writerow(headers)
        
        # Write data
        for line in data_lines:
            # Handle quoted fields with tabs inside
            row = []
            current_field = ''
            in_quotes = False
            
            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                    current_field += char
                elif char == '\t' and not in_quotes:
                    row.append(current_field.strip())
                    current_field = ''
                else:
                    current_field += char
            
            # Append the last field
            row.append(current_field.strip())
            
            # Make sure we have the right number of columns
            if len(row) != len(headers):
                # Try to fix by splitting differently
                if len(row) > len(headers):
                    # Merge extra fields into the last column
                    row = row[:len(headers)-1] + [' '.join(row[len(headers)-1:])]
                elif len(row) < len(headers):
                    # Add empty fields
                    row.extend([''] * (len(headers) - len(row)))
            
            writer.writerow(row)
    
    print(f"\n✅ Successfully converted {len(data_lines)} rows to CSV")
    return True

def parse_clinvar_tab_to_csv_advanced(input_file, output_file):
    """
    Advanced parser that handles variable header positions.
    Automatically detects the header line.
    """
    
    print(f"📖 Reading: {input_file}")
    print(f"📝 Writing: {output_file}")
    
    # Read the file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into lines
    lines = content.splitlines()
    
    # Find the header line (contains "VariationID" and all column names)
    header_line = None
    header_index = None
    
    for i, line in enumerate(lines):
        if 'VariationID' in line and '\t' in line:
            # Check if this looks like a header (multiple tab-separated values)
            parts = line.split('\t')
            if len(parts) >= 10:  # At least 10 columns
                header_line = line
                header_index = i
                break
    
    if header_line is None:
        print("❌ Could not find header line containing 'VariationID'")
        return False
    
    # Parse headers
    headers = header_line.split('\t')
    
    # Get data lines (everything after header)
    data_lines = []
    for line in lines[header_index + 1:]:
        if line.strip() and not line.startswith('#'):
            data_lines.append(line)
    
    print(f"✅ Found header at line {header_index + 1}")
    print(f"✅ Found {len(headers)} columns")
    print(f"✅ Found {len(data_lines)} data rows")
    
    # Write CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write headers
        writer.writerow(headers)
        
        # Write data
        for line in data_lines:
            # Split by tabs, but respect quotes
            row = []
            current = ''
            in_quotes = False
            
            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                    current += char
                elif char == '\t' and not in_quotes:
                    row.append(current.strip())
                    current = ''
                else:
                    current += char
            
            row.append(current.strip())
            
            # Pad or truncate to match header count
            if len(row) < len(headers):
                row.extend([''] * (len(headers) - len(row)))
            elif len(row) > len(headers):
                # Merge extra fields into the last column
                row = row[:len(headers)-1] + [' '.join(row[len(headers)-1:])]
            
            writer.writerow(row)
    
    print(f"✅ Successfully converted to CSV: {output_file}")
    return True

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Convert ClinVar tab-delimited submissions file to CSV'
    )
    parser.add_argument(
        '-i', '--input',
        required=True,
        help='Input tab-delimited file from ClinVar'
    )
    parser.add_argument(
        '-o', '--output',
        default='clinvar_submissions.csv',
        help='Output CSV file (default: clinvar_submissions.csv)'
    )
    parser.add_argument(
        '--header-line',
        type=int,
        default=None,
        help='Line number where header starts (1-indexed). If not specified, auto-detect.'
    )
    
    args = parser.parse_args()
    
    if not Path(args.input).exists():
        print(f"❌ Input file not found: {args.input}")
        sys.exit(1)
    
    # Use automatic detection
    success = parse_clinvar_tab_to_csv_advanced(args.input, args.output)
    
    if success:
        print(f"\n✅ CSV created: {args.output}")
        print(f"\n📊 To load into MariaDB:")
        print(f"   LOAD DATA INFILE '{args.output}'")
        print(f"   INTO TABLE clinvar_submissions")
        print(f"   FIELDS TERMINATED BY ',' ENCLOSED BY '\"'")
        print(f"   LINES TERMINATED BY '\\n' IGNORE 1 ROWS;")
    else:
        print("❌ Conversion failed")
        sys.exit(1)

if __name__ == "__main__":
    main()