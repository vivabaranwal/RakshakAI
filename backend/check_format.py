import fitz

doc = fitz.open()
page = doc.new_page()

print("AVAILABLE GET_TEXT FORMATS:")
try:
    formats = getattr(fitz.utils, 'formats', None)
    print("utils.formats:", formats)
except Exception as e:
    print(e)
    
print("Testing various formats manually...")
for fmt in ["text", "blocks", "words", "html", "dict", "rawdict", "json", "xml"]:
    try:
        res = page.get_text(fmt)
        print(f"Format '{fmt}' SUCCESS")
    except Exception as e:
        print(f"Format '{fmt}' FAILED: {e}")
