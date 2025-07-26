import OpenAI from "openai";
import { randomUUID } from "crypto";
import axios from "axios";
import { canMakeRequest, recordUsage, isDotSparkActivated } from './usage-tracker';

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
      max_tokens: 50
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
 * Generate a one-word summary for a dot
 */
export async function generateOneWordSummary(summary: string, anchor: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract exactly ONE meaningful keyword from the given content. Priority order: 1) Extract a specific noun, topic, or concept mentioned in the text 2) Use a domain-specific term if present 3) Identify the main subject. Avoid generic words like 'insight', 'thought', 'idea', 'learning'. Return only the most specific, meaningful word that appears in or relates directly to the content."
        },
        {
          role: "user",
          content: `Extract one specific keyword from this content:
Summary: ${summary}
Context: ${anchor}

Return only ONE specific word from the content itself or directly related to the topic discussed.`
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    let oneWord = response.choices[0]?.message?.content?.trim() || "";
    
    // Clean the response and ensure it's a single word
    oneWord = oneWord.replace(/[^\w]/g, '').split(/\s+/)[0];
    
    // If it's still generic or empty, extract from the actual content
    if (!oneWord || ['insight', 'thought', 'idea', 'learning', 'knowledge'].includes(oneWord.toLowerCase())) {
      // Extract nouns from the content directly
      const combinedText = `${summary} ${anchor}`.toLowerCase();
      const words = combinedText.match(/\b[a-z]{3,}\b/g) || [];
      
      // Filter out common words and find the most meaningful one
      const meaningfulWords = words.filter(word => 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'what', 'when', 'where', 'will', 'with', 'have', 'this', 'that', 'they', 'from', 'been', 'said', 'each', 'which', 'their', 'time', 'into', 'very', 'what', 'know', 'just', 'first', 'could', 'any', 'my', 'now', 'people', 'over', 'think', 'also', 'back', 'after', 'use', 'her', 'work', 'life', 'only', 'way', 'years', 'would', 'good', 'well', 'man', 'year', 'come', 'make', 'most', 'world', 'through', 'need', 'much', 'before', 'right', 'try', 'again', 'turn', 'here', 'why', 'should', 'each', 'those', 'both', 'go', 'about', 'thought', 'insight', 'idea', 'learning', 'knowledge'].includes(word)
      );
      
      oneWord = meaningfulWords[0] || "Topic";
    }
    
    // Capitalize first letter
    return oneWord.charAt(0).toUpperCase() + oneWord.slice(1).toLowerCase();
  } catch (error) {
    console.error("Error generating one-word summary:", error);
    return "Topic"; // Better fallback than "Insight"
  }
}

/**
 * Transcribe audio to text using OpenAI Whisper
 */
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  try {
    // Create a File-like object from the buffer
    const audioFile = new File([audioBuffer], filename, { type: 'audio/wav' });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Can be made dynamic based on user preference
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Process voice input for dot creation with transcription
 */
export async function processVoiceInput(audioBuffer: Buffer, filename: string, layer: 'summary' | 'anchor' | 'pulse'): Promise<{
  transcription: string;
  processedText: string;
}> {
  try {
    // First transcribe the audio
    const transcription = await transcribeAudio(audioBuffer, filename);
    
    // Process the transcription based on the layer requirements
    let processedText = transcription;
    
    if (layer === 'summary') {
      // Ensure summary is concise and under 220 characters
      if (transcription.length > 220) {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system", 
            content: "Condense this text to under 220 characters while preserving the key insight. Be concise and sharp."
          }, {
            role: "user", 
            content: transcription
          }],
          max_tokens: 100
        });
        processedText = response.choices[0]?.message?.content || transcription.substring(0, 220);
      }
    } else if (layer === 'anchor') {
      // Ensure anchor is under 300 characters and contextual
      if (transcription.length > 300) {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system", 
            content: "Condense this memory anchor to under 300 characters while preserving context and key details."
          }, {
            role: "user", 
            content: transcription
          }],
          max_tokens: 120
        });
        processedText = response.choices[0]?.message?.content || transcription.substring(0, 300);
      }
    } else if (layer === 'pulse') {
      // Extract single emotion word from transcription
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system", 
          content: "Extract one single emotion word from this text. Return only the emotion word, nothing else."
        }, {
          role: "user", 
          content: transcription
        }],
        max_tokens: 20
      });
      processedText = response.choices[0]?.message?.content?.trim().split(' ')[0] || 'captured';
    }
    
    return {
      transcription,
      processedText: processedText.trim()
    };
  } catch (error) {
    console.error('Error processing voice input:', error);
    throw new Error('Failed to process voice input');
  }
}

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

// Maximum number of messages to keep in history
const MAX_HISTORY_LENGTH = 20;

/**
 * Optimize conversation history for faster response times
 */
function optimizeHistoryForResponse(history: Message[]): Message[] {
  // Keep system message and recent conversation
  const systemMessage = history.find(msg => msg.role === "system");
  const recentMessages = history.slice(-4); // Last 4 messages for context
  
  const optimized = systemMessage ? [systemMessage, ...recentMessages.filter(msg => msg.role !== "system")] : recentMessages;
  
  return optimized.slice(0, 6); // Limit to 6 messages max for speed
}

/**
 * Get a unique conversation ID for tracking conversation history
 */
function getConversationKey(userId: number, phoneNumber?: string): string {
  return phoneNumber ? `phone_${phoneNumber}` : `user_${userId}`;
}

/**
 * Get the conversation history for a specific user/conversation
 */
function getConversationHistory(conversationKey: string): Message[] {
  if (!conversationHistories.has(conversationKey)) {
    conversationHistories.set(conversationKey, []);
  }
  return conversationHistories.get(conversationKey)!;
}

/**
 * Add a message to the conversation history
 */
function addMessageToHistory(conversationKey: string, message: Message): void {
  const history = getConversationHistory(conversationKey);
  history.push(message);
  
  // Keep history within reasonable limits
  if (history.length > MAX_HISTORY_LENGTH) {
    // Keep system message and trim from the middle
    const systemMsg = history.find(msg => msg.role === "system");
    const otherMessages = history.filter(msg => msg.role !== "system");
    const trimmed = otherMessages.slice(-MAX_HISTORY_LENGTH + 1);
    
    conversationHistories.set(conversationKey, systemMsg ? [systemMsg, ...trimmed] : trimmed);
  }
}

/**
 * Generate advanced response with comprehensive ChatGPT-level capabilities
 */
export async function generateAdvancedResponse(
  input: string,
  userId?: number,
  phoneNumber: string = '',
  systemPrompt?: string,
  sessionId?: string
): Promise<{
  text: string;
  isLearning: boolean;
  usageInfo?: {
    tokensUsed: number;
    tokensRemaining: number;
    isActivated: boolean;
    limitReached?: boolean;
  };
}> {
  try {
    // Check usage limits for non-activated users
    const estimatedTokens = Math.min(input.length * 2, 200); // Rough estimate
    const usageCheck = canMakeRequest(userId, sessionId, estimatedTokens);
    
    if (!usageCheck.allowed) {
      return {
        text: `${usageCheck.reason} ${userId ? 'Sign in and activate DotSpark for unlimited AI assistance.' : 'Please sign in to activate DotSpark for unlimited access.'}`,
        isLearning: false,
        usageInfo: {
          tokensUsed: 0,
          tokensRemaining: usageCheck.tokensRemaining || 0,
          isActivated: false,
          limitReached: true
        }
      };
    }

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

    // Check if query needs real-time data
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
    
    // Determine token limits based on activation status
    const isActivated = isDotSparkActivated(userId);
    const maxTokens = isActivated 
      ? (needsRealTimeData ? 2000 : 1500) // Full tokens for activated users
      : (needsRealTimeData ? 300 : 200);   // Limited tokens for general users
    
    const response = await openai.chat.completions.create({
      model: needsRealTimeData ? "gpt-4o" : "gpt-4o-mini",
      messages: contextWindow,
      temperature: needsRealTimeData ? 0.3 : 0.1,
      max_tokens: maxTokens,
      top_p: 0.7,
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
            max_tokens: 1500 // Increased for complete follow-up responses
          });
          
          responseText = followupResponse.choices[0]?.message?.content?.trim() || responseText;
        } catch (error) {
          console.error("Error performing web search:", error);
          responseText = "I'd be happy to help with current information, but I'm having trouble accessing real-time data right now. Could you try asking in a different way?";
        }
      }
    }
    
    if (!responseText) {
      responseText = "I'm here to help you with that.";
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
    
    // Record usage for non-activated users
    const actualTokensUsed = Math.min(responseText.length / 3, estimatedTokens * 2);
    recordUsage(userId, sessionId, actualTokensUsed);

    return {
      text: responseText,
      isLearning,
      usageInfo: {
        tokensUsed: actualTokensUsed,
        tokensRemaining: isActivated ? -1 : Math.max(0, (usageCheck.tokensRemaining || 0) - actualTokensUsed),
        isActivated: isActivated,
        limitReached: false
      }
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
 */
export async function analyzeContentType(text: string): Promise<{
  type: "question" | "learning" | "conversation";
  confidence: number;
}> {
  // Fast pattern-based analysis for speed
  if (/\?/.test(text) || /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)/i.test(text.trim())) {
    return { type: "question", confidence: 0.9 };
  }
  
  if (text.length > 50 && !/\?/.test(text)) {
    return { type: "learning", confidence: 0.8 };
  }
  
  return { type: "conversation", confidence: 0.7 };
}

/**
 * Process text to extract a structured learning entry
 */
export async function processLearningEntry(text: string): Promise<{
  title: string;
  content: string;
  tags: string[];
  category?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract a structured learning entry from the user's text. Return JSON with:
          - title: A clear, descriptive title (max 60 chars)
          - content: The main learning content, well-formatted
          - tags: Array of 2-4 relevant tags
          - category: Optional category like "technology", "business", "personal", etc.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1500 // Increased for complete chat responses
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      title: result.title || "Learning Entry",
      content: result.content || text,
      tags: result.tags || [],
      category: result.category
    };
  } catch (error) {
    console.error("Error processing learning entry:", error);
    return {
      title: "Learning Entry",
      content: text,
      tags: []
    };
  }
}