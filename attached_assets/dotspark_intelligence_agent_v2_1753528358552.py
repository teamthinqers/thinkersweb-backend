
import os
import openai
import pinecone
import requests
from typing import Dict, Any

# Setup environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV", "gcp-starter")
PINECONE_INDEX = "dotspark-vectors"

# Model selection
MODEL = os.getenv("MODEL", "gpt-4")  # Options: 'gpt-4' or 'deepseek-chat'

# Init clients
openai.api_key = OPENAI_API_KEY
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
index = pinecone.Index(PINECONE_INDEX)

def fetch_user_context(user_id: str, top_k: int = 3):
    try:
        results = index.query(
            namespace=user_id,
            vector=[0.0] * 1536,  # Dummy vector
            top_k=top_k,
            include_metadata=True
        )
        return [match["metadata"] for match in results["matches"]]
    except Exception as e:
        print("Pinecone fetch failed:", e)
        return []

def build_dynamic_prompt(user_input: str, past_context: list) -> str:
    context_str = "\n".join(
        [f"• Dot: {c.get('summary', '')}" for c in past_context]
    )

    prompt = f"""
You are DotSpark, a thought evolution assistant. Your role is not to summarize, but to help users explore and deepen their thoughts.

Analyze the user's input and decide:
- If it's a quick insight, return only a Dot.
- If it suggests a short-term goal or initiative, add a Wheel.
- If the user reflects on long-term purpose or life direction, include a Chakra.
- If the thought is vague or too early, just respond naturally and ask a question to explore further.
- Refer back to previous Dots, Wheels, or Chakras if they relate.
- Never generate all three layers unless the conversation clearly calls for it.

Output structure (only if applicable):

{{
  "dot": {{
    "summary": "...",     # Max 220 chars
    "context": "...",     # Max 300 chars
    "pulse": "..."        # one-word emotion
  }},
  "wheel": {{
    "heading": "...",
    "summary": "...",     # Max 300 chars
    "timeline": "short-term"
  }},
  "chakra": {{
    "heading": "...",
    "purpose": "...",     # Max 300 chars
    "timeline": "long-term"
  }},
  "linkages": ["..."]     # Optional: how current thoughts connect to older ones
}}

User input: "{user_input}"

Previous context:
{context_str}

Now respond like a reflective partner helping them think better. Suggest or format only what's natural.
"""
    return prompt.strip()

def call_model(messages: list) -> str:
    if MODEL == "gpt-4":
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7
        )
        return response['choices'][0]['message']['content']

    elif MODEL == "deepseek-chat":
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        body = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": 0.7
        }
        res = requests.post("https://api.deepseek.com/v1/chat/completions", json=body, headers=headers)
        return res.json()['choices'][0]['message']['content']

    return "Invalid model selected."

def run_dotspark_thought_partner(user_id: str, user_input: str) -> Dict[str, Any]:
    context = fetch_user_context(user_id)
    prompt = build_dynamic_prompt(user_input, context)

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_input}
    ]

    result = call_model(messages)
    return {
        "user_input": user_input,
        "structured_response": result
    }

# Example test
if __name__ == "__main__":
    user_id = "user-123"
    input_text = "I've been thinking about switching careers to something more creative."
    response = run_dotspark_thought_partner(user_id, input_text)
    print("\n=== Thought Evolution Response ===")
    print(response["structured_response"])
