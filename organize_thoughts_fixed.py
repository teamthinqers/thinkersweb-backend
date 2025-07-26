import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

# === Configuration ===
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone with modern API
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "dotspark-vectors"

try:
    index = pc.Index(index_name)
    print(f"Connected to index: {index_name}")
except Exception as e:
    print(f"Pinecone connection error: {e}")
    index = None

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# === DotSpark System Prompt ===
def get_organize_prompt():
    return """
You are DotSpark — a cognitive assistant designed to help thinkers organize their thoughts clearly.

When a user says "organize my thoughts," engage them in a reflective conversation and generate structured output in the following format:

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
    try:
        response = openai_client.embeddings.create(
            input=[text],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

# === Retrieve Existing User Memory from Pinecone ===
def fetch_user_memory(user_id, query_text):
    if not index:
        print("Pinecone index not available")
        return []
        
    query_vector = get_openai_embedding(query_text)
    if not query_vector:
        return []
        
    try:
        results = index.query(vector=query_vector, top_k=10, include_metadata=True)

        memories = []
        for match in results.get('matches', []):
            meta = match.get('metadata', {})
            if str(meta.get('user_id')) == str(user_id):
                memories.append(meta)
        return memories
    except Exception as e:
        print(f"Memory fetch error: {e}")
        return []

# === Build Message Context for GPT/DeepSeek ===
def build_conversation_context(user_input, user_id):
    prior_memories = fetch_user_memory(user_id, user_input)

    memory_context = "\n".join([
        f"- Dot: {m.get('summary')} (Wheel: {m.get('wheel_id')}, Chakra: {m.get('chakra')})"
        for m in prior_memories
    ]) if prior_memories else "No previous thoughts found."

    prompt = get_organize_prompt()
    user_thought = f'User just shared: "{user_input}"\n\nPreviously saved thoughts:\n{memory_context}'

    return [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_thought}
    ]

# === DeepSeek Chat Call ===
def call_deepseek(messages):
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API key not configured"
        
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": messages
    }

    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            return f"[DeepSeek ERROR] {response.status_code}: {response.text}"
    except Exception as e:
        return f"DeepSeek connection error: {e}"

# === Unified Organizer ===
def organize_thoughts(user_input, user_id, model_type="gpt-4"):
    messages = build_conversation_context(user_input, user_id)

    if model_type == "gpt-4":
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"OpenAI API Error: {e}"

    elif model_type == "deepseek":
        return call_deepseek(messages)

    else:
        return "Invalid model_type. Choose 'gpt-4' or 'deepseek'."

# === Parse and Validate JSON Response ===
def parse_organized_response(response_text):
    try:
        # Try to extract JSON from response
        if '{' in response_text and '}' in response_text:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            json_text = response_text[start:end]
            parsed = json.loads(json_text)
            return parsed
        else:
            return {"error": "No valid JSON found in response", "raw_response": response_text}
    except json.JSONDecodeError as e:
        return {"error": f"JSON parsing failed: {e}", "raw_response": response_text}

# === Example Usage ===
if __name__ == "__main__":
    print("=== DotSpark Thought Organization Test ===")
    
    user_input = "I want to build a new revenue stream outside my job."
    user_id = "user_001"
    model = "gpt-4"  # or "deepseek"
    
    print(f"User Input: {user_input}")
    print(f"Model: {model}")
    print(f"User ID: {user_id}")
    
    print("\n--- PROCESSING ---")
    reply = organize_thoughts(user_input, user_id, model_type=model)
    
    print("\n--- RAW RESPONSE ---")
    print(reply)
    
    print("\n--- PARSED STRUCTURE ---")
    structured = parse_organized_response(reply)
    
    if "error" not in structured:
        print("✅ Successfully parsed structured response:")
        print(f"DOT: {structured.get('dot', {})}")
        print(f"WHEEL: {structured.get('wheel', {})}")
        print(f"CHAKRA: {structured.get('chakra', {})}")
        print(f"LINKAGES: {structured.get('suggested_linkages', [])}")
    else:
        print("❌ Parsing failed:")
        print(structured)