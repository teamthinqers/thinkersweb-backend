import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client with modern API
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def dotspark_financial_freedom_test():
    """Test DotSpark structured response for financial freedom"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": """Always respond only in this format:

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
        
        response_content = response.choices[0].message.content
        return response_content
    except Exception as e:
        return f"Error: {e}"

def validate_and_display_response(response_text):
    """Validate JSON response and display structured output"""
    
    print("=== RAW GPT-4 RESPONSE ===")
    print(response_text)
    print("\n" + "="*50 + "\n")
    
    try:
        # Parse JSON
        parsed = json.loads(response_text)
        
        print("✅ SUCCESSFULLY PARSED STRUCTURE:")
        print(f"DOT Summary: {parsed['dot']['summary']}")
        print(f"DOT Context: {parsed['dot']['context']}")
        print(f"DOT Pulse: {parsed['dot']['pulse']}")
        print()
        print(f"WHEEL Heading: {parsed['wheel']['heading']}")
        print(f"WHEEL Summary: {parsed['wheel']['summary']}")
        print(f"WHEEL Timeline: {parsed['wheel']['timeline']}")
        print()
        print(f"CHAKRA Heading: {parsed['chakra']['heading']}")
        print(f"CHAKRA Purpose: {parsed['chakra']['purpose']}")
        print(f"CHAKRA Timeline: {parsed['chakra']['timeline']}")
        print()
        print(f"SUGGESTED LINKAGES: {parsed['suggested_linkages']}")
        
        return parsed
    except json.JSONDecodeError as e:
        print(f"❌ JSON PARSING FAILED: {e}")
        return None

def test_multiple_scenarios():
    """Test different scenarios with modern API"""
    
    scenarios = [
        "I want financial freedom.",
        "I need better work-life balance.",
        "I want to start my own business.",
        "I need to improve my health."
    ]
    
    print("=== TESTING MULTIPLE SCENARIOS ===\n")
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"--- Scenario {i}: {scenario} ---")
        
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """Always respond only in this format:

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
                        "content": f"{scenario} Summarize this into dot, wheel and chakra."
                    }
                ]
            )
            
            response_content = response.choices[0].message.content
            
            # Quick validation
            try:
                parsed = json.loads(response_content)
                print(f"✅ Success - DOT: {parsed['dot']['summary'][:50]}...")
                print(f"✅ Success - WHEEL: {parsed['wheel']['heading']}")
                print(f"✅ Success - CHAKRA: {parsed['chakra']['heading']}")
            except:
                print(f"❌ Failed to parse JSON for scenario: {scenario}")
                
        except Exception as e:
            print(f"❌ API Error: {e}")
        
        print()

if __name__ == "__main__":
    print("=== MODERN DOTSPARK API TEST ===\n")
    
    # Test financial freedom scenario
    response = dotspark_financial_freedom_test()
    result = validate_and_display_response(response)
    
    print("\n" + "="*60 + "\n")
    
    # Test multiple scenarios
    test_multiple_scenarios()
    
    if result:
        print("🎉 DotSpark modern API integration successful!")
        print("Ready for production use with your web application.")
    else:
        print("❌ Integration test failed - check API configuration.")