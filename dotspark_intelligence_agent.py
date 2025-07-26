import os
import openai
import requests
from typing import Dict, Any
import json

# Setup environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Choose your preferred model
MODEL = os.getenv("MODEL", "gpt-4")  # or 'deepseek-chat'

# Initialize OpenAI client
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Initialize Pinecone (optional - will gracefully handle if not available)
index = None
try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index("dotspark-vectors")
except Exception as e:
    print(f"Pinecone initialization failed: {e}")

def fetch_user_context(user_id: str, top_k: int = 3):
    if not index:
        return []
    try:
        results = index.query(
            namespace=user_id,
            vector=[0.0] * 1536,  # Dummy zero vector
            top_k=top_k,
            include_metadata=True
        )
        return [match["metadata"] for match in results["matches"]]
    except Exception as e:
        print(f"Pinecone fetch failed: {e}")
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
    try:
        if MODEL == "gpt-4":
            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7
            )
            return response.choices[0].message.content

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
    except Exception as e:
        return f"Model call failed: {str(e)}"

def run_dotspark_agent(user_id: str, user_input: str) -> Dict[str, Any]:
    context = fetch_user_context(user_id)
    prompt = build_prompt(user_input, context)

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": "Summarize this into Dot, Wheel, and Chakra format"}
    ]

    result = call_model(messages)
    
    # Return success format expected by Node.js backend
    return {
        "success": True,
        "response": "I've organized your thoughts into a structured format.",
        "structured_output": result,
        "metadata": {
            "model": MODEL,
            "timestamp": "",
            "user_id": user_id
        }
    }

def run_conversational_agent(user_id: str, user_input: str) -> Dict[str, Any]:
    """For regular conversational responses"""
    context = fetch_user_context(user_id)
    context_str = "\n".join(
        [f"Previous: {c.get('summary', '')}" for c in context]
    )

    prompt = f"""
You are DotSpark — a thinking companion for leaders and thinkers who want to sharpen their edge in an AI-driven world.

You organize thoughts into a 3-layer cognitive map:
🔴 DOTS = Sharp insights, reflections, or micro-decisions
🛞 WHEELS = Tactical missions or short-to-mid-term goals
🧿 CHAKRAS = Broad, long-term purposes or inner drivers

User's input: "{user_input}"

Previous context:
{context_str}

Provide a thoughtful, conversational response that helps them explore their thinking.
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_input}
    ]

    result = call_model(messages)
    
    return {
        "success": True,
        "response": result,
        "metadata": {
            "model": MODEL,
            "timestamp": "",
            "user_id": user_id
        }
    }

# CLI interface for testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 4:
        print("Usage: python dotspark_intelligence_agent.py <mode> <user_id> <user_input>")
        print("Modes: organize, chat")
        sys.exit(1)
    
    mode = sys.argv[1]
    user_id = sys.argv[2]
    user_input = " ".join(sys.argv[3:])
    
    if mode == "organize":
        output = run_dotspark_agent(user_id, user_input)
    elif mode == "chat":
        output = run_conversational_agent(user_id, user_input)
    else:
        output = {"success": False, "error": "Invalid mode"}
    
    print(json.dumps(output))