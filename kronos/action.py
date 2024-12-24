import os
import logging
import pathlib
import json
import aiohttp
from mysql.connector import Error
from config import settings
from core.Maria import Maria  # Import Maria class
from fastapi import APIRouter, Request
from typing import List

# Initialize Maria instance
mariadmin = Maria("gen_admin")
maria = Maria("gen_vivalibrocom")
# Initialize FastAPI app (if not already initialized in another file)
from fastapi import FastAPI
app = FastAPI()

# Utility function to fetch actions from the DB
async def fetch_actions():
    try:
        query = """
            SELECT systems.name, actiongrp.keys, action.*
            FROM action
            LEFT JOIN systems ON systems.id = action.systemsid
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            ORDER BY sort
        """
        result = mariadmin.fa(query)
        return result
    except mysql.connector.Error as err:
        logging.error(f"Database error: {err}")
        raise Exception("Internal server error")

async def exe_actions():
    try:
        actions = await fetch_actions()

        if not actions:
            raise Exception("No valid data found in table for 'kronos'.")
        logging.info(actions)
        #Now ! integrate Pretrained Model for training by accessing actions

        ##Not now Later this!
        #for rec in actions:
         #   if rec['type'] == 'route':
          #      await build_route(rec)
           # elif rec['type'] == 'ext_resource':
            #    await build_api(rec)
            #elif rec['type'] == 'ai':
             #   await build_ai(rec)
            #else:
             #   print(f"Unknown type '{rec['type']}' for row ID {rec['id']}.")
    except Exception as e:
        print(f"Error fetching actions: {str(e)}")


async def render_keys(rawurl, rec):
    try:
        key_value_pairs = dict(pair.split('=') for pair in rec['keys'].split(','))
        url = rawurl.format(**key_value_pairs)
        return url
    except KeyError as e:
        error_msg = f"Environment variable {e} is not defined."
        await mariadmin.q("UPDATE action SET status = 'wrong', log = ? WHERE id = ?", [error_msg, rec['id']])
        raise ValueError(error_msg)


async def build_ai(rec):
    try:
        method, rawurl = rec['endpoint'].split(',')
        url = await render_keys(rawurl, rec)

        if method.upper() == "POST":
            print(f"Processing AI POST request to: {url}")
            payload = json.loads(rec.get('payload', '{}'))
            headers = {"Content-Type": "application/json"}

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status != 200:
                        raise Exception(f"HTTP error! Status: {response.status}")
                    data = await response.json()

                    print(f"{rec['names']} AI responded with data:", data)
                    await mariadmin.q("UPDATE action SET status = 'active', log = ? WHERE id = ?", [json.dumps(data), rec['id']])
        else:
            raise NotImplementedError(f"Unsupported HTTP method for AI: {method}")
    except Exception as e:
        print(f"Error building AI route: {str(e)}")
        await mariadmin.q("UPDATE action SET status = 'errored', log = ? WHERE id = ?", [str(e), rec['id']])


async def build_api(rec):
    try:
        method, rawurl = rec['endpoint'].split(',')
        url = await render_keys(rawurl, rec)

        if method.upper() == "GET":
            print(f"Processing GET request to: {url}")

            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        raise Exception(f"HTTP error! Status: {response.status}")
                    data = await response.json()
                    print(f"{rec['names']} responded with data.")
                    await mariadmin.q("UPDATE action SET status = 'activated', log = ? WHERE id = ?", [rec['id'], json.dumps(data)])
        else:
            raise NotImplementedError(f"Unsupported HTTP method: {method}")
    except Exception as e:
        print(f"Error building API route: {str(e)}")
        await mariadmin.q("UPDATE action SET status = 'errored', log = ? WHERE id = ?", [str(e), rec['id']])


async def build_route(rec):
    try:
        router_path = pathlib.Path(f"./services/{rec['names']}/routes.py")
        if router_path.exists():
            app.include_router(router_path)  # Use FastAPI's method to include the route
            print(f"{rec['names']} routed. Check all the route given endpoints.")
        else:
            print(f"Invalid path for action group: {router_path}")
    except Exception as e:
        print(f"Error building route: {str(e)}")
