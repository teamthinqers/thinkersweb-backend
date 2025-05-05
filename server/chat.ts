import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define message types
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Type for structured entry from chat input
export interface StructuredEntry {
  title: string;
  content: string;
  categoryId?: number;
  tagNames?: string[];
}

/**
 * Process user input to create a structured entry
 */
export async function processEntryFromChat(
  userInput: string, 
  messages: Message[] = []
): Promise<StructuredEntry> {
  try {
    // Add system message if not already in history
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({
        role: "system",
        content: `You are a helpful learning assistant. Your job is to structure the user's learning input into a proper entry.
        Extract a title, content, and any relevant categories (from: professional, personal, health, finance) and tags.
        Always respond with a valid JSON object with the following format:
        {
          "title": "Clear, concise title of the entry",
          "content": "Expanded detailed content of what the user learned",
          "category": "One of: professional, personal, health, finance",
          "tags": ["tag1", "tag2"]
        }
        Do not include any explanations or extra text, just return the JSON.`
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userInput,
    });

    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Get the response content
    const responseContent = response.choices[0].message.content;
    
    // Parse the response
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }
    
    const structuredData = JSON.parse(responseContent);
    
    // Map to our structured entry format
    const result: StructuredEntry = {
      title: structuredData.title,
      content: structuredData.content,
      tagNames: structuredData.tags || [],
    };
    
    // Add category if present
    if (structuredData.category) {
      // We'll map category names to IDs when we implement the API endpoint
      result.categoryId = getCategoryIdFromName(structuredData.category);
    }
    
    return result;
  } catch (error) {
    console.error("Error processing chat input:", error);
    throw new Error("Failed to process your learning entry. Please try again.");
  }
}

/**
 * Generate assistant messages to simulate a conversation about the learning
 */
export async function generateChatResponse(
  userInput: string,
  messages: Message[] = []
): Promise<string> {
  try {
    // Add system message if not already in history
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({
        role: "system",
        content: `You are a helpful learning assistant. Your job is to engage with the user
        about their learning experiences and help them reflect more deeply on what they've learned.
        Ask thoughtful follow-up questions about their learning, suggest ways to apply it, 
        or identify connections to other topics they might be interested in.
        Be brief, friendly, and encouraging.`
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userInput,
    });

    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 150,
    });

    // Return the response content
    return response.choices[0].message.content || "I didn't quite catch that. Can you tell me more about what you learned?";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm having trouble processing that right now. Can you try again?";
  }
}

// Helper function to map category names to IDs
// This is a temporary placeholder - we'll replace it with database lookups in the API endpoint
function getCategoryIdFromName(categoryName: string): number | undefined {
  const categoryMap: Record<string, number> = {
    professional: 1,
    personal: 2,
    health: 3,
    finance: 4,
  };
  
  return categoryMap[categoryName.toLowerCase()];
}