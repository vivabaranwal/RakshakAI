import requests
from reportlab.pdfgen import canvas

# Generate a dummy pdf
pdf_path = "test_dummy.pdf"
c = canvas.Canvas(pdf_path)
c.drawString(100, 750, "This is a dummy contract with termination and liability clauses.")
c.save()


url = "http://localhost:8000/api/v1/upload"
files = {'file': ('test_dummy.pdf', open(pdf_path, 'rb'), 'application/pdf')}

try:
    response = requests.post(url, files=files)
    print("STATUS:", response.status_code)
    print("TEXT:", response.text)
except Exception as e:
    print("ERROR:", e)
