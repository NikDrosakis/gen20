import asyncio
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

import aiohttp
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pymysql.cursors

load_dotenv()

app = FastAPI()

ROOT = os.getenv("ROOT", os.path.dirname(os.path.abspath(__file__)))
MARIADMIN_CONFIG = os.getenv("MARIADMIN")

# Database connection setup
def get_db_connection():
    try:
        connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            db=os.getenv("DB_NAME"),
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )
        return connection
    except pymysql.Error as e:
        print(f"Error connecting to database: {e}")
        return None

# Action Status Enum (using a dictionary for simplicity)
ACTION_STATUS = {
    "DEPRECATED": 0,
    "DANGEROUS": 1,
    "MISSING_INFRASTRUCTURE": 2,
    "NEEDS_UPDATES": 3,
    "INACTIVE_WRONG_FAILED": 4,
    "NEW": 5,
    "WORKING_TESTING_EXPERIMENTAL": 6,
    "ALPHA_RUNNING_READY": 7,
    "BETA_WORKING": 8,
    "STABLE": 9,
    "STABLE_DEPENDS_OTHERS": 10,
}

execution_running = False

# Data Models for Request and Response
class ActionGrpData(BaseModel):
    name: str
    description: str
    base: str
    meta: Optional[dict] = None

class ActionData(BaseModel):
    name: str
    systemsid: Optional[int] = 3
    endpoint: str
    payload: Optional[str] = None
    body: Optional[dict] = None
    requires: Optional[str] = None
    interval_time: Optional[int] = 0
    sort: Optional[int] = 0
    type: Optional[str] = None
    keys: Optional[str] = None
    statement: Optional[str] = None
    execute: Optional[str] = None

class ActionRecord(BaseModel):
    id: int
    name: str
    actiongrpid: int
    systemsid: int
    endpoint: str
    status: int
    log: Optional[str]
    updated: Optional[datetime]
    exe_time: Optional[int]
    keys: Optional[str]
    payload: Optional[str]
    body: Optional[dict]
    requires: Optional[str]
    interval_time: Optional[int]
    sort: Optional[int]
    type: Optional[str]
    grpName: Optional[str]
    base: Optional[str]

class ActionResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ActionRecord] = None

class StatusCounts(BaseModel):
    DEPRECATED: int
    DANGEROUS: int
    MISSING_INFRASTRUCTURE: int
    NEEDS_UPDATES: int
    INACTIVE_WRONG_FAILED: int
    NEW: int
    WORKING_TESTING_EXPERIMENTAL: int
    ALPHA_RUNNING_READY: int
    BETA_WORKING: int
    STABLE: int
    STABLE_DEPENDS_OTHERS: int

# Database Query Functions
async def db_query(query: str, params: tuple = None):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()
            return cursor.fetchall()
    except pymysql.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

async def db_fetch_one(query: str, params: tuple = None):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()
    except pymysql.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

async def db_insert(table: str, data: dict):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        with conn.cursor() as cursor:
            columns = ", ".join(data.keys())
            placeholders = ", ".join(["%s"] * len(data))
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
            cursor.execute(query, tuple(data.values()))
            conn.commit()
            return {"insertId": cursor.lastrowid}
    except pymysql.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

# Action Execution Logic
async def run_action(name: str) -> ActionResponse:
    try:
        record = await db_fetch_one(
            """
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.name=%s
            """,
            (name,),
        )
        if not record:
            print(f"✗  Action with ID {name} not found.")
            return ActionResponse(success=False, message=f"Action with ID {name} not found.")

        start_time = datetime.now()
        result = await execute_action(record)
        end_time = datetime.now()
        exe_time = int((end_time - start_time).total_seconds() * 1000)

        if result:
            await update_status(record, ACTION_STATUS["ALPHA_RUNNING_READY"], "Action completed", exe_time)
            return ActionResponse(
                success=True, message=f"Action {name} completed successfully", data=ActionRecord(**record)
            )
        else:
            await update_status(record, ACTION_STATUS["INACTIVE_WRONG_FAILED"], "Action failed", exe_time)
            return ActionResponse(
                success=False, message=f"Action {name} failed", data=ActionRecord(**record)
            )

    except Exception as err:
        print(f"✗  Error processing action {name}: {err}")
        return ActionResponse(success=False, message=f"Error processing action {name}: {err}")

async def action_loop():
    global execution_running
    if execution_running:
        print("🏃‍♂️ Loop is already running")
        return

    execution_running = True
    try:
        pre_loop_counts = await get_action_status_counts()
        print("Pre-Loop Status Counts:")
        print(pre_loop_counts)

        actions = await db_query(
            """
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.systemsid in (0,3)
            ORDER BY action.sort;
            """
        )
        if not actions or len(actions) == 0:
            print("✗  No pending actions. Waiting...")
        else:
            total, success, status_stats, percentage = await process_actions(actions)
            print(f"📊 {success}/{total} --> {percentage} %success")
            post_loop_counts = await get_action_status_counts()
            print("🏁 Post-Loop Status Counts:")
            print(post_loop_counts)
    except Exception as err:
        print(f"✗  Error in main loop: {err}")
    finally:
        execution_running = False

async def process_actions(actions: List[dict]):
    total = 0
    success = 0
    status_stats = {key: 0 for key in ACTION_STATUS}

    for rec in actions:
        total += 1
        try:
            start_time = datetime.now()
            result = await execute_action(rec)
            end_time = datetime.now()
            exe_time = int((end_time - start_time).total_seconds() * 1000)

            if result:
                status_stats["ALPHA_RUNNING_READY"] += 1
                success += 1
                await update_status(rec, ACTION_STATUS["ALPHA_RUNNING_READY"], "Action completed", exe_time)
            else:
                status_stats["INACTIVE_WRONG_FAILED"] += 1
                await update_status(rec, ACTION_STATUS["INACTIVE_WRONG_FAILED"], "Action failed", exe_time)
        except Exception as err:
            status_stats["NEEDS_UPDATES"] += 1
            print(f"✗  Error processing action {rec['id']}: {err}")
            await update_status(rec, ACTION_STATUS["NEEDS_UPDATES"], str(err))

    percentage = 0 if total == 0 else float(f"{(success / total) * 100:.2f}")
    return total, success, status_stats, percentage

async def get_action_status_counts() -> StatusCounts:
    query_parts = [
        f"COUNT(CASE WHEN status = {val} THEN 1 END) as {key}" for key, val in ACTION_STATUS.items()
    ]
    query = f"SELECT {', '.join(query_parts)} FROM action WHERE systemsid in(0,3)"
    status_counts = await db_fetch_one(query)
    return StatusCounts(**status_counts)

def get_next_interval_time(actions: List[dict]) -> int:
    if not actions:
        return 10
    interval_times = [a["interval_time"] for a in actions if a.get("interval_time", 0) > 0]
    if not interval_times:
        return 10
    return min(interval_times)

async def execute_action(rec: dict) -> bool:
    try:
        action_type = rec.get("type")
        if action_type == "route":
            return await build_route(rec)
        elif action_type == "int_resource":
            return await run_internal_resource(rec)
        elif action_type == "ext_resource":
            return await run_external_resource(rec)
        elif action_type in ["generate", "ai"]:
            return await build_ai(rec)
        elif action_type == "N":
            return await build_n(rec)
        elif action_type == "fs":
            return True
        else:
            print(f"✗  Unknown type '{action_type}' for action ID {rec['id']}.")
            return False
    except Exception as error:
        print(f"✗  Error executing action: {error}")
        return False

async def update_endpoint_params(endpoint: str, params: dict, name: str):
    try:
        stringified_params = json.dumps(params)
        await db_query(
            "UPDATE action SET params=%s, endpoint=%s WHERE actiongrp.name=%s",
            (stringified_params, endpoint, name),
        )
        print(f"✓ Updated action table with: params = {stringified_params}, endpoint = {endpoint}")
    except Exception as e:
        print(f"Error while reading, parsing file or updating db: {e}")

async def update_status(rec: dict, new_status: int, log: str = "", exe_time: int = 0):
    try:
        await db_query(
            "UPDATE action SET status = %s, log = %s, updated = CURRENT_TIMESTAMP, exe_time = %s WHERE id = %s",
            (new_status, log, exe_time, rec["id"]),
        )
        print(f"💾 Action {rec['id']} set to status {new_status}")
    except Exception as err:
        print(f"✗  Error updating action status: {err}")

def parse_jsdoc(comment: str) -> Optional[dict]:
    try:
        param_match = comment.find("@params")
        if param_match != -1:
            start_index = comment.find("{", param_match)
            if start_index != -1:
                end_index = comment.find("}", start_index)
                if end_index != -1:
                    try:
                        params_str = comment[start_index : end_index + 1]
                        return json.loads(params_str)
                    except json.JSONDecodeError:
                        print(f"Invalid JSON after @params tag: {params_str}")
                        return {}
    except Exception as e:
        print(f"Error while parsing params: {e}")
    return None

def scan_routes(router, prefix: str = "") -> List[dict]:
    mappings = []
    if router:
        for route in router.routes:
            methods = ",".join(route.methods).upper()
            path = prefix + route.path
            keys = "default-key"
            params = {}
            if route.endpoint:
                keys = getattr(route.endpoint, "__name__", "default-key")
                params = getattr(route.endpoint, "__annotations__", {})
            mappings.append({"method": methods, "path": path, "keys": keys, "params": params})
    return mappings

async def check_route_health(rec: dict) -> bool:
    health_endpoint = "health"
    ping_endpoint = "ping"
    endpoints = [health_endpoint, ping_endpoint]

    for endpoint in endpoints:
        host = rec["base"] + endpoint
        try:
            print(f"--> Checking health at: {host}")
            async with aiohttp.ClientSession() as session:
                async with session.get(host) as response:
                    if not response.ok:
                        try:
                            error_body = await response.text()
                        except Exception as body_error:
                            error_body = f"Could not read body {body_error}"
                        print(f"✗ Health Check Failed: {host} status: {response.status} {error_body}")
                        continue
                    else:
                        print(f"✓ Health Check OK: {host}")
                        return True
        except Exception as error:
            print(f"✗ Health Check Error for: {host} {error}")
            continue
    return False

async def build_route(rec: dict) -> bool:
    router_path = os.path.join("services", rec["grpName"], "routes.py")
    if os.path.exists(router_path):
        try:
            # Dynamically import the routes module
            import importlib.util
            spec = importlib.util.spec_from_file_location("routes", router_path)
            routes_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(routes_module)
            routes = getattr(routes_module, "router", None)

            if routes:
                app.include_router(routes, prefix=f"/ermis/v1/{rec['grpName']}")
                print(f"✓  {rec['grpName']} routed.")
                route_mappings = scan_routes(routes, f"/ermis/v1/{rec['grpName']}")
                return bool(route_mappings)
            else:
                print(f"✗  Error: No valid router exported from {router_path}")
                return False
        except Exception as error:
            print(f"✗  Error loading route {router_path}: {error}")
            return False
    else:
        print(f"✗  Invalid path for action group: {rec['grpName']}")
        return False

async def build_ai(rec: dict) -> bool:
    try:
        method, raw_url = rec["endpoint"].split(",")
        url = await render_keys(raw_url, rec)

        if method == "POST":
            print(f"--> Processing AI POST request to: {url}")
            try:
                payload = json.loads(rec.get("payload", "{}"))
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        url, json=payload, headers={"Content-Type": "application/json"}
                    ) as response:
                        if not response.ok:
                            raise Exception(f"✗  HTTP error! status: {response.status}")
                        data = await response.json()
                        print(f"{rec['name']} AI responded with data:", data)
                        return True
            except Exception as fetch_error:
                print(f"✗  Error processing AI POST request: {fetch_error}")
                return False
        else:
            print(f"✗  Unsupported HTTP method for AI: {method}")
            return False
    except Exception as err:
        print(f"✗  Error building AI route: {err}")
        return False

async def render_keys(raw_url: str, rec: dict) -> str:
    key_value_pairs = {}
    if rec.get("keys"):
        for pair in rec["keys"].split(","):
            if "=" in pair:
                key, value = pair.split("=", 1)
                key_value_pairs[key] = value
    try:
        from urllib.parse import urlparse, parse_qs, urlencode
        url = urlparse(raw_url)
        query_params = parse_qs(url.query)
        for key, values in query_params.items():
            for i, value in enumerate(values):
                if value.startswith("{") and value.endswith("}"):
                    var_name = value[1:-1]
                    query_params[key][i] = key_value_pairs.get(var_name, value)
        encoded_query = urlencode(query_params, doseq=True)
        return url._replace(query=encoded_query).geturl()
    except Exception as e:
        print(f"✗  Error in render keys: {e} {raw_url} {rec}")
        return raw_url

def get_resources_params(request: Request) -> dict:
    params = {
        "query": dict(request.query_params),
        "headers": dict(request.headers),
        "cookies": dict(request.cookies),
    }
    return params

async def render_keys_in_text(text: str, data: dict) -> str:
    import re
    keys = re.findall(r"{{(.*?)}}", text)
    rendered = text
    for key_match in keys:
        key = key_match.strip()
        value = data
        for k in key.split("."):
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                value = ""
                break
        rendered = rendered.replace(f"{{{{{key_match}}}}}", str(value))
    return rendered

async def run_external_resource(rec: dict) -> bool:
    try:
        method, raw_url = rec["endpoint"].split(",")
        url = await render_keys(raw_url, rec)
        data = None
        response = None

        if method in ["GET", "POST"]:
            print(f"--> Processing {method} request to: {url}")
            try:
                options = {"method": method}
                if method == "POST":
                    body_data = await render_keys_in_text(json.dumps(rec.get("body", {})), rec)
                    options["headers"] = {"Content-Type": "application/json"}
                    options["data"] = body_data
                    print(f"--> POST body: {body_data}")
                async with aiohttp.ClientSession() as session:
                    async with session.request(url=url, **options) as response:
                        if not response.ok:
                            error_text = await response.text()
                            raise Exception(f"✗ HTTP! status: {response.status} \n {error_text}")
                        data = await response.json()
                        print(f"✓ {rec['name']} Responsed with data")
                        print(json.dumps(data, indent=2))
                        return data
            except Exception as err:
                print(f"✗  Processing {method} request: {err}")
                return False
        else:
            print(f"✗  Unsupported HTTP method: {method}")
            return False
    except Exception as err:
        print(f"✗  Building API route: {err}")
        return False

async def run_internal_resource(rec: dict) -> bool:
    if rec.get("requires"):
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("required_module", rec["requires"])
            required_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(required_module)
            if hasattr(required_module, "setup_app") and callable(required_module.setup_app):
                await required_module.setup_app(app)
            else:
                print(f"Error loading required module {rec['requires']}: Module is not a function")
                return False
        except Exception as require_error:
            print(f"Error loading required module {rec['requires']}: {require_error}")
            return False
    try:
        method, path = rec["endpoint"].split(",")
        if method != "GET":
            print(f"✗  Unsupported HTTP method: {method}")
            return False
        if not path:
            print(f"✗  Path not defined {path}")
            return False
        print(f"--> Processing internal GET request to: {path}")
        file = os.path.join("services", rec["grpName"], "docs", "index.html")
        if os.path.exists(file):
            @app.get(path)
            async def internal_resource_endpoint(request: Request):
                params = get_resources_params(request)
                rec["action"] = {
                    **rec.get("action", {}),
                    "params": params,
                }
                print(f"--> Params: {json.dumps(params)}")
                try:
                    await db_query(
                        "UPDATE action SET action=%s WHERE id=%s",
                        (json.dumps(rec["action"]), rec["id"]),
                    )
                    print(f"✓ Updated system {rec['id']} with params: {json.dumps(rec['action']['params'])}")
                except Exception as err:
                    print(f"✗ Error updating action params: {err}")
                return FileResponse(file)
            print(f"✓ {rec['name']} served from internal endpoint")
            return True
        else:
            print(f"✗ File not found: {file}")
            return False
    except Exception as err:
        print(f"✗  Building API route: {err}")
        return False

async def build_chat(rec: dict) -> bool:
    print(f"Processing Chat #{rec['id']}; ")
    return True

async def build_stream(rec: dict) -> bool:
    print(f"Processing Stream #{rec['id']}; ")
    return True

async def build_authentication(rec: dict) -> bool:
    print(f"Processing Authenticate #{rec['id']}; ")
    return True

async def build_n(rec: dict) -> bool:
    try:
        if rec.get("statement") or rec.get("execute"):
            #await Messenger.publishMessage(rec)
            pass
        return True
    except Exception as error:
        print(f"✗  Processing action N: {error}")
        return False

async def upsert_action(action_grp_data: ActionGrpData, action_data: ActionData) -> Optional[dict]:
    try:
        insert_action_grp_result = await db_insert(
            "actiongrp",
            {
                "name": action_grp_data.name,
                "description": action_grp_data.description,
                "base": action_grp_data.base,
                "meta": json.dumps(action_grp_data.meta) if action_grp_data.meta else None,
            },
        )
        if not insert_action_grp_result:
            raise Exception("Error inserting actiongrp")
        insert_action = await db_insert(
            "action",
            {
                "name": action_data.name,
                "systemsid": action_data.systemsid,
                "actiongrpid": insert_action_grp_result["insertId"],
                "endpoint": action_data.endpoint,
                "payload": action_data.payload,
                "body": json.dumps(action_data.body) if action_data.body else None,
                "requires": action_data.requires,
                "interval_time": action_data.interval_time,
                "sort": action_data.sort,
                "type": action_data.type,
                "keys": action_data.keys,
                "statement": action_data.statement,
                "execute": action_data.execute,
            },
        )
        if not insert_action:
            raise Exception("Error inserting action")
        return {
            "actiongrpid": insert_action_grp_result["insertId"],
            "actionid": insert_action["insertId"],
        }
    except Exception as error:
        print(f"Error adding action: {error}")
        return None

# FastAPI Endpoints
@app.get("/action/{name}", response_model=ActionResponse)
async def get_action(name: str):
    return await run_action(name)

@app.post("/action", response_model=Optional[dict])
async def create_action(action_grp_data: ActionGrpData, action_data: ActionData):
    return await upsert_action(action_grp_data, action_data)

@app.get("/loop")
async def run_loop():
    asyncio.create_task(action_loop())
    return {"message": "Action loop started"}

@app.get("/status_counts", response_model=StatusCounts)
async def get_status_counts():
    return await get_action_status_counts()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/ping")
async def ping_check():
    return {"status": "pong"}

# Main function to start the loop
async def main():
    while True:
        await action_loop()
        actions = await db_query(
            """
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.systemsid in (0,3)
            ORDER BY action.sort;
            """
        )
        interval = get_next_interval_time(actions)
        await asyncio.sleep(interval)

