#!/usr/bin/env python3
# fix_clinvar_interpretations.py

import csv
import re
import sys

def fix_clinvar_csv(input_file, output_file):
    """
    Fix ClinVar conflicting_interpretations CSV.
    Handles:
    - Extra quotes inside fields
    - Commas inside quoted fields
    - Rows with more columns than expected
    - Empty fields
    """
    
    print(f"📖 Reading: {input_file}")
    
    expected_columns = 22
    fixed_rows = []
    problem_rows = []
    error_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into lines
    lines = content.splitlines()
    
    if not lines:
        print("❌ File is empty")
        return False
    
    # Get header
    header = lines[0]
    header_cols = header.split(',')
    
    print(f"📋 Header has {len(header_cols)} columns")
    
    # Process each line
    for i, line in enumerate(lines[1:], start=2):
        # Skip empty lines
        if not line.strip():
            continue
        
        # Try to parse the line with csv reader
        try:
            # Use csv reader to handle quoted fields
            import io
            reader = csv.reader(io.StringIO(line), delimiter=',', quotechar='"')
            row = next(reader)
            
            # Clean up the row
            cleaned_row = []
            for field in row:
                # Remove extra quotes
                field = field.strip()
                # Remove double quotes at start/end
                if field.startswith('"') and field.endswith('"'):
                    field = field[1:-1]
                # Replace escaped quotes
                field = field.replace('""', '"')
                # Remove trailing backslashes
                field = re.sub(r'\\+$', '', field)
                cleaned_row.append(field)
            
            # Check if row has correct number of columns
            if len(cleaned_row) < expected_columns:
                # Pad with empty strings
                cleaned_row.extend([''] * (expected_columns - len(cleaned_row)))
                print(f"⚠️ Row {i}: Padded from {len(row)} to {expected_columns} columns")
            elif len(cleaned_row) > expected_columns:
                # Merge extra columns into the last column
                extra = ','.join(cleaned_row[expected_columns-1:])
                cleaned_row = cleaned_row[:expected_columns-1] + [extra]
                print(f"⚠️ Row {i}: Merged extra columns (had {len(row)}, now {expected_columns})")
                error_count += 1
            
            fixed_rows.append(','.join(f'"{field}"' if ',' in field or '"' in field else field for field in cleaned_row))
            
        except Exception as e:
            print(f"❌ Error at row {i}: {e}")
            error_count += 1
            problem_rows.append(i)
            continue
    
    # Write fixed CSV
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header + '\n')
        f.write('\n'.join(fixed_rows))
    
    print(f"\n✅ Fixed {len(fixed_rows)} rows")
    print(f"⚠️ {error_count} problematic rows found")
    if problem_rows:
        print(f"   Problem rows: {problem_rows[:10]}{'...' if len(problem_rows) > 10 else ''}")
    
    return True

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 fix_clinvar_interpretations.py <input.csv> <output.csv>")
        sys.exit(1)
    
    fix_clinvar_csv(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()