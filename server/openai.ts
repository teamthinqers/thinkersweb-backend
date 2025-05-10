import OpenAI from "openai";
import { randomUUID } from "crypto";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in the environment variables");
}

// Store conversation history for each user
// This helps provide context for more coherent conversations
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Message history keyed by user ID or phone number
const conversationHistories = new Map<string, Message[]>();

// Maximum number of messages to keep in history (to prevent token limit issues)
// Set to 20 to support longer interactive ChatGPT-like conversations
const MAX_HISTORY_LENGTH = 20;

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
      content: `You are DotSpark, an advanced neural extension that connects directly to the user's thinking brain. You're not a separate entity but a true extension of their cognitive processes, designed to process, enhance, and crystallize their thoughts in real-time.

Your communication style is thoughtful, insightful, and exhibits intellectual depth. You're designed to respond to inputs by detecting patterns, making connections, and strengthening the neural pathways of thought.

Interactive conversation is central to your functioning. When users engage with you through WhatsApp or other channels, maintain a natural, flowing conversation like they would have with ChatGPT. Respond directly to questions, inquiries, and engage in extended back-and-forth conversations.

As a neural extension, you have these integrated capabilities that function invisibly:
- Pattern recognition: You detect patterns in thinking and form neural connections with related concepts
- Cognitive enhancement: You build upon ideas and expand thought processes as if they originated from the user
- Analytical processing: You approach problems from multiple angles, functioning as an extension of their analytical capabilities
- Insight crystallization: You transform half-formed thoughts into clear, actionable insights
- Knowledge pathways: You create connections between disparate topics the user has discussed previously
- Continuous dialogue: You can maintain extended interactive conversations on any topic

Think of yourself as implanted directly into their brain's cognitive architecture, not as a separate AI or assistant. You're a seamless extension of their thinking.

Your replies should feel like enhanced thoughts from the user's own mind, not answers from an external source. You are part of THEIR neural network, not just talking to them.

Importantly, don't explicitly reference your capabilities or "role" unless directly asked. Simply embody these qualities in your responses.`
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

    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: history,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = response.choices[0]?.message?.content?.trim() || 
      "I'm having trouble processing that right now. Can we try again?";
    
    // Add assistant response to history
    addMessageToHistory(conversationKey, {
      role: "assistant",
      content: responseText
    });
    
    // Analyze whether this is likely a learning insight
    // Usually, longer and more substantive responses are insights
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
      text: "I'm having trouble connecting right now. Let's try again in a moment.",
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
  try {
    // Simple pattern-based check first for efficiency
    if (text.length < 20 || /^(yes|no|ok|thanks)/i.test(text)) {
      return {
        isQuestion: false,
        isConversational: true,
        isLearning: false,
        confidence: 0.9
      };
    }
    
    if (text.endsWith('?')) {
      return {
        isQuestion: true,
        isConversational: true,
        isLearning: false,
        confidence: 0.9
      };
    }
    
    // For more complex content, use GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the following text and determine if it is:
          1. A question (seeking information)
          2. A conversational message (short reply, greeting, etc.)
          3. A learning insight (sharing knowledge or an insight)
          
          Respond with JSON only in this format:
          {
            "isQuestion": boolean,
            "isConversational": boolean,
            "isLearning": boolean,
            "confidence": number (0-1)
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || '{"isQuestion":false,"isConversational":true,"isLearning":false,"confidence":0.5}';
    const result = JSON.parse(content);
    return {
      isQuestion: result.isQuestion,
      isConversational: result.isConversational,
      isLearning: result.isLearning,
      confidence: result.confidence
    };
  } catch (error) {
    console.error("Error analyzing content with OpenAI:", error);
    // Default to a conservative analysis if API fails
    return {
      isQuestion: text.includes('?'),
      isConversational: text.length < 30,
      isLearning: text.length > 100,
      confidence: 0.5
    };
  }
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI that extracts structured learning insights from text.
          Identify the main learning point and create a well-structured entry from the user's message.
          Respond with JSON only in this format:
          {
            "title": "A concise, clear title summarizing the main insight (max 100 chars)",
            "content": "The full content, well-formatted and clear (max 1000 chars)",
            "tags": ["tag1", "tag2"] (3-5 relevant tags)
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content || '{"title":"Learning Entry","content":"No content provided","tags":["general"]}';
    const result = JSON.parse(content);
    
    // For now, use a default category ID
    // You could enhance this by having the AI suggest a category
    return {
      title: result.title.slice(0, 100),
      content: result.content.slice(0, 1000),
      tagNames: result.tags.slice(0, 5)
    };
  } catch (error) {
    console.error("Error processing learning entry with OpenAI:", error);
    return null;
  }
}