import os
import requests
from base64 import b64encode

def upload_to_ipfs(content: str) -> str:
    project_id = os.getenv("INFURA_PROJECT_ID")
    project_secret = os.getenv("INFURA_PROJECT_SECRET")
    auth = None
    if project_id and project_secret:
        auth = b64encode(f"{project_id}:{project_secret}".encode()).decode()
    files = {'file': content.encode()}
    headers = {'Authorization': f'Basic {auth}'} if auth else {}
    response = requests.post('https://ipfs.infura.io:5001/api/v0/add', files=files, headers=headers)
    response.raise_for_status()
    return response.json().get('Hash') or response.json().get('IpfsHash') 