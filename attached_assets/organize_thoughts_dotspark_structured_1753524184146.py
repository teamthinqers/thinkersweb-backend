import os
import openai
import pinecone
import requests
from datetime import datetime

# === Load Environment Variables ===
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENV"))
index = pinecone.Index("dotspark-vectors")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# === DotSpark System Prompt ===
def get_organize_prompt():
    return """
You are DotSpark — a cognitive assistant designed to help thinkers organize their thoughts clearly.

When a user says “organize my thoughts,” engage them in a reflective conversation and generate structured output in the following format:

DOT:
- summary (max 220 characters)
- context (max 300 characters): what triggered this thought?
- pulse: 1-word emotion (e.g. clarity, fear, hope)

WHEEL:
- heading
- summary (max 300 characters)
- timeline: short-term

CHAKRA:
- heading
- purpose (max 300 characters)
- timeline: long-term

Reference user's previously saved dots/wheels/chakras (provided as context), and suggest if this thought is connected to them.

Respond in this JSON format only:
{
  "dot": {
    "summary": "...",
    "context": "...",
    "pulse": "..."
  },
  "wheel": {
    "heading": "...",
    "summary": "...",
    "timeline": "short-term"
  },
  "chakra": {
    "heading": "...",
    "purpose": "...",
    "timeline": "long-term"
  },
  "suggested_linkages": ["Relates to wheel: 'Revenue Diversification'", "Supports chakra: 'Financial Freedom'"]
}
"""

# === OpenAI Embedding ===
def get_openai_embedding(text):
    response = openai.Embedding.create(
        input=[text],
        model="text-embedding-3-small"
    )
    return response['data'][0]['embedding']

# === Retrieve Existing User Memory from Pinecone ===
def fetch_user_memory(user_id, query_text):
    query_vector = get_openai_embedding(query_text)
    results = index.query(vector=query_vector, top_k=10, include_metadata=True)

    memories = []
    for match in results['matches']:
        meta = match['metadata']
        if meta['user_id'] == user_id:
            memories.append(meta)
    return memories

# === Build Message Context for GPT/DeepSeek ===
def build_conversation_context(user_input, user_id):
    prior_memories = fetch_user_memory(user_id, user_input)

    memory_context = "\n".join([
        f"- Dot: {m.get('summary')} (Wheel: {m.get('wheel_id')}, Chakra: {m.get('chakra')})"
        for m in prior_memories
    ])

    prompt = get_organize_prompt()
    user_thought = f'User just shared: "{user_input}"\n\nPreviously saved thoughts:\n{memory_context}'

    return [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_thought}
    ]

# === DeepSeek Chat Call ===
def call_deepseek(messages):
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": messages
    }

    response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        return f"[DeepSeek ERROR] {response.status_code}: {response.text}"

# === Unified Organizer ===
def organize_thoughts(user_input, user_id, model_type="gpt-4"):
    messages = build_conversation_context(user_input, user_id)

    if model_type == "gpt-4":
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        return response['choices'][0]['message']['content']

    elif model_type == "deepseek":
        return call_deepseek(messages)

    else:
        return "Invalid model_type. Choose 'gpt-4' or 'deepseek'."

# === Example Usage ===
if __name__ == "__main__":
    user_input = "I want to build a new revenue stream outside my job."
    user_id = "user_001"
    model = "gpt-4"  # or "deepseek"
    reply = organize_thoughts(user_input, user_id, model_type=model)
    print("\n--- ORGANIZE MODE STRUCTURED RESPONSE ---\n")
    print(reply)
