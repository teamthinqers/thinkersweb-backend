import os
import openai
import requests
import json
import time
from typing import Dict, Any

# Setup environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Model selection
MODEL = os.getenv("MODEL", "gpt-4")  # Options: 'gpt-4' or 'deepseek-chat'

# Init clients
openai_client = None
index = None

if OPENAI_API_KEY:
    try:
        openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"OpenAI initialization failed: {e}")

if PINECONE_API_KEY:
    try:
        from pinecone import Pinecone
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index("dotspark-vectors")
    except ImportError:
        print("Pinecone package not available")
    except Exception as e:
        print(f"Pinecone initialization failed: {e}")

def fetch_user_context(user_id: str, user_input: str, top_k: int = 5):
    if not index or not openai_client:
        return []
    try:
        # Generate embedding for current user input for semantic search
        embedding_response = openai_client.embeddings.create(
            input=user_input,
            model="text-embedding-ada-002"
        )
        query_vector = embedding_response.data[0].embedding
        
        # Semantic search in user's personal knowledge base
        results = index.query(
            namespace=user_id,
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )
        
        # Return relevant context with similarity scores
        context = []
        for match in results["matches"]:
            if match["score"] > 0.7:  # Only high-relevance matches
                context.append({
                    "content": match["metadata"],
                    "relevance": match["score"],
                    "type": match["metadata"].get("type", "thought")
                })
        
        return context
    except Exception as e:
        print("Enhanced Pinecone fetch failed:", e)
        return []

def build_enhanced_prompt(user_input: str, semantic_context: list) -> str:
    # Build rich contextual information from vector database
    relevant_context = ""
    patterns_detected = []
    user_preferences = {}
    
    for item in semantic_context:
        content = item.get("content", {})
        relevance = item.get("relevance", 0)
        
        if relevance > 0.85:  # Highly relevant
            relevant_context += f"• HIGHLY RELEVANT ({relevance:.2f}): {content.get('summary', '')}\n"
            if content.get('category'):
                patterns_detected.append(content['category'])
        elif relevance > 0.7:  # Moderately relevant
            relevant_context += f"• RELEVANT ({relevance:.2f}): {content.get('summary', '')}\n"

    # Detect user thinking patterns
    pattern_analysis = ""
    if patterns_detected:
        unique_patterns = list(set(patterns_detected))
        pattern_analysis = f"DETECTED PATTERNS: User frequently thinks about {', '.join(unique_patterns[:3])}"

    prompt = f"""
You are DotSpark, an advanced cognitive intelligence system with access to the user's complete thought history via vector database semantic search.

CONTEXT INTELLIGENCE:
{relevant_context}

PATTERN ANALYSIS:
{pattern_analysis}

COGNITIVE COACHING FRAMEWORK:
- Use semantic context to provide personalized insights
- Reference relevant past thoughts when applicable
- Identify cognitive patterns and growth opportunities  
- Guide toward appropriate structure: Dot (insight), Wheel (goal), Chakra (purpose)
- Ask probing questions when thoughts need deeper exploration
- Connect current thinking to user's established knowledge base

ENHANCED OUTPUT FORMAT (when structured response is natural):

{{
  "dot": {{
    "summary": "Sharp insight (max 220 chars)",
    "context": "What triggered this + connections to past thoughts (max 300 chars)", 
    "pulse": "one-word emotion"
  }},
  "wheel": {{
    "heading": "Goal/project name",
    "summary": "Tactical approach + relevant past experiences (max 300 chars)",
    "timeline": "short-term"
  }},
  "chakra": {{
    "heading": "Life purpose/identity",
    "purpose": "Core meaning + alignment with user patterns (max 300 chars)", 
    "timeline": "long-term"
  }},
  "intelligence_insights": [
    "Pattern: User shows consistent interest in...",
    "Connection: This relates to previous thought about...",
    "Growth: Consider exploring the relationship between..."
  ],
  "semantic_linkages": ["Direct connections to past thoughts"],
  "coaching_questions": ["What would happen if...", "How does this connect to..."]
}}

CURRENT USER INPUT: "{user_input}"

Respond as a sophisticated cognitive partner who knows the user's thinking history and can provide contextual, pattern-aware guidance.
"""
    return prompt.strip()

def call_model(messages: list) -> str:
    try:
        if MODEL == "gpt-4" and openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7
            )
            return response.choices[0].message.content

        elif MODEL == "deepseek-chat" and DEEPSEEK_API_KEY:
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
            if res.status_code == 200:
                return res.json()['choices'][0]['message']['content']
            else:
                return f"API Error: {res.status_code}"

        return "No valid API key available for selected model."
    except Exception as e:
        return f"Error calling model: {str(e)}"

def store_conversation_memory(user_id: str, user_input: str, ai_response: str):
    """Store conversation in vector database for future context"""
    if not index or not openai_client:
        return
    
    try:
        # Create embedding for the conversation exchange
        text_to_embed = f"User: {user_input}\nDotSpark: {ai_response}"
        
        embedding_response = openai_client.embeddings.create(
            input=text_to_embed,
            model="text-embedding-ada-002"
        )
        
        # Store in vector database
        index.upsert(
            vectors=[{
                "id": f"{user_id}_conv_{int(time.time())}",
                "values": embedding_response.data[0].embedding,
                "metadata": {
                    "user_input": user_input,
                    "ai_response": ai_response,
                    "timestamp": time.time(),
                    "type": "conversation",
                    "summary": user_input[:200]  # First 200 chars as summary
                }
            }],
            namespace=user_id
        )
    except Exception as e:
        print(f"Failed to store conversation memory: {e}")

def run_dotspark_thought_partner(user_id: str, user_input: str, mode: str = "organize") -> Dict[str, Any]:
    import time
    start_time = time.time()
    
    try:
        # Fetch semantic context using vector search
        semantic_context = fetch_user_context(user_id, user_input)
        
        # Build enhanced prompt with full intelligence layers
        prompt = build_enhanced_prompt(user_input, semantic_context)

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_input}
        ]

        # Get AI response using selected model
        ai_result = call_model(messages)
        
        # Store this conversation for future context
        store_conversation_memory(user_id, user_input, ai_result)
        
        processing_time = time.time() - start_time
        
        # Enhanced response with full intelligence metadata
        response = {
            "user_input": user_input,
            "structured_response": ai_result,
            "mode": mode,
            "intelligence_layers": {
                "vector_database_used": len(semantic_context) > 0,
                "semantic_matches": len(semantic_context),
                "context_relevance_scores": [item.get("relevance", 0) for item in semantic_context],
                "model_used": MODEL,
                "pinecone_integration": True if index else False,
                "memory_stored": True
            },
            "context_metadata": {
                "relevant_thoughts": len([c for c in semantic_context if c.get("relevance", 0) > 0.8]),
                "pattern_recognition": len(set([c.get("content", {}).get("category") for c in semantic_context if c.get("content", {}).get("category")])),
                "personalization_level": "high" if semantic_context else "low"
            },
            "timestamp": "2025-01-26",
            "processing_time": f"{processing_time:.2f}s"
        }
        
        return response
    except Exception as e:
        return {
            "user_input": user_input,
            "structured_response": f"I apologize, but I encountered an error processing your thought: {str(e)}. Please try again.",
            "mode": mode,
            "intelligence_layers": {
                "vector_database_used": False,
                "semantic_matches": 0,
                "error": str(e)
            },
            "timestamp": "2025-01-26",
            "processing_time": "Error",
            "error": str(e)
        }

# CLI interface for backend integration
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 4:
        mode = sys.argv[1]  # 'chat' or 'organize'
        user_id = sys.argv[2]
        user_input = sys.argv[3]
        
        response = run_dotspark_thought_partner(user_id, user_input, mode)
        print(json.dumps(response, indent=2))
    else:
        # Example test
        user_id = "user-123"
        input_text = "I've been thinking about switching careers to something more creative."
        response = run_dotspark_thought_partner(user_id, input_text)
        print("\n=== Thought Evolution Response ===")
        print(json.dumps(response, indent=2))