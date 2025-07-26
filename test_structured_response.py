import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load environment variables
load_dotenv()

# Initialize OpenAI client with modern API
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_structured_dotspark_response():
    """Test the structured JSON response from DotSpark"""
    
    system_prompt = """You are DotSpark. Always reply only in this structured JSON format:

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

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": "I want financial freedom."
                }
            ]
        )
        
        response_content = response.choices[0].message.content
        print("=== RAW RESPONSE ===")
        print(response_content)
        
        # Parse JSON
        try:
            parsed_json = json.loads(response_content)
            print("\n=== PARSED STRUCTURE ===")
            print("✅ Successfully parsed JSON:")
            print(f"DOT: {parsed_json.get('dot')}")
            print(f"WHEEL: {parsed_json.get('wheel')}")
            print(f"CHAKRA: {parsed_json.get('chakra')}")
            print(f"LINKAGES: {parsed_json.get('suggested_linkages')}")
            return parsed_json
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON parsing failed: {e}")
            return None
            
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return None

def test_multiple_inputs():
    """Test with different user inputs"""
    test_inputs = [
        "I want financial freedom.",
        "I need to organize my work better.",
        "I'm thinking about starting a side business.",
        "I want to learn a new skill this year."
    ]
    
    print("=== TESTING MULTIPLE INPUTS ===\n")
    
    for i, user_input in enumerate(test_inputs, 1):
        print(f"--- Test {i}: {user_input} ---")
        
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are DotSpark. Always reply only in this structured JSON format:

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
                        "content": user_input
                    }
                ]
            )
            
            response_content = response.choices[0].message.content
            
            try:
                parsed = json.loads(response_content)
                print(f"✅ Success - DOT: {parsed['dot']['summary'][:50]}...")
                print(f"✅ Success - WHEEL: {parsed['wheel']['heading']}")
                print(f"✅ Success - CHAKRA: {parsed['chakra']['heading']}")
            except:
                print(f"❌ Failed to parse JSON for: {user_input}")
                
        except Exception as e:
            print(f"❌ API Error: {e}")
            
        print()

if __name__ == "__main__":
    print("=== DotSpark Structured Response Test ===\n")
    
    # Test single response
    result = test_structured_dotspark_response()
    
    print("\n" + "="*50 + "\n")
    
    # Test multiple inputs
    test_multiple_inputs()