import React, { useState } from "react";

export default function FuturePrediction() {
  const [form, setForm] = useState({
    vessel: "",
    risk: "",
    area: "",
    obs1: "",
    obs2: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predict = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel: form.vessel,
          risk: form.risk,
          Area_of_Work: form.area,
          Observation_Related_to_1: form.obs1,
          Observation_Related_to_2: form.obs2,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.log(err);
      alert("Error connecting to prediction model");
    }

    setLoading(false);
  };

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800">
        🔮 AI Future Safety Prediction
      </h1>
      <p className="text-gray-500">
        Provide vessel & observation details to predict future safety risks and recommended actions.
      </p>

      {/* Input Form Container */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-50/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <input
            className="p-3 border rounded-lg"
            name="vessel"
            placeholder="Vessel Name"
            onChange={handleChange}
          />

          <input
            className="p-3 border rounded-lg"
            name="risk"
            placeholder="Risk Level (Low / Medium / High)"
            onChange={handleChange}
          />

          <input
            className="p-3 border rounded-lg"
            name="area"
            placeholder="Area of Work"
            onChange={handleChange}
          />

          <input
            className="p-3 border rounded-lg"
            name="obs1"
            placeholder="Primary Observation"
            onChange={handleChange}
          />

          <input
            className="p-3 border rounded-lg"
            name="obs2"
            placeholder="Secondary Observation"
            onChange={handleChange}
          />

        </div>

        <div className="flex justify-end">
          <button
            onClick={predict}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            {loading ? "Predicting..." : "Run AI Prediction"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Future Incidents Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-50">
            <h3 className="text-xl font-bold text-slate-800">📈 Future Incident Forecast</h3>
            <p className="text-5xl font-extrabold text-blue-700 mt-4">
              {result.future_incidents}
            </p>
            <p className="text-gray-500 mt-2">Expected incidents next cycle</p>
          </div>

          {/* Issue Prediction Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-50">
            <h3 className="text-xl font-bold text-slate-800">⚠ Predicted Issue</h3>
            <p className="text-2xl font-bold text-red-600 mt-4">
              {result.predicted_issue}
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-50">
            <h3 className="text-xl font-bold text-slate-800">🛠 Recommended Actions</h3>
            
            <ul className="list-disc ml-6 text-gray-700 mt-4 space-y-2">
              {result.suggestions.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
