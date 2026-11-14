import json

with open('scratch/ai_7_questions_results.json', encoding='utf-8') as f:
    data = json.load(f)

for q in data[:1]:
    print('==================================================')
    print(f"[{q['id']}] Dataset: {q['dataset']}")
    print(f"Question: {q['question']}")
    print(f"Mode: {q['mode']}")
    print(f"Citations count: {len(q['citations'])}")
    print('ANSWER:\n' + q['answer'])
    print('CITATIONS:')
    for c in q['citations']:
        print(f"  - [{c.get('dataset')}] {c.get('source_file')} | {c.get('page_num')} | {c.get('section')}")
