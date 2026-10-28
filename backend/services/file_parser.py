import io
from pathlib import Path
from pypdf import PdfReader
from docx import Document

def parse_file(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from uploaded PDF, DOCX, or TXT file."""
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages).strip()

    elif ext in (".docx", ".doc"):
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs).strip()

    elif ext in (".txt", ".md", ".json"):
        return file_bytes.decode("utf-8", errors="replace").strip()

    else:
        raise ValueError(f"Unsupported file type: {ext}. Please upload a PDF, Word DOCX, or Text file.")
