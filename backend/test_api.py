import requests
import sys

url = "http://localhost:8003/api/v1/upload"
pdf_path = "test_dummy.pdf"

try:
    with open(pdf_path, 'rb') as f:
        files = {'file': ('test_dummy.pdf', f, 'application/pdf')}
        response = requests.post(url, files=files)
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
except Exception as e:
    print("ERROR:", e)
