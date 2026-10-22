import pymysql
import json

def get_db_connection():
    # Your database connection logic here
    pass

def fetch_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Example query
    cursor.execute("SELECT id, content FROM gen20_system_filemeta")
    results = cursor.fetchall()
    conn.close()
    return results

def transform_data(data):
    transformed_data = []
    for row in data:
        prompt = f"Summarize the following content: {row['content']}"
        completion = f"Summary of content {row['id']}" # Replace with actual summary
        transformed_data.append({"prompt": prompt, "completion": completion})
    return transformed_data

def save_data(data, filename="finetune_data.jsonl"):
    with open(filename, "w") as f:
        for item in data:
            json.dump(item, f)
            f.write("\n")

if __name__ == "__main__":
    data = fetch_data()
    transformed_data = transform_data(data)
    save_data(transformed_data)
    print("Data transformed and saved to finetune_data.jsonl")