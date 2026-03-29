# ReqSphere: AI-Powered Business Requirement Agent

ReqSphere is an intelligent agent designed to extract structured business insights from noisy communication sources like emails and transcripts.

## 🚀 Key Features
- **High Accuracy:** Achieved **97.3% accuracy** using a balanced Logistic Regression model.
- **Hybrid Extraction:** Combines Linguistic Rules (spaCy) with ML classification.
- **Named Entity Recognition (NER):** Automatically extracts specific Stakeholder names and Timelines (dates/days).
- **Industry-Ready API:** Built with FastAPI for seamless integration with any Full-Stack frontend.

## 🛠️ Technical Stack
- **NLP:** spaCy (`en_core_web_sm`)
- **Machine Learning:** Scikit-Learn (TF-IDF Vectorization + Logistic Regression)
- **API Framework:** FastAPI & Uvicorn
- **Data Handling:** Pandas & Joblib

## 📊 Performance
- **Accuracy:** 0.97
- **Macro F1-Score:** 0.95 (Handling imbalanced business classes)

## 🏃 How to Run
1. Install dependencies: `pip install fastapi uvicorn spacy scikit-learn joblib pandas`
2. Download spaCy model: `python -m spacy download en_core_web_sm`
3. Start the API: `python main_api.py`
4. Visit `http://127.0.0.1:8000/docs` to test via Swagger UI.