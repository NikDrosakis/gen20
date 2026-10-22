from fastapi import APIRouter, HTTPException, Query,  File, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
import requests
import os
from urllib.parse import urlparse
import zipfile
import io
import shutil
from pathlib import Path
from typing import Optional, List
import tarfile
import gzip
import shutil
from bs4 import BeautifulSoup  # pip install beautifulsoup4
import re

router = APIRouter()

UPLOAD_DIR = "/var/www/gs/kronos/data/injected"

class InjectRequest(BaseModel):
    url: str
    domain: str
    type: str


def is_safe_url(url: str) -> bool:
    parsed = urlparse(url)

    # only http/https
    if parsed.scheme not in ("http", "https"):
        return False

    # block localhost + internal ranges
    blocked_hosts = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0"
    ]

    if parsed.hostname in blocked_hosts:
        return False

    return True


@router.post("/injection-bulk")
async def inject_bulk(
    file: UploadFile = File(...),
    domain: str = "",
    extract: bool = True
):
    """Upload ZIP/GZ/TAR file and extract all contents"""

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    domain_path = os.path.join(UPLOAD_DIR, domain)
    os.makedirs(domain_path, exist_ok=True)

    temp_path = os.path.join(domain_path, file.filename)

    # Save uploaded file
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    extracted_files = []

    if not extract:
        return {
            "status": "ok",
            "saved_to": temp_path,
            "size": len(content)
        }

    # Extract based on file extension
    if file.filename.endswith('.zip'):
        with zipfile.ZipFile(temp_path, 'r') as zip_ref:
            zip_ref.extractall(domain_path)
            extracted_files = zip_ref.namelist()
        os.remove(temp_path)

    elif file.filename.endswith('.tar.gz') or file.filename.endswith('.tgz'):
        with tarfile.open(temp_path, 'r:gz') as tar_ref:
            tar_ref.extractall(domain_path)
            extracted_files = tar_ref.getnames()
        os.remove(temp_path)

    elif file.filename.endswith('.gz'):
        # Single gz file
        output_path = temp_path.replace('.gz', '')
        with gzip.open(temp_path, 'rb') as f_in:
            with open(output_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        extracted_files = [os.path.basename(output_path)]
        os.remove(temp_path)

    return {
        "status": "ok",
        "extracted_files": extracted_files,
        "count": len(extracted_files),
        "domain": domain
    }

@router.post("/injection")
def inject_url(req: InjectRequest):

    if not is_safe_url(req.url):
        raise HTTPException(status_code=400, detail="Unsafe URL blocked")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    domain_path = os.path.join(UPLOAD_DIR, req.domain)
    os.makedirs(domain_path, exist_ok=True)

    # Check if URL is a directory (ends with /)
    if req.url.endswith('/') or req.type == 'folder':
        return download_folder(req.url, domain_path, req.type)

    # Check if it's a compressed file
    if req.type.endswith('.zip') or req.type.endswith('.tar.gz') or req.type.endswith('.tgz'):
        return download_and_extract(req.url, domain_path, req.type)

    # Single file download
    try:
        r = requests.get(req.url, timeout=30)
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    file_path = os.path.join(domain_path, req.type)
    with open(file_path, "wb") as f:
        f.write(r.content)

    return {
        "status": "ok",
        "saved_to": file_path,
        "size": len(r.content)
    }


def download_folder(url: str, domain_path: str, folder_name: str):
    """Download all files from a directory listing (Apache/Nginx style)"""

    try:
        # Βεβαιώσου ότι το URL τελειώνει σε /
        if not url.endswith('/'):
            url += '/'

        # Try to get directory listing
        r = requests.get(url, timeout=30)
        r.raise_for_status()

        soup = BeautifulSoup(r.text, 'html.parser')
        downloaded_files = []

        # Find all links in directory listing
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and not href.startswith('?') and href not in ['/', '../', '..']:
                # Skip parent directory links
                if href == '../' or href == '/':
                    continue

                # ΣΩΣΤΟ: Δημιουργία του πλήρους URL
                if href.startswith('http'):
                    file_url = href
                elif href.startswith('/'):
                    # Absolute path - need to extract base
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    file_url = f"{parsed.scheme}://{parsed.netloc}{href}"
                else:
                    # Relative path
                    file_url = url + href

                # Check if it's a subdirectory
                if href.endswith('/'):
                    # Recursively download subfolder
                    sub_folder_path = os.path.join(domain_path, href.rstrip('/'))
                    os.makedirs(sub_folder_path, exist_ok=True)
                    sub_results = download_folder(file_url, sub_folder_path, href)
                    downloaded_files.extend(sub_results)
                else:
                    # Download file
                    try:
                        file_response = requests.get(file_url, timeout=30)
                        file_response.raise_for_status()

                        file_path = os.path.join(domain_path, href)
                        with open(file_path, "wb") as f:
                            f.write(file_response.content)

                        downloaded_files.append({
                            "file": href,
                            "size": len(file_response.content),
                            "url": file_url
                        })
                    except Exception as e:
                        downloaded_files.append({
                            "file": href,
                            "error": str(e)
                        })

        return {
            "status": "ok",
            "type": "folder",
            "source_url": url,
            "downloaded_files": downloaded_files,
            "count": len([f for f in downloaded_files if 'error' not in f])
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download folder: {str(e)}")


def download_and_extract(url: str, domain_path: str, filename: str):
    """Download and extract ZIP/TAR.GZ file"""

    temp_path = os.path.join(domain_path, filename)

    try:
        r = requests.get(url, timeout=60)
        r.raise_for_status()

        with open(temp_path, "wb") as f:
            f.write(r.content)

        extracted_files = []

        if filename.endswith('.zip'):
            with zipfile.ZipFile(temp_path, 'r') as zip_ref:
                zip_ref.extractall(domain_path)
                extracted_files = zip_ref.namelist()
            os.remove(temp_path)

        elif filename.endswith('.tar.gz') or filename.endswith('.tgz'):
            with tarfile.open(temp_path, 'r:gz') as tar_ref:
                tar_ref.extractall(domain_path)
                extracted_files = tar_ref.getnames()
            os.remove(temp_path)

        return {
            "status": "ok",
            "type": "archive",
            "domain": os.path.basename(domain_path),
            "extracted_files": extracted_files,
            "count": len(extracted_files)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract: {str(e)}")

@router.get("/list-files")
def list_files(domain: Optional[str] = Query(None)):
    """Λίστα με όλα τα αρχεία ή αρχεία συγκεκριμένου domain"""

    if domain:
        target_dir = os.path.join(UPLOAD_DIR, domain)
        if not os.path.exists(target_dir):
            raise HTTPException(status_code=404, detail=f"Domain {domain} not found")
    else:
        target_dir = UPLOAD_DIR

    files = []
    for root, dirs, filenames in os.walk(target_dir):
        for filename in filenames:
            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, UPLOAD_DIR)
            files.append({
                "name": filename,
                "path": rel_path,
                "domain": os.path.basename(root),
                "size": os.path.getsize(full_path),
                "modified": os.path.getmtime(full_path)
            })

    return {"files": files, "total": len(files)}


@router.get("/download-all")
def download_all_files(domain: Optional[str] = Query(None)):
    """Κατέβασμα όλων των αρχείων ως ZIP"""

    if domain:
        target_dir = os.path.join(UPLOAD_DIR, domain)
        if not os.path.exists(target_dir):
            raise HTTPException(status_code=404, detail=f"Domain {domain} not found")
        zip_name = f"injected_files_{domain}.zip"
    else:
        target_dir = UPLOAD_DIR
        zip_name = "injected_files_all.zip"

    # Δημιουργία ZIP in memory
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Διατηρούμε τη δομή των φακέλων
                arcname = os.path.relpath(file_path, UPLOAD_DIR)
                zip_file.write(file_path, arcname)

    zip_buffer.seek(0)

    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={zip_name}"
        }
    )


@router.get("/download-file")
def download_file(file_path: str = Query(...)):
    """Κατέβασμα ενός συγκεκριμένου αρχείου"""

    # Ασφάλεια: αποτρέπουμε path traversal
    safe_path = os.path.normpath(os.path.join(UPLOAD_DIR, file_path))
    if not safe_path.startswith(UPLOAD_DIR):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if not os.path.exists(safe_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=safe_path,
        filename=os.path.basename(safe_path),
        media_type="application/octet-stream"
    )


@router.delete("/delete-all")
def delete_all_files(domain: Optional[str] = Query(None)):
    """Διαγραφή όλων των αρχείων"""

    if domain:
        target_dir = os.path.join(UPLOAD_DIR, domain)
        if not os.path.exists(target_dir):
            raise HTTPException(status_code=404, detail=f"Domain {domain} not found")
        shutil.rmtree(target_dir)
        os.makedirs(target_dir, exist_ok=True)  # Δημιουργία ξανά άδειου φακέλου
        return {"status": "ok", "message": f"All files deleted from {domain}"}
    else:
        # Διαγραφή όλων
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            else:
                shutil.rmtree(item_path)
        return {"status": "ok", "message": "All files deleted"}


@router.delete("/delete-file")
def delete_file(file_path: str = Query(...)):
    """Διαγραφή ενός συγκεκριμένου αρχείου"""

    # Ασφάλεια: αποτρέπουμε path traversal
    safe_path = os.path.normpath(os.path.join(UPLOAD_DIR, file_path))
    if not safe_path.startswith(UPLOAD_DIR):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if not os.path.exists(safe_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(safe_path)
    return {"status": "ok", "message": f"File {file_path} deleted"}