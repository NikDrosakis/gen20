from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import core.maria as maria
import action as action

app = FastAPI()

# Dependency Injection for MariaDB
def get_mariadmin():
    # Your MariaDB configuration logic here
    return maria.Maria(config)

# Endpoint to get the list of databases
@app.get("/schema")
async def get_databases(mariadmin: maria.Maria = Depends(get_mariadmin)):
    try:
        databases = mariadmin.get_maria_tree()
        return {"databases": databases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching databases: {e}")

# Endpoint to get all tables with their corresponding databases
@app.get("/tables")
async def get_tables(mariadmin: maria.Maria = Depends(get_mariadmin)):
    try:
        tables_with_dbs = mariadmin.get_tables_with_dbs()
        return {"tables_with_dbs": tables_with_dbs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables with databases: {e}")

# Endpoint to get metadata of a specific table (columns, types, comments, etc.)
@app.get("/table_meta/{table_name}")
async def get_table_meta(table_name: str, mariadmin: maria.Maria = Depends(get_mariadmin)):
    try:
        table_metadata = mariadmin.table_meta(table_name)
        if table_metadata is None:
            raise HTTPException(status_code=404, detail=f"Table {table_name} not found.")
        return {"table_metadata": table_metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching table metadata: {e}")

# Endpoint to execute a plan
@app.post("/execute_plan/{plan_id}")
async def execute_plan(plan_id: int):
    try:
        await action.executePlan(plan_id)
        return {"status": "success", "message": f"Plan {plan_id} executed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing plan {plan_id}: {e}")