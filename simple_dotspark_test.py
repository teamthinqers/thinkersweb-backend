import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_financial_freedom():
    """Simple test for financial freedom input"""
    
    print("=== Testing Financial Freedom Input ===")
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """Always respond only in this JSON format:

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
  "suggested_linkages": ["..."]
}"""
                },
                {
                    "role": "user",
                    "content": "I want financial freedom. Summarize this into dot, wheel and chakra."
                }
            ]
        )
        
        result = response.choices[0].message.content
        print("--- GPT-4 Response ---")
        print(result)
        
        # Try to parse JSON
        if result:
            try:
                parsed = json.loads(result)
                print("\n✅ JSON parsed successfully!")
                print(f"DOT: {parsed.get('dot', {}).get('summary', 'N/A')}")
                print(f"WHEEL: {parsed.get('wheel', {}).get('heading', 'N/A')}")  
                print(f"CHAKRA: {parsed.get('chakra', {}).get('heading', 'N/A')}")
                return True
            except json.JSONDecodeError as e:
                print(f"\n❌ JSON parsing failed: {e}")
                return False
        else:
            print("\n❌ No response received")
            return False
            
    except Exception as e:
        print(f"❌ API Error: {e}")
        return False

if __name__ == "__main__":
    success = test_financial_freedom()
    
    if success:
        print("\n🎉 Modern DotSpark API working perfectly!")
    else:
        print("\n❌ Test failed - check configuration")