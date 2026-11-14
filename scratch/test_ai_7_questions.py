import urllib.request
import json
import sys

URL = "http://127.0.0.1:8000/api/assistant/query"

test_questions = [
    {
        "id": "Q1",
        "dataset": "bass_ii",
        "question": "Which BASS-II test has the highest numeric recorded final carbon monoxide concentration? Give the test identifier, as-run number, concentration, unit, fuel material, flow configuration, and correct NASA PDF page and table. Is there a separate over-range CO reading that may exceed this numeric value?"
    },
    {
        "id": "Q2",
        "dataset": "flex_results",
        "question": "What are the recorded outcomes across the locally available FLEX experimental records? Calculate the counts and percentages for Extinction, Disruption, and Completion using the current CSV."
    },
    {
        "id": "Q3",
        "dataset": "flex_results",
        "question": "Why is FLEX Test #114 flagged? Separate the exact recorded source values, the physical concern, and what remains unknown about the cause. Include the date, identifier, fuel, pressure, outcome, and pressure-regression handling."
    },
    {
        "id": "Q4",
        "dataset": "all",
        "question": "Explain the difference between the 290 FLEX planned conditions and the 274 locally available experimental records. The PSI catalog is reported to show 275 entries, while a NASA publication refers to 284 tests. Is this discrepancy resolved by the evidence available in this workspace?"
    },
    {
        "id": "Q5",
        "dataset": "flex_results",
        "question": "How many FLEX records have missing burning-rate constants? List their test numbers and explain how missing values are represented."
    },
    {
        "id": "Q6",
        "dataset": "bass_ii",
        "question": "Using BASS-II records with the required measurements, calculate the Pearson correlation between consumed oxygen, defined as initial O2 minus final O2, and produced CO2, defined as final CO2 minus initial CO2. State the number of complete records, define the variables, explain the sign, and cite the source."
    },
    {
        "id": "Q7",
        "dataset": "bass_ii",
        "question": "What outcomes are recorded for methanol droplet experiments?"
    }
]

results = []

for q in test_questions:
    payload = json.dumps({"question": q["question"], "dataset": q["dataset"]}).encode("utf-8")
    req = urllib.request.Request(URL, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answer = data.get("answer", "")
            mode = data.get("mode", "")
            citations = data.get("citations", [])
            results.append({
                "id": q["id"],
                "dataset": q["dataset"],
                "question": q["question"],
                "mode": mode,
                "citations": citations,
                "answer": answer
            })
            print(f"Processed {q['id']} successfully (Mode: {mode}, Citations: {len(citations)})")
    except Exception as e:
        print(f"Error querying {q['id']}: {e}")

# Save full results for inspection
with open(r"c:\Users\Admin\Desktop\flame-in-freefall\scratch\ai_7_questions_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Successfully saved {len(results)} questions to scratch/ai_7_questions_results.json")
