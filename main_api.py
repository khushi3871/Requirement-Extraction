from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import re
from requirement_extractor import extract_requirements 

app = FastAPI()

# Load artifacts (The Brain)
try:
    model = joblib.load("requirement_model.pkl")
    vectorizer = joblib.load("tfidf_vectorizer.pkl")
except Exception as e:
    print(f"⚠️ Error loading model files: {e}")

# NEW: Professional schema with Project ID
class AnalysisRequest(BaseModel):
    text: str
    project_id: str = "General"  # Manual ID for sorting
    source_type: str = "Email"   # Useful for tracking where it came from

def clean_input(text):
    """Removes email headers and extra whitespace."""
    # Removes lines like 'From:', 'To:', 'Subject:'
    text = re.sub(r'(?m)^(Subject|Date|From|To|Cc|Bcc|X-.*):.*$', '', text)
    return text.strip()

@app.post("/analyze")
async def analyze_text(input_data: AnalysisRequest):
    try:
        # 1. Preprocessing
        raw_text = clean_input(input_data.text)
        
        # 2. Hybrid Extraction (Rules + NER)
        structured_data = extract_requirements(raw_text)
        
        # 3. ML Classification
        vectorized_text = vectorizer.transform([raw_text])
        prediction = model.predict(vectorized_text)[0]
        
        # Cleanup: Make the label a short title
        display_label = prediction if len(prediction.split()) < 6 else " ".join(prediction.split()[:5]) + "..."
        
        # 4. Return response with METADATA
        return {
            "status": "success",
            "metadata": {
                "project_id": input_data.project_id,
                "source": input_data.source_type
            },
            "predicted_category": display_label,
            "analysis_details": structured_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 for local testing.
    uvicorn.run(app, host="127.0.0.1", port=8000)