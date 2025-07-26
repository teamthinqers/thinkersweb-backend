import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_gpt_call():
    """Simple test of GPT API call"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": "Say hello and confirm you're working."
                }
            ]
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    print("=== Testing GPT API Call ===")
    result = test_gpt_call()
    print(f"Response: {result}")