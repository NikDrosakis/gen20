from fastapi import FastAPI, Body, Request, HTTPException, APIRouter,Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Union

router = APIRouter()

class QueryRequest(BaseModel):
    querystring: str
    fun: str = "fa"
    database: str = "vivalibro" # Add a field to specify the database
    params: Optional[Union[tuple, list]] = None


@router.get("/")
def read_root():
    return {"message": "Welcome to the Gaia API"}

@router.post("/maria")
async def some_endpoint(request: Request,query_data: QueryRequest):
    if query_data.database == "vivalibro":
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