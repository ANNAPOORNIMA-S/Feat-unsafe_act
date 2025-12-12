from fastapi import FastAPI
import pickle
import numpy as np

# Load trained models
reg = pickle.load(open("regression.pkl", "rb"))
cycle_dates = pickle.load(open("cycle_dates.pkl", "rb"))
clf = pickle.load(open("issue_model.pkl", "rb"))
enc = pickle.load(open("encoders.pkl", "rb"))

# Create API instance
app = FastAPI()

@app.get("/")
def root():
    return {"message": "ML Prediction API is running!"}

@app.post("/predict")
def predict(data: dict):
    vessel = data.get("vessel")
    risk = data.get("risk")
    area = data.get("Area_of_Work")
    obs1 = data.get("Observation_Related_to_1")
    obs2 = data.get("Observation_Related_to_2")

    # === FUTURE INCIDENT PREDICTION ===
    next_index = len(cycle_dates)
    future_incidents = max(0, round(reg.predict([[next_index]])[0]))

    # === ISSUE PREDICTION ===
    feature_values = [
        vessel,
        risk,
        area,
        obs1,
        obs2
    ]

    encoded_row = []
    for i, col in enumerate([
        "Vessel",
        "RiskLevel",
        "Area of Work",
        "Observation Related to (Max. 2 selections) - 1",
        "Observation Related to (Max. 2 selections) - 2"
    ]):
        val = feature_values[i]

        # Handle unseen labels
        if val not in enc[col].classes_:
            val = enc[col].classes_[0]

        encoded_row.append(enc[col].transform([val])[0])

    issue_idx = clf.predict([encoded_row])[0]
    predicted_issue = enc["Mapped Issue"].inverse_transform([issue_idx])[0]

    # === SUGGESTIONS ===
    suggestions_map = {
        "PPE Not Used": [
            "Ensure workers wear required PPE.",
            "Conduct toolbox meeting on PPE importance.",
            "Increase PPE supervision in high-risk areas."
        ],
        "Poor Housekeeping": [
            "Assign staff for periodic worksite cleaning.",
            "Remove tripping hazards and clutter.",
            "Improve housekeeping monitoring checklist."
        ],
        "Other": [
            "Review operating procedures.",
            "Conduct refresher training for staff."
        ]
    }

    suggestions = suggestions_map.get(predicted_issue, suggestions_map["Other"])

    return {
        "future_incidents": future_incidents,
        "predicted_issue": predicted_issue,
        "suggestions": suggestions
    }
