import pandas as pd
import joblib
from sklearn.metrics import classification_report
from requirement_extractor import extract_requirements
import warnings
warnings.filterwarnings('ignore')

# ---------- Load Model & Vectorizer ----------
model = joblib.load("requirement_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

# ---------- Example Text for Single Prediction ----------
sample_text = """
Subject: quick notes from today's discussion

Hi team,

Just writing down a few things before I forget.

For the login feature users should login using email and password instead of username because many customers said they forget usernames.

Also security is important here so the system must be secure and protect user data.

Product manager already approved this change so we can move forward.

Let's try to complete this module in the next sprint since release planning is close.

Also this feature is high priority for the upcoming release so please focus on this first.

Thanks
"""

# Transform and predict
X_sample = vectorizer.transform([sample_text])
prediction = model.predict(X_sample)
print("Model Prediction for Sample Text:")
print(prediction)

# Extract structured requirements
requirements = extract_requirements(sample_text)
print("\nExtracted Requirements:")
for key, value in requirements.items():
    print(key, ":", value)

# ---------- Optional: Evaluate on Dataset ----------
# If you want to see accuracy / summary metrics on your full dataset
try:
    data = pd.read_csv("clean_dataset.csv").sample(6000, random_state=42)
    X = vectorizer.transform(data['text'])
    y = data['summary']
    
    y_pred = model.predict(X)
    report_dict = classification_report(y, y_pred, output_dict=True)
    
    print("\n--- Evaluation on Dataset ---")
    print("Accuracy:", report_dict['accuracy'])
    print("Macro Average - Precision:", report_dict['macro avg']['precision'],
          "Recall:", report_dict['macro avg']['recall'],
          "F1-score:", report_dict['macro avg']['f1-score'])
    print("Weighted Average - Precision:", report_dict['weighted avg']['precision'],
          "Recall:", report_dict['weighted avg']['recall'],
          "F1-score:", report_dict['weighted avg']['f1-score'])
except FileNotFoundError:
    print("\nDataset file not found. Skipping evaluation.")