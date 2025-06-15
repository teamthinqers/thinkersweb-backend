import OpenAI from "openai";
import { 
  analyzeCognitiveAlignment, 
  generateAlignedResponse, 
  generateCogniShieldSystemPrompt,
  monitorConversationAlignment,
  type CogniShieldProfile,
  type DeviationAnalysis 
} from "./cogni-shield";

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
 * Process user input to create a structured three-layer dot
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
        content: `You are DotSpark AI, a specialized assistant for creating structured three-layer dots. Your job is to help users convert their thoughts into structured dots with three specific layers:

        Layer 1 - Summary (max 220 characters): A concise, sharp summary of the core thought or insight
        Layer 2 - Anchor (max 300 characters): Memory anchor or context that helps recall this thought later
        Layer 3 - Pulse (1 word): Single emotion word describing how this thought makes you feel

        Always respond with a valid JSON object in this exact format:
        {
          "summary": "Concise core insight (max 220 chars)",
          "anchor": "Memory context or application (max 300 chars)", 
          "pulse": "emotion_word",
          "category": "One of: professional, personal, health, finance",
          "tags": ["tag1", "tag2"]
        }

        Guidelines:
        - Summary should be distilled and impactful
        - Anchor should help future recall or application
        - Pulse should be one emotion word like: excited, curious, focused, happy, calm, inspired, confident, grateful, motivated
        - Choose the most relevant category
        - Add 2-3 relevant tags
        
        Do not include explanations, just return the JSON.`
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userInput,
    });

    // Generate response from OpenAI with optimized settings
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model for quicker responses
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300, // Reduced for faster processing
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
 * Generate assistant messages with CogniShield alignment monitoring
 */
export async function generateChatResponse(
  userInput: string,
  messages: Message[] = [],
  cogniProfile?: CogniShieldProfile,
  monitorAlignment: boolean = true
): Promise<{
  response: string;
  alignmentAnalysis?: DeviationAnalysis;
  suggestedCorrections?: string[];
  cogniShieldAlert?: string;
}> {
  try {
    // Use CogniShield system prompt if profile is available
    let systemPrompt = `You are a helpful learning assistant called DotSpark AI. Your job is to engage with the user
        about their learning experiences and help them reflect more deeply on what they've learned.
        Ask thoughtful follow-up questions about their learning, suggest ways to apply it, 
        or identify connections to other topics they might be interested in.
        Be brief, friendly, and encouraging. Always end with a question to encourage further conversation.
        If the user's message seems like a learning insight rather than a question, respond in a way that
        acknowledges their learning but also encourages them to reflect further.`;

    if (cogniProfile) {
      systemPrompt = generateCogniShieldSystemPrompt(cogniProfile);
    }

    // Add system message if not already in history
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({
        role: "system",
        content: systemPrompt
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userInput,
    });

    // Generate response from OpenAI with optimized settings
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model for quicker responses
      messages: messages.slice(-6) as any, // Keep only recent context for speed
      temperature: 0.5,
      max_tokens: 150, // Reduced for faster processing
    });

    const aiResponse = response.choices[0].message.content || "I didn't quite catch that. Can you tell me more about what you learned?";

    // Perform alignment analysis if CogniShield profile is available and monitoring is enabled
    let alignmentAnalysis: DeviationAnalysis | undefined;
    let suggestedCorrections: string[] | undefined;

    if (cogniProfile && monitorAlignment && aiResponse) {
      alignmentAnalysis = await analyzeCognitiveAlignment(
        aiResponse,
        userInput,
        cogniProfile
      );

      if (alignmentAnalysis.hasDeviation && alignmentAnalysis.deviationScore > 0.3) {
        suggestedCorrections = alignmentAnalysis.suggestedCorrections;
        
        // If deviation is significant, generate an aligned response
        if (alignmentAnalysis.deviationScore > 0.6 && alignmentAnalysis.alignmentPrompt) {
          const correctedResponse = await generateAlignedResponse(
            userInput,
            alignmentAnalysis.alignmentPrompt,
            cogniProfile
          );
          
          if (correctedResponse) {
            return {
              response: correctedResponse,
              alignmentAnalysis,
              suggestedCorrections
            };
          }
        }
      }
    }

    // Generate CogniShield alert if there are deviations
    let cogniShieldAlert: string | undefined;
    if (alignmentAnalysis?.hasDeviation && alignmentAnalysis.deviationScore > 0.4) {
      cogniShieldAlert = `🧠 CogniShield Notice: This response may not fully align with your cognitive style (${Math.round(alignmentAnalysis.deviationScore * 100)}% deviation detected). ${alignmentAnalysis.suggestedCorrections?.[0] || 'Consider adjusting the approach to better match your thinking patterns.'}`;
    }

    return {
      response: aiResponse,
      alignmentAnalysis,
      suggestedCorrections,
      cogniShieldAlert
    };

  } catch (error) {
    console.error("Error generating chat response:", error);
    return {
      response: "I'm having trouble processing that right now. Can you try again?",
      alignmentAnalysis: undefined,
      suggestedCorrections: undefined
    };
  }
}

/**
 * Analyze user input to determine whether it's a question or a learning entry
 */
export async function analyzeUserInput(userInput: string): Promise<{
  type: 'question' | 'learning' | 'command';
  confidence: number;
}> {
  try {
    // Check for command prefixes first
    if (userInput.toLowerCase().startsWith("q:") || 
        userInput.toLowerCase().startsWith("question:") ||
        userInput.toLowerCase().startsWith("ask:")) {
      return { type: 'question', confidence: 0.95 };
    }
    
    if (userInput.toLowerCase() === "help" || 
        userInput.toLowerCase() === "summary" || 
        userInput.toLowerCase() === "stats") {
      return { type: 'command', confidence: 0.95 };
    }
    
    // If no command prefix, use AI to analyze
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an input classifier. Categorize the following text as either:
          1. A question (the user is asking for information)
          2. A learning entry (the user is sharing something they learned)
          
          Respond with JSON in the format:
          {"type": "question" or "learning", "confidence": 0.0 to 1.0}`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{"type": "learning", "confidence": 0.5}');
    return {
      type: result.type,
      confidence: result.confidence
    };
    
  } catch (error) {
    console.error("Error analyzing user input:", error);
    // Default to treating it as a learning entry if analysis fails
    return { type: 'learning', confidence: 0.5 };
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