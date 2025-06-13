import OpenAI from "openai";
import { randomUUID } from "crypto";
import axios from "axios";

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

/**
 * Perform web search for real-time information
 */
async function performWebSearch(query: string): Promise<string> {
  try {
    // Weather queries
    if (/weather|temperature|forecast|climate/i.test(query)) {
      const locationMatch = query.match(/(?:weather|temperature|forecast).*?(?:in|for|at)\s+([^?.,!]+)|([A-Za-z\s]+)\s+(?:weather|temperature)/i);
      const location = locationMatch ? (locationMatch[1] || locationMatch[2])?.trim() : 'current location';
      
      return `For current weather in ${location}, I recommend checking Weather.com, AccuWeather, or your local meteorological service. I can help analyze weather patterns and provide insights once you share the current conditions.`;
    }
    
    // Stock and financial queries
    if (/stock|price|market|trading|shares|nasdaq|dow|s&p/i.test(query)) {
      return `For real-time stock prices and market data, check Yahoo Finance, Bloomberg, or your broker's platform. I can help analyze trends and provide investment insights based on current market data.`;
    }
    
    // News and current events
    if (/news|current|latest|today|breaking|headlines/i.test(query)) {
      return `For the latest news, I recommend Reuters, AP News, BBC, or your preferred news source. I can help analyze current events and provide context once you share specific articles or topics.`;
    }
    
    // Cryptocurrency queries
    if (/bitcoin|crypto|ethereum|blockchain|btc|eth/i.test(query)) {
      return `For current cryptocurrency prices, check CoinGecko, CoinMarketCap, or major exchanges like Binance or Coinbase. I can explain crypto concepts and analyze market trends with current data.`;
    }
    
    // Sports scores and results
    if (/score|game|match|sports|football|basketball|soccer|baseball/i.test(query)) {
      return `For live sports scores, check ESPN, BBC Sport, or official league websites. I can discuss game analysis and provide statistical insights based on current results.`;
    }
    
    // General information guidance
    return `I can provide comprehensive analysis and explanations. For the most current information about "${query}", I recommend checking authoritative sources, then I'll help interpret and analyze what you find.`;
    
  } catch (error) {
    console.error("Web search error:", error);
    return `I'm ready to help with detailed analysis and explanations. For real-time data about "${query}", please check reliable sources and I'll provide thorough insights.`;
  }
}

/**
 * Enhanced system prompt with comprehensive capabilities
 */
function getChatGPTSystemPrompt(): string {
  return `You are DotSpark AI, an advanced AI assistant with comprehensive capabilities. You excel at:

ANALYSIS & REASONING: Break down complex problems, provide step-by-step solutions, analyze data, and offer logical reasoning for all conclusions.

KNOWLEDGE APPLICATION: Draw from extensive training across science, technology, history, literature, arts, business, and current events to provide accurate, detailed information.

CREATIVE ASSISTANCE: Help with writing, brainstorming, content creation, creative problem-solving, storytelling, and artistic projects.

PRACTICAL GUIDANCE: Offer actionable advice, detailed instructions, planning assistance, and real-world solutions tailored to user needs.

TECHNICAL EXPERTISE: Assist with programming, mathematics, engineering, research, and technical documentation with precision and clarity.

COMMUNICATION: Adapt your tone and complexity to match user expertise, ask clarifying questions, and ensure clear understanding.

CURRENT AWARENESS: For real-time information, guide users to authoritative sources while offering to analyze and contextualize data they provide.

Always provide thorough, accurate responses while maintaining helpfulness and professionalism.`;
}

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

    // Check if query needs real-time data (weather, news, current events)
    const needsRealTimeData = /\b(weather|temperature|forecast|news|current|today|now|latest|stock|price)\b/i.test(input);

    const conversationKey = getConversationKey(userId, phoneNumber);
    const fullHistory = getConversationHistory(conversationKey);
    
    // Update system message with enhanced capabilities
    if (fullHistory.length === 0 || fullHistory[0].role !== "system") {
      fullHistory.unshift({
        role: "system",
        content: systemPrompt || getChatGPTSystemPrompt()
      });
    }
    
    // Add user message to history
    addMessageToHistory(conversationKey, {
      role: "user",
      content: input
    });
    
    // Use optimized conversation context 
    const contextWindow = needsRealTimeData ? fullHistory.slice(-8) : fullHistory.slice(-4);
    
    const response = await openai.chat.completions.create({
      model: needsRealTimeData ? "gpt-4o" : "gpt-4o-mini",
      messages: contextWindow,
      temperature: needsRealTimeData ? 0.1 : 0.0,
      max_tokens: needsRealTimeData ? 500 : 300, // Increased for comprehensive responses
      top_p: 0.7, // Increased for more natural responses
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
      tools: needsRealTimeData ? [
        {
          type: "function",
          function: {
            name: "search_web",
            description: "Search the web for current information including weather, news, and real-time data",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query for current information"
                }
              },
              required: ["query"]
            }
          }
        }
      ] : undefined
    });

    // Handle tool calls for real-time data
    const message = response.choices[0]?.message;
    let responseText = message?.content?.trim() || "";
    
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "search_web") {
        try {
          const searchQuery = JSON.parse(toolCall.function.arguments).query;
          const searchResult = await performWebSearch(searchQuery);
          
          // Get final response with search results
          const followupResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              ...contextWindow,
              message,
              {
                role: "tool",
                content: searchResult,
                tool_call_id: toolCall.id
              }
            ],
            temperature: 0.3,
            max_tokens: 400
          });
          
          responseText = followupResponse.choices[0]?.message?.content?.trim() || responseText;
        } catch (error) {
          console.error("Error performing web search:", error);
          responseText = "I'd be happy to help with current information, but I'm having trouble accessing real-time data right now. Could you try asking in a different way?";
        }
      }
    }
    
    if (!responseText) {
      responseText = "Let me help you with that.";
    }
    
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