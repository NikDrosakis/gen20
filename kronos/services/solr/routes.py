from fastapi import Query, Request, APIRouter, HTTPException, BackgroundTasks
from pysolr import SolrError
from typing import Optional

router = APIRouter()

@router.get('/')
def read_root():
    return {'message': 'Welcome to solr'}

@router.get('/search')
async def search_books(request: Request, q: str = Query(..., description="Search query"),
                     limit: int = Query(10, description="Number of results to return"),
                     offset: int = Query(0, description="Offset for pagination")):

    try:
        solr = request.app.state.solr  # Get the Solr connection from app state
        results = solr.search(q, **{
            'start': offset,
            'rows': limit,
        })

        return {
            "status": 200,
            "query": q,
            "numFound": results.hits,
            "results": results.docs
        }

    except SolrError as e:
        raise HTTPException(status_code=500, detail=f"Error searching Solr: {str(e)}")

@router.post('/import_books')
async def import_books_to_solr(background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(run_solr_import)
        return {"status": 200, "message": "Book import process initiated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating import: {str(e)}")

# Helper function to run the import script
def run_solr_import():
    import subprocess
    subprocess.run(['python', 'import_books.py'], check=True)