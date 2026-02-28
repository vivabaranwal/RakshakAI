import fitz
print("FITZ VERSION:", fitz.__version__)
doc = fitz.open()
page = doc.new_page()
try:
    d = page.get_text("dict")
    print("DICT WORKED")
except Exception as e:
    print("DICT FAILED:", e)

try:
    d = page.get_text("xml")
    print("XML WORKED")
except Exception as e:
    print("XML FAILED:", e)
