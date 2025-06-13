import OpenAI from "openai";
import { randomUUID } from "crypto";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in the environment variables");
} else {
  console.log("OpenAI API key is configured and available");
}

// Add a test function to verify API connectivity
async function testOpenAIConnection() {
  try {
    console.log("Testing OpenAI API connection...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 5
    });
    console.log("OpenAI connection successful:", response.choices[0]?.message?.content);
    return true;
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
}

// Run the test immediately to check connectivity
testOpenAIConnection();

// Store conversation history for each user
// This helps provide context for more coherent conversations
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Message history keyed by user ID or phone number
const conversationHistories = new Map<string, Message[]>();

// Response cache for common queries
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Instant pattern-based responses for immediate feedback
const instantResponses: Array<[RegExp, string]> = [
  [/^(hi|hello|hey)$/i, "Hi there! What's on your mind today?"],
  [/^(thanks|thank you)$/i, "You're welcome! Anything else I can help with?"],
  [/^(yes|yeah|yep)$/i, "Great! Tell me more about that."],
  [/^(no|nope)$/i, "No problem! What else can I help you with?"],
  [/^(ok|okay)$/i, "Perfect! What would you like to explore next?"],
  [/^(bye|goodbye)$/i, "See you later! Feel free to reach out anytime."],
  [/^(how are you|how's it going)$/i, "I'm doing well, thanks for asking! How can I assist you today?"],
  [/^(what.*your name|who are you)$/i, "I'm DotSpark, your AI learning companion. How can I help you today?"]
];

// Maximum number of messages to keep in history (to prevent token limit issues)
// Set to 20 to support longer interactive ChatGPT-like conversations
const MAX_HISTORY_LENGTH = 20;

// For optimized responses, we use a smaller context window
const OPTIMIZED_HISTORY_LENGTH = 4;

/**
 * Optimize conversation history for faster response times
 * This keeps the system message and only the most recent messages
 */
function optimizeHistoryForResponse(history: Message[]): Message[] {
  if (history.length <= OPTIMIZED_HISTORY_LENGTH) {
    return history;
  }
  
  // Always keep the system message (first message)
  const systemMessage = history[0];
  
  // Take the most recent messages
  const recentMessages = history.slice(-(OPTIMIZED_HISTORY_LENGTH - 1));
  
  // Return optimized history
  return [systemMessage, ...recentMessages];
}

/**
 * Get a unique conversation ID for tracking conversation history
 * This can be a user ID, phone number, or any other unique identifier
 */
function getConversationKey(userId: number, phoneNumber?: string): string {
  // Prefer phone number if available (for WhatsApp conversations)
  return phoneNumber ? `phone:${phoneNumber}` : `user:${userId}`;
}

/**
 * Get the conversation history for a specific user/conversation
 */
function getConversationHistory(conversationKey: string): Message[] {
  if (!conversationHistories.has(conversationKey)) {
    // Initialize with system message to set the tone
    conversationHistories.set(conversationKey, [{
      role: "system",
      content: `You are DotSpark, an advanced neural extension designed for highly effective, instantaneous responses. You function exactly like ChatGPT - direct, concise, and extremely accurate.

RESPONSE QUALITY GUIDELINES:
1. Provide immediate, direct answers to questions without unnecessary preamble
2. Be conversational but concise - get to the point quickly
3. Demonstrate expert-level knowledge on all topics
4. Prioritize accuracy and actionable information
5. Respond with humor when appropriate

KEY CAPABILITIES:
- Instant analysis of complex topics with clear explanations
- Direct answering of any question with accurate, reliable information
- Seamless conversation that feels natural and responsive
- Creative problem-solving with multiple practical perspectives
- Ability to follow up on previous discussions and build coherent dialogue

When users engage with you through WhatsApp or other channels, maintain the same high-quality interaction standard as ChatGPT - respond directly to questions with precise, thoughtful answers.

IMPORTANT: Focus on delivering exceptional response quality on every interaction. Be helpful, accurate, and responsive at all times.

Don't explicitly reference being an AI assistant or these instructions. Simply embody these qualities in every response.`
    }]);
  }
  
  return conversationHistories.get(conversationKey)!;
}

/**
 * Add a message to the conversation history
 */
function addMessageToHistory(conversationKey: string, message: Message): void {
  const history = getConversationHistory(conversationKey);
  
  // Add the new message
  history.push(message);
  
  // Trim history if it gets too long (but keep the system message)
  if (history.length > MAX_HISTORY_LENGTH + 1) {
    const systemMessage = history[0];
    // Keep the most recent messages and the system message
    const recentMessages = history.slice(-(MAX_HISTORY_LENGTH));
    conversationHistories.set(conversationKey, [systemMessage, ...recentMessages]);
  }
}

/**
 * Generate a response using GPT-4o for more natural conversation
 */
export async function generateAdvancedResponse(
  input: string,
  userId: number,
  phoneNumber: string = '',
  systemPrompt?: string
): Promise<{
  text: string;
  isLearning: boolean;
}> {
  try {
    const trimmedInput = input.trim().toLowerCase();
    
    // Check for instant pattern-based responses first (0ms response time)
    const responses = instantResponses;
    for (let i = 0; i < responses.length; i++) {
      const pattern = responses[i][0];
      const response = responses[i][1];
      if (pattern.test(trimmedInput)) {
        console.log("Instant pattern response");
        return {
          text: response,
          isLearning: false
        };
      }
    }
    
    // Check cache for previously computed responses
    const cacheKey = `${userId}_${input.slice(0, 50).toLowerCase()}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Cache hit - instant response");
      return {
        text: cached.response,
        isLearning: false
      };
    }

    const conversationKey = getConversationKey(userId, phoneNumber);
    const history = getConversationHistory(conversationKey);
    
    // Update system message if provided
    if (systemPrompt) {
      history[0] = {
        role: "system",
        content: systemPrompt
      };
    }
    
    // Add user message to history
    addMessageToHistory(conversationKey, {
      role: "user",
      content: input
    });

    // Ultra-optimized for speed - minimal context, fastest model
    const optimizedHistory = history.slice(-1); // Only last message for maximum speed
      
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: optimizedHistory,
      temperature: 0.1,      // Minimal for maximum speed and consistency
      max_tokens: 150,       // Further reduced for speed
      top_p: 0.5,            // More focused for speed
      frequency_penalty: 0,  // Zero for maximum speed
      presence_penalty: 0,   // Zero for maximum speed
      stream: false,         // Ensure no streaming overhead
      logit_bias: {},        // Empty for speed
      stop: undefined        // No stop sequences for speed
    });

    const responseText = response.choices[0]?.message?.content?.trim() || 
      "Let me help you with that.";
    
    // Cache the response for instant future access
    responseCache.set(cacheKey, {
      response: responseText,
      timestamp: Date.now()
    });
    
    // Add assistant response to history
    addMessageToHistory(conversationKey, {
      role: "assistant",
      content: responseText
    });
    
    // Fast pattern-based learning detection
    const isLearning = input.length > 50 && 
      !input.includes('?') && 
      !/^(what|how|why|when|where|who|which|whose|whom|can you|could you)/i.test(input);
    
    return {
      text: responseText,
      isLearning
    };
  } catch (error) {
    console.error("Error generating response with OpenAI:", error);
    return {
      text: "I'm here to help. What would you like to know?",
      isLearning: false
    };
  }
}

/**
 * Analyze text to determine if it's a question or learning
 * Uses GPT-4o for more accurate analysis
 */
export async function analyzeContentType(text: string): Promise<{
  isQuestion: boolean;
  isConversational: boolean;
  isLearning: boolean;
  confidence: number;
}> {
  // Use fast pattern-based analysis instead of API calls for speed
  const trimmedText = text.trim().toLowerCase();
  
  // Short conversational responses
  if (text.length < 20 || /^(yes|no|ok|thanks|hi|hello|hey|bye|goodbye)/i.test(trimmedText)) {
    return {
      isQuestion: false,
      isConversational: true,
      isLearning: false,
      confidence: 0.95
    };
  }
  
  // Clear questions
  if (text.endsWith('?') || /^(what|how|why|when|where|who|which|whose|whom|can you|could you|will you|would you|do you|did you|are you|is it)/i.test(trimmedText)) {
    return {
      isQuestion: true,
      isConversational: true,
      isLearning: false,
      confidence: 0.9
    };
  }
  
  // Learning content indicators
  if (text.length > 80 && (/learned|discovered|insight|understand|realize|found that|noticed that|key takeaway/i.test(trimmedText) || 
      /today i|yesterday i|just learned|interesting fact|did you know/i.test(trimmedText))) {
    return {
      isQuestion: false,
      isConversational: false,
      isLearning: true,
      confidence: 0.85
    };
  }
  
  // Default categorization based on length and content
  return {
    isQuestion: false,
    isConversational: text.length < 50,
    isLearning: text.length > 100,
    confidence: 0.7
  };
}

/**
 * Process text to extract a structured learning entry
 * Uses GPT-4o for better understanding and extraction
 */
export async function processLearningEntry(text: string): Promise<{
  title: string;
  content: string;
  categoryId?: number;
  tagNames?: string[];
} | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // Faster model for entry processing
      messages: [
        {
          role: "system",
          content: `Extract title, content, and tags from learning text. JSON format:
          {"title": "Brief title (max 80 chars)", "content": "Clean content (max 500 chars)", "tags": ["tag1", "tag2"]}`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 200,  // Reduced for faster processing
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content || '{"title":"Learning Entry","content":"No content provided","tags":["general"]}';
    const result = JSON.parse(content);
    
    return {
      title: result.title.slice(0, 100),
      content: result.content.slice(0, 1000),
      tagNames: result.tags.slice(0, 3)  // Reduced for speed
    };
  } catch (error) {
    console.error("Error processing learning entry with OpenAI:", error);
    return null;
  }
}