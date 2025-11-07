from fastapi import APIRouter, UploadFile, File
import spacy
import PyPDF2
import docx2txt
import re
import json
from .supabase_config import save_resume   # ✅ Supabase saving
from datetime import datetime

# Use APIRouter instead of creating a new FastAPI() instance
router = APIRouter(prefix="/api/resume", tags=["Resume Parser"])

# ✅ Load SpaCy NLP model once at startup
nlp = spacy.load("en_core_web_sm")

# Example skill keywords
SKILL_KEYWORDS = [
    "python", "java", "sql", "machine learning", "deep learning",
    "nlp", "excel", "aws", "tensorflow", "keras", "pandas", "numpy"
]

# Regex patterns for section headers
SECTION_PATTERNS = {
    "experience": re.compile(r"(experience|work history|professional experience)", re.I),
    "education": re.compile(r"(education|academic background|qualifications)", re.I),
    "projects": re.compile(r"(projects|research experience|portfolio)", re.I),
    "skills": re.compile(r"(skills|technical skills|expertise)", re.I),
}


# ------------------------------------------------------
# 📄 Helper Functions
# ------------------------------------------------------
def extract_text(file: UploadFile):
    """Extract raw text from uploaded resume (PDF/DOCX)."""
    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(file.file)
        text = " ".join([page.extract_text() or "" for page in reader.pages])
    elif file.filename.endswith(".docx"):
        text = docx2txt.process(file.file)
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or DOCX file.")
    return text


def extract_skills(text: str):
    """Extract skills by matching keywords."""
    text_lower = text.lower()
    return list({skill for skill in SKILL_KEYWORDS if skill in text_lower})


def extract_sections(text: str):
    """Divide resume text into structured sections."""
    sections = {key: [] for key in SECTION_PATTERNS.keys()}
    lines = text.split("\n")
    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        for section, pattern in SECTION_PATTERNS.items():
            if pattern.search(line):
                current_section = section
                break

        if current_section:
            sections[current_section].append(line)

    return {sec: " ".join(content) for sec, content in sections.items()}


# ------------------------------------------------------
# 🚀 Resume Upload Endpoint
# ------------------------------------------------------
@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and analyze resume, then save to Supabase."""
    try:
        text = extract_text(file)
        skills = extract_skills(text)
        sections = extract_sections(text)

        parsed_resume = {
            "filename": file.filename,
            "skills": skills,
            "sections": sections,
            "raw_text": text[:500],  # short preview for debugging
            "uploaded_at": datetime.utcnow().isoformat(),
        }

        # ✅ Save parsed resume locally (for debugging)
        with open("backend/parsed_resume.json", "w", encoding="utf-8") as f:
            json.dump(parsed_resume, f, indent=4, ensure_ascii=False)

        # ✅ Save to Supabase (optional)
        user_name = file.filename.split(".")[0].replace("_", " ").title()
        save_resume(user_name, parsed_resume)

        print(f"✅ Resume uploaded and parsed for {user_name}")
        return {
            "status": "success",
            "message": "Resume parsed and saved to Supabase successfully.",
            "data": parsed_resume,
        }

    except Exception as e:
        print(f"❌ Resume parsing error: {e}")
        return {"status": "error", "message": str(e)}


# ------------------------------------------------------
# 🏠 Health Check
# ------------------------------------------------------
@router.get("/")
async def resume_root():
    return {"message": "📄 Resume Parser API is running successfully!"}
