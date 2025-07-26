import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# Load environment variables
load_dotenv()

# Initialize OpenAI client with modern API
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
try:
    index = pc.Index("dotspark-vectors")
    print("✅ Connected to Pinecone vector database")
except Exception as e:
    print(f"❌ Pinecone connection failed: {e}")
    index = None

def get_embedding(text):
    """Get OpenAI embedding for text"""
    try:
        response = openai_client.embeddings.create(
            input=[text],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

def fetch_user_context(user_input, user_id="demo_user"):
    """Fetch related dots from vector database"""
    if not index:
        return "No previous context available."
    
    embedding = get_embedding(user_input)
    if not embedding:
        return "No previous context available."
    
    try:
        results = index.query(vector=embedding, top_k=5, include_metadata=True)
        context_items = []
        
        for match in results.get('matches', []):
            meta = match.get('metadata', {})
            if str(meta.get('user_id')) == str(user_id):
                context_items.append(f"- {meta.get('summary', 'No summary')}")
        
        return "\n".join(context_items) if context_items else "No related thoughts found in your history."
    except Exception as e:
        print(f"Context fetch error: {e}")
        return "No previous context available."

def dotspark_structured_response(user_input, user_id="demo_user"):
    """Generate structured DotSpark response with context"""
    
    # Get user's previous context
    context = fetch_user_context(user_input, user_id)
    
    system_prompt = f"""You are DotSpark — a thinking assistant that always replies in this structured JSON format:

{{
  "dot": {{
    "summary": "...",
    "context": "...",
    "pulse": "..."
  }},
  "wheel": {{
    "heading": "...",
    "summary": "...",
    "timeline": "short-term"
  }},
  "chakra": {{
    "heading": "...",
    "purpose": "...",
    "timeline": "long-term"
  }},
  "suggested_linkages": ["Relates to...", "Supports..."]
}}

User's previous thoughts:
{context}

The user's current insight: "{user_input}"
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": "Organize this thought into dot, wheel and chakra structure."
        }
    ]

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        
        response_content = response.choices[0].message.content
        return response_content
    except Exception as e:
        return f"OpenAI API Error: {e}"

def test_comprehensive_dotspark():
    """Test comprehensive DotSpark functionality"""
    
    test_cases = [
        {
            "input": "I want financial freedom.",
            "user_id": "user_001"
        },
        {
            "input": "I need to build better habits.",
            "user_id": "user_002"
        },
        {
            "input": "I'm thinking about career change.",
            "user_id": "user_003"
        }
    ]
    
    print("=== DotSpark Comprehensive Test ===\n")
    
    for i, test in enumerate(test_cases, 1):
        print(f"--- Test {i}: {test['input']} ---")
        
        # Get structured response
        response = dotspark_structured_response(test['input'], test['user_id'])
        
        print("RAW RESPONSE:")
        print(response)
        
        # Parse JSON
        try:
            parsed = json.loads(response)
            print("\n✅ STRUCTURED OUTPUT:")
            print(f"DOT: {parsed['dot']['summary']}")
            print(f"WHEEL: {parsed['wheel']['heading']}")
            print(f"CHAKRA: {parsed['chakra']['heading']}")
            print(f"PULSE: {parsed['dot']['pulse']}")
            print(f"LINKAGES: {parsed.get('suggested_linkages', [])}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
        
        print("\n" + "="*60 + "\n")

def test_integration_with_existing_system():
    """Test integration with existing DotSpark web system"""
    
    print("=== Integration Test with Web System ===\n")
    
    # Simulate user input from web interface
    web_user_input = "I want to organize my thoughts better"
    web_user_id = "web_user_123"
    
    print(f"Web User Input: {web_user_input}")
    print(f"User ID: {web_user_id}")
    
    # Process through DotSpark logic
    response = dotspark_structured_response(web_user_input, web_user_id)
    
    print("\nStructured Response for Web Interface:")
    print(response)
    
    # Parse for frontend consumption
    try:
        structured_data = json.loads(response)
        
        print("\n✅ Ready for Frontend Integration:")
        print("DOT Data:", structured_data.get('dot'))
        print("WHEEL Data:", structured_data.get('wheel'))
        print("CHAKRA Data:", structured_data.get('chakra'))
        
        # Simulate API response format
        api_response = {
            "success": True,
            "data": structured_data,
            "user_id": web_user_id,
            "timestamp": "2025-01-26T09:00:00Z"
        }
        
        print("\nAPI Response Format:")
        print(json.dumps(api_response, indent=2))
        
    except Exception as e:
        print(f"❌ Integration parsing failed: {e}")

if __name__ == "__main__":
    # Run comprehensive tests
    test_comprehensive_dotspark()
    
    # Test web system integration
    test_integration_with_existing_system()