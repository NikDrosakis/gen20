from fastapi import FastAPI, Body, Request, HTTPException, APIRouter,Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Union
import subprocess
import json
import re

router = APIRouter()

class QueryRequest(BaseModel):
    querystring: str
    fun: str = "fa"
    database: str = "gen_admin" # Add a field to specify the database
    params: Optional[Union[tuple, list]] = None


@router.get("/")
def read_root():
    return {"message": "Welcome to the Gaia API"}

def parse_certbot_output():
    result = subprocess.run(["certbot", "certificates"], capture_output=True, text=True)
    output = result.stdout

    certs = []
    cert_pattern = re.compile(r"Certificate Name:\s+(?P<name>[\S]+).*?"
                              r"Serial Number:\s+(?P<serial>[\S]+).*?"
                              r"Key Type:\s+(?P<key_type>[\S]+).*?"
                              r"Domains:\s+(?P<domains>[\S\s]+?)\n.*?"
                              r"Expiry Date:\s+(?P<expiry_date>[\S\s]+?)\s+\(.*?\).*?"
                              r"Certificate Path:\s+(?P<cert_path>[\S]+).*?"
                              r"Private Key Path:\s+(?P<key_path>[\S]+)",
                              re.DOTALL)

    for match in cert_pattern.finditer(output):
        certs.append({
            "name": match.group("name"),
            "serial": match.group("serial"),
            "key_type": match.group("key_type"),
            "domains": match.group("domains").split(),
            "expiry_date": match.group("expiry_date").strip(),
            "cert_path": match.group("cert_path"),
            "key_path": match.group("key_path"),
        })

    return certs

@router.get("/certificates")
def get_certificates():
    return {"certificates": parse_certbot_output()}

@router.post("/maria")
async def some_endpoint(request: Request,query_data: QueryRequest):
    if query_data.database == "gen_vivalibrocom":
        db = request.app.state.maria_vivalibro
    else:
        db = request.app.state.maria_admin
    querystring = query_data.querystring
    fun = query_data.fun
    params = query_data.params
    if params is None:
        params = ()
    elif not isinstance(params, tuple):
        params = tuple(params)
    db_method = getattr(db, fun, None)
    try:
        result = db_method(querystring, params)
        if result:
            return {
            "success":True,
                "status": 200,  # Add success status
                "message": "Success",  # Add a success message
                "data": result
            }
        else:
            return {
                "success":False,
                "status": 404, # Not Found status if no results
                "message": "No records found."
            }
    except Exception as e:
        return {
            "success":False,
            "status": 500,  # Internal Server Error status
            "message": f"Database error: {str(e)}"  # Include error details (carefully)
        }