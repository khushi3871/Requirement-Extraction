import spacy
import re

# Load spacy model
nlp = spacy.load("en_core_web_sm")

def extract_requirements(text):
    result = {
        "Functional Requirements": [],
        "Non Functional Requirements": [],
        "Stakeholders": [],
        "Decisions": [],
        "Timelines": [],
        "Feature Priority": []
    }

    stakeholder_roles = [
        "product manager", "project manager", "manager", "user", 
        "customer", "admin", "developer", "client", "team", 
        "qa lead", "scrum master"
    ]

    priority_words = ["urgent", "high priority", "critical", "important", "asap"]
    timeline_words = ["week", "month", "sprint", "deadline", "tomorrow", "upcoming release"]

    # IMPROVEMENT 3: Use spaCy for intelligent sentence splitting
    # This prevents cutting requirements in half at the wrong place.
    doc_full = nlp(text)

    for sent in doc_full.sents:
        s = sent.text.strip()
        if not s:
            continue

        lower_s = s.lower()
        
        # -------- Functional Requirements --------
        # Check for Modal Verbs (MD) like "shall", "must", "should"
        has_modal = any(token.tag_ == "MD" for token in sent)
        if has_modal:
            # Exclude if it sounds like a Non-Functional req
            if not any(word in lower_s for word in ["secure", "performance", "scalable", "protect"]):
                result["Functional Requirements"].append(s)

        # -------- Non Functional Requirements --------
        if any(word in lower_s for word in ["performance", "secure", "scalable", "encryption", "speed"]):
            result["Non Functional Requirements"].append(s)

        # -------- Stakeholder Roles Only --------
        for role in stakeholder_roles:
            if role in lower_s:
                role_name = role.title()
                # Deduplication logic
                if role_name == "Manager" and "Product Manager" in result["Stakeholders"]:
                    continue
                if role_name not in result["Stakeholders"]:
                    result["Stakeholders"].append(role_name)

        # -------- Decisions --------
        if any(word in lower_s for word in ["approved", "decided", "confirmed", "agreed"]):
            result["Decisions"].append(s)

        # -------- Timeline --------
        if any(word in lower_s for word in timeline_words):
            result["Timelines"].append(s)

        # -------- Feature Priority --------
        if any(word in lower_s for word in priority_words):
            result["Feature Priority"].append(s)

    return result