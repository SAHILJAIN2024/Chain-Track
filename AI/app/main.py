from fastapi import FastAPI, UploadFile, File
from app.ocr import extract_text
from app.parser import parse_invoice

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Invoice AI API Running 🚀"}


@app.post("/process-invoice/")
async def process_invoice(file: UploadFile = File(...)):
    contents = await file.read()

    text = extract_text(contents)
    structured = parse_invoice(text)

    return {
        "raw_text": text,
        "structured_data": structured
    }