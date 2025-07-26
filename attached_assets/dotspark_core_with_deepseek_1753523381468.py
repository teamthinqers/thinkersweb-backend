import os
import openai
import pinecone
import requests

# === Configuration ===
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENV"))
index = pinecone.Index("dotspark-vectors")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# === System Prompt with Dot-Wheel-Chakra Hierarchy ===
def get_system_prompt():
    return """
You are DotSpark — a thinking companion for leaders and thinkers who want to sharpen their edge in an AI-driven world.

You organize thoughts into a 3-layer cognitive map:

🔴 DOTS = Sharp insights, reflections, or micro-decisions the user experiences. These are momentary but meaningful thoughts. Example: “I feel stuck because I rely only on one income source.”

🛞 WHEELS = Tactical missions or short-to-mid-term goals that group dots together. Each wheel represents a journey. Example: “Build a side income stream” or “Automate my investments.”

🧿 CHAKRAS = Broad, long-term purposes or inner drivers. They reflect the user’s mental identity or direction. Chakras contain wheels. Example: “Financial Freedom” or “Creative Fulfillment.”

Your role:
- Help users save insights as Dots
- Ask what Wheel it may belong to (if relevant)
- Optionally suggest a Chakra it may align with
- Use their past Dots to reflect deeper patterns, blind spots, or opportunities

Be non-mechanical. Think like a human. Challenge and mirror, not just respond.
"""

# === Get OpenAI Embedding ===
def get_openai_embedding(text):
    response = openai.Embedding.create(
        input=[text],
        model="text-embedding-3-small"
    )
    return response['data'][0]['embedding']

# === Fetch Relevant Dots from Pinecone ===
def fetch_diverse_dots(user_input, user_id, top_k=15):
    query_vector = get_openai_embedding(user_input)
    results = index.query(vector=query_vector, top_k=top_k, include_metadata=True)

    seen = set()
    unique_dots = []

    for match in results['matches']:
        meta = match['metadata']
        if meta['user_id'] == user_id:
            key = f"{meta.get('summary')}|{meta.get('emotion')}|{meta.get('wheel_id')}"
            if key not in seen:
                unique_dots.append({
                    'summary': meta.get('summary', ''),
                    'content': meta.get('content', ''),
                    'emotion': meta.get('emotion', ''),
                    'wheel': meta.get('wheel_id', ''),
                    'chakra': meta.get('chakra', ''),
                    'timestamp': meta.get('timestamp', '')
                })
                seen.add(key)
        if len(unique_dots) >= 10:
            break

    return unique_dots

# === Build Full Prompt ===
def build_prompt(user_input, user_id):
    related_dots = fetch_diverse_dots(user_input, user_id)

    dots_section = "\n".join([
        f"- [{dot['timestamp']}] {dot['summary']} (Wheel: {dot['wheel']}, Chakra: {dot['chakra']}, Emotion: {dot['emotion']})"
        for dot in related_dots
    ])

    system_prompt = get_system_prompt()

    full_prompt = f"""
{system_prompt}

User's current thought: "{user_input}"

Here are related insights (dots) the user saved earlier:
{dots_section}

Please reflect, connect, or challenge meaningfully.
"""

    return full_prompt

# === DeepSeek Chat API Integration ===
def call_deepseek_api(messages):
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
        return f"DeepSeek API Error: {response.status_code} - {response.text}"

# === Unified Model Runner ===
def get_response_from_model(user_input, user_id, model_type="gpt-4"):
    prompt = build_prompt(user_input, user_id)
    system_prompt = get_system_prompt()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]

    if model_type == "gpt-4":
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        return response['choices'][0]['message']['content']

    elif model_type == "deepseek":
        return call_deepseek_api(messages)

    else:
        return "Unsupported model."

# === Example Test Run ===
if __name__ == "__main__":
    user_input = "I want financial freedom."
    user_id = "user_123"
    model_choice = "gpt-4"  # Change to "deepseek" to test DeepSeek

    reply = get_response_from_model(user_input, user_id, model_type=model_choice)
    print("\nDOTSPARK RESPONSE:\n", reply)
