import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Load data
data = pd.read_csv("clean_dataset.csv")

# Ensure we have a diverse sample
data = data.sample(6000, random_state=42)

# IMPROVEMENT 1: Added stop_words and ngram_range (1, 2) 
# This helps the model understand "must have" or "login feature" as units.
vectorizer = TfidfVectorizer(max_features=2000, stop_words='english', ngram_range=(1, 2))

X = vectorizer.fit_transform(data['text'].astype(str))
y = data['summary']

# IMPROVEMENT 2: Added class_weight='balanced'
# This is the "magic fix" for your low Macro F1-score. 
# It forces the model to treat rare classes with higher importance.
model = LogisticRegression(max_iter=500, class_weight='balanced', solver='lbfgs')

model.fit(X, y)

# Save artifacts
joblib.dump(model, "requirement_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("✅ Model trained with class balancing and saved successfully.")