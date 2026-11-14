import urllib.request
import json
import sys

def ask(q):
    data = json.dumps({'question': q}).encode('utf-8')
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/assistant/query',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

print("=== TEST 1: Supported BASS-II Question ===")
q1 = ask("What was the purpose of the BASS-II investigation and what fuels were tested?")
print("Mode:", q1.get("mode"))
print("Model Name:", q1.get("model_name"))
print("Has Evidence:", q1.get("has_evidence"))
print("Citations Count:", len(q1.get("citations", [])))
for i, c in enumerate(q1.get("citations", [])):
    print(f"  [{i+1}] {c.get('source_title')} (Page {c.get('page_num')}, Score: {c.get('score')})")
print("Answer Preview:\n", q1.get("answer", "")[:300].replace('\n', ' '))

print("\n=== TEST 2: Existing Dataset Field Inquiry ===")
q2 = ask("What were the flow configurations and oxygen limits tested?")
print("Mode:", q2.get("mode"))
print("Model Name:", q2.get("model_name"))
print("Citations Count:", len(q2.get("citations", [])))
print("Answer Preview:\n", q2.get("answer", "")[:300].replace('\n', ' '))

print("\n=== TEST 3: Unsupported Off-Topic Inquiry (Penguins) ===")
q3 = ask("What is the breeding cycle of emperor penguins in Antarctica?")
print("Mode:", q3.get("mode"))
print("Has Evidence:", q3.get("has_evidence"))
print("Citations Count:", len(q3.get("citations", [])))
print("Answer:\n", q3.get("answer", "").strip())
