import pandas as pd
import numpy as np
import pickle
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# Load dataset
df = pd.read_csv("Unsafe-act-and-conditions_data.csv")

df["date"] = pd.to_datetime(df["Date Reported"], dayfirst=True, errors="coerce")
df = df.dropna(subset=["date"])

# 7-day cycle grouping (same as your TS logic)
def group_7day_cycles(dates):
    start_date = dates.min().normalize()
    grouped = {}

    for d in dates:
        diff = (d.normalize() - start_date).days
        cycle = diff // 7
        cycle_start = start_date + timedelta(days=cycle * 7)
        grouped[cycle_start] = grouped.get(cycle_start, 0) + 1

    cycle_dates = sorted(grouped.keys())
    min_d = cycle_dates[0]
    max_d = dates.max().normalize()

    total_weeks = (max_d - min_d).days // 7
    X, y, dates_out = [], [], []

    for i in range(total_weeks + 1):
        d = min_d + timedelta(days=i * 7)
        X.append(i)
        y.append(grouped.get(d, 0))
        dates_out.append(d)

    return np.array(X), np.array(y), dates_out

X, y, cycle_dates = group_7day_cycles(df["date"])

# Train regression model
reg = LinearRegression().fit(X.reshape(-1,1), y)
pickle.dump(reg, open("regression.pkl", "wb"))
pickle.dump(cycle_dates, open("cycle_dates.pkl", "wb"))

# Issue prediction model
features = [
    "Vessel",
    "RiskLevel",
    "Area of Work",
    "Observation Related to (Max. 2 selections) - 1",
    "Observation Related to (Max. 2 selections) - 2"
]
target = "Mapped Issue"

df_clf = df[features + [target]].dropna()

enc = {}
Xc = pd.DataFrame()

for col in features:
    le = LabelEncoder()
    df_clf[col] = le.fit_transform(df_clf[col])
    enc[col] = le
    Xc[col] = df_clf[col]

le_target = LabelEncoder()
y_c = le_target.fit_transform(df_clf[target])
enc[target] = le_target

clf = RandomForestClassifier(n_estimators=200)
clf.fit(Xc, y_c)

pickle.dump(clf, open("issue_model.pkl", "wb"))
pickle.dump(enc, open("encoders.pkl", "wb"))
# Save global weekly LR model
pickle.dump(reg, open("global_lr.pkl", "wb"))

print("Training complete. Models saved.")
