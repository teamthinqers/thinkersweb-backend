
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

# Choose your preferred model
MODEL = os.getenv("MODEL", "gpt-4")  # or 'deepseek-chat'

# Initialize clients
openai.api_key = OPENAI_API_KEY
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
index = pinecone.Index(PINECONE_INDEX)

def fetch_user_context(user_id: str, top_k: int = 3):
    try:
        results = index.query(
            namespace=user_id,
            vector=[0.0] * 1536,  # Dummy zero vector
            top_k=top_k,
            include_metadata=True
        )
        return [match["metadata"] for match in results["matches"]]
    except Exception as e:
        print("Pinecone fetch failed:", e)
        return []

def build_prompt(user_input: str, past_context: list) -> str:
    context_str = "\n".join(
        [f"Previous Dot: {c.get('summary', '')}" for c in past_context]
    )

    prompt = f"""
You are DotSpark — a powerful thinking assistant designed to help users organize their thoughts into 3 cognitive layers: Dot, Wheel, and Chakra.

Each response MUST be returned in valid JSON using this format:
{{
  "dot": {{
    "summary": "...",           # (max 220 characters)
    "context": "...",           # (max 300 characters)
    "pulse": "..."              # one word emotion
  }},
  "wheel": {{
    "heading": "...",
    "summary": "...",           # (max 300 characters)
    "timeline": "short-term"
  }},
  "chakra": {{
    "heading": "...",
    "purpose": "...",           # (max 300 characters)
    "timeline": "long-term"
  }},
  "linkages": ["..."]           # (optional: dot to wheel or chakra links)
}}

User's current input: "{user_input}"

Relevant previous context:
{context_str}

Now process and summarize the user's thought.
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

def run_dotspark_agent(user_id: str, user_input: str) -> Dict[str, Any]:
    context = fetch_user_context(user_id)
    prompt = build_prompt(user_input, context)

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": "Summarize this into Dot, Wheel, and Chakra format"}
    ]

    result = call_model(messages)
    return {
        "user_input": user_input,
        "structured_summary": result
    }

# Example test call
if __name__ == "__main__":
    test_user_id = "user-123"
    test_input = "I want to achieve financial freedom so I can live life on my terms."
    output = run_dotspark_agent(test_user_id, test_input)
    print("\n==== DotSpark Output ====")
    print(output["structured_summary"])
