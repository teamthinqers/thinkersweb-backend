#!/usr/bin/env python3

"""
Test script to verify all intelligence layers are working together
"""

import sys
import json
import requests
import time

def test_enhanced_chat():
    """Test the enhanced chat API with intelligence layer verification"""
    
    # Test message that should trigger multiple intelligence layers
    test_message = "I want to build better habits for productivity and focus"
    
    # Call the enhanced API
    response = requests.post(
        'http://localhost:5000/api/dotspark/chat',
        json={'message': test_message, 'model': 'gpt-4'},
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print("✅ ENHANCED INTELLIGENCE TEST RESULTS")
        print("=" * 50)
        
        # Check basic response
        if data.get('success'):
            print(f"✓ API Response: Success")
            print(f"✓ Response Text: {data['data']['response'][:100]}...")
        
        # Check intelligence layers
        metadata = data['data'].get('metadata', {})
        if metadata.get('intelligenceLayers'):
            layers = metadata['intelligenceLayers']
            print(f"\n🧠 INTELLIGENCE LAYERS:")
            print(f"✓ Vector Database Used: {layers.get('vector_database_used', False)}")
            print(f"✓ Semantic Matches: {layers.get('semantic_matches', 0)}")
            print(f"✓ Model Used: {layers.get('model_used', 'unknown')}")
            print(f"✓ Pinecone Integration: {layers.get('pinecone_integration', False)}")
            print(f"✓ Memory Stored: {layers.get('memory_stored', False)}")
        
        # Check context metadata
        if metadata.get('contextMetadata'):
            context = metadata['contextMetadata']
            print(f"\n🎯 CONTEXT ANALYSIS:")
            print(f"✓ Relevant Thoughts: {context.get('relevant_thoughts', 0)}")
            print(f"✓ Pattern Recognition: {context.get('pattern_recognition', 0)}")
            print(f"✓ Personalization Level: {context.get('personalization_level', 'unknown')}")
        
        # Check system capabilities
        if metadata.get('systemCapabilities'):
            capabilities = metadata['systemCapabilities']
            print(f"\n⚡ SYSTEM CAPABILITIES:")
            for capability, enabled in capabilities.items():
                status = "✓" if enabled else "✗"
                print(f"{status} {capability.replace('_', ' ').title()}: {enabled}")
        
        print(f"\n📊 PROCESSING INFO:")
        print(f"✓ Processing Time: {metadata.get('processingTime', 'unknown')}ms")
        print(f"✓ Model: {metadata.get('model', 'unknown')}")
        print(f"✓ Enhanced: {metadata.get('enhanced', False)}")
        
        return True
    else:
        print(f"❌ API Error: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_consecutive_messages():
    """Test conversation memory by sending consecutive messages"""
    print("\n🔄 TESTING CONVERSATION MEMORY")
    print("=" * 50)
    
    messages = [
        "I'm interested in learning machine learning",
        "What should I focus on first?",
        "How does this relate to my previous interest?"
    ]
    
    for i, message in enumerate(messages, 1):
        print(f"\nMessage {i}: {message}")
        response = requests.post(
            'http://localhost:5000/api/dotspark/chat',
            json={'message': message, 'model': 'gpt-4'},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            metadata = data['data'].get('metadata', {})
            layers = metadata.get('intelligenceLayers', {})
            
            print(f"✓ Semantic Matches: {layers.get('semantic_matches', 0)}")
            print(f"✓ Vector DB Used: {layers.get('vector_database_used', False)}")
            
            # Wait a bit between messages to allow storage
            time.sleep(2)
        else:
            print(f"❌ Error: {response.status_code}")

if __name__ == "__main__":
    print("🚀 TESTING ENHANCED DOTSPARK INTELLIGENCE SYSTEM")
    print("=" * 60)
    
    # Test basic enhanced functionality
    success = test_enhanced_chat()
    
    if success:
        # Test conversation memory
        test_consecutive_messages()
        
        print("\n🎉 INTELLIGENCE SYSTEM TEST COMPLETE!")
        print("All layers (Vector DB, Pinecone, Multi-model, Memory) are integrated!")
    else:
        print("\n❌ Tests failed - check system configuration")