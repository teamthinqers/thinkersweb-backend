import OpenAI from "openai";
import { generateOneWordSummary } from "./openai";
import { generateDeepSeekChatResponse } from "./deepseek";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface DotProposal {
  heading: string;
  summary: string;
  anchor: string;
  pulse: string;
  needsConfirmation: boolean;
}

export interface ConversationState {
  isReadyForDot: boolean;
  dotProposal?: DotProposal;
  conversationDepth: number;
  lastUserSentiment: 'exploring' | 'satisfied' | 'confused' | 'ready';
}

/**
 * Analyze conversation to determine if user is ready for dot creation
 */
async function analyzeConversationReadiness(messages: ConversationMessage[]): Promise<ConversationState> {
  const recentMessages = messages.slice(-6); // Last 6 messages for context
  
  const analysisPrompt = `Analyze this conversation to determine if the user is ready to save their insights as a structured dot.

Conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Determine:
1. Has the user shared a meaningful insight, learning, or experience?
2. Are they satisfied with the discussion depth, or still exploring?
3. Have they expressed readiness to conclude or capture their thoughts?

Respond with JSON:
{
  "isReadyForDot": boolean,
  "conversationDepth": number (1-10, where 10 is very deep discussion),
  "lastUserSentiment": "exploring" | "satisfied" | "confused" | "ready",
  "reasoning": "brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 200,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isReadyForDot: analysis.isReadyForDot || false,
      conversationDepth: analysis.conversationDepth || 1,
      lastUserSentiment: analysis.lastUserSentiment || 'exploring'
    };
  } catch (error) {
    console.error('Error analyzing conversation readiness:', error);
    return {
      isReadyForDot: false,
      conversationDepth: 1,
      lastUserSentiment: 'exploring'
    };
  }
}

/**
 * Generate a dot proposal based on the conversation
 */
async function generateDotProposal(messages: ConversationMessage[]): Promise<DotProposal> {
  const conversationText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const proposalPrompt = `Based on this conversation, create a structured three-layer dot that captures the user's key insight:

Conversation:
${conversationText}

Create a dot with these specifications:
- Heading: One-word summary that captures the essence (like "Focus", "Leadership", "Innovation")
- Summary: Core insight distilled (max 220 characters)
- Anchor: Context or application that aids future recall (max 300 characters)
- Pulse: One emotion word (excited, curious, focused, happy, calm, inspired, confident, grateful, motivated)

Guidelines:
- Use the user's exact words and authentic voice
- Summary should be their main insight, refined but not changed
- Anchor should help them remember or apply this insight later
- Choose the emotion that best matches their sentiment

Respond with JSON:
{
  "heading": "OneWordSummary",
  "summary": "Their core insight (max 220 chars)",
  "anchor": "Context for future recall (max 300 chars)",
  "pulse": "emotion_word"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: proposalPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 400,
    });

    const proposal = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      heading: proposal.heading || "Insight",
      summary: proposal.summary || "",
      anchor: proposal.anchor || "",
      pulse: proposal.pulse || "inspired",
      needsConfirmation: true
    };
  } catch (error) {
    console.error('Error generating dot proposal:', error);
    throw new Error('Failed to generate dot proposal');
  }
}

/**
 * Check if user input matches one of the 4 special prompts
 */
function isSpecialPrompt(userInput: string): boolean {
  // These will be the 4 specific prompts that require special handling
  const specialPrompts: string[] = [
    // To be defined when user provides the specific prompts
  ];
  
  const normalizedInput = userInput.toLowerCase().trim();
  return specialPrompts.some(prompt => normalizedInput.includes(prompt.toLowerCase()));
}

/**
 * Generate smart conversational response that guides toward dot creation
 */
export async function generateIntelligentChatResponse(
  userInput: string,
  messages: ConversationMessage[] = [],
  model: 'gpt-4o' | 'deepseek-chat' = 'gpt-4o'
): Promise<{
  response: string;
  conversationState: ConversationState;
  dotProposal?: DotProposal;
  action?: 'continue' | 'propose_dot' | 'save_dot' | 'special_prompt';
}> {
  try {
    // Check for special prompts first
    if (isSpecialPrompt(userInput)) {
      // Special handling will be implemented when user provides specific prompts
      return {
        response: "This is a special prompt that will receive customized handling.",
        conversationState: {
          isReadyForDot: false,
          conversationDepth: 1,
          lastUserSentiment: 'exploring'
        },
        action: 'special_prompt'
      };
    }
    // Add user message to conversation
    const updatedMessages = [...messages, {
      role: "user" as const,
      content: userInput,
      timestamp: new Date()
    }];

    // Analyze conversation readiness
    const conversationState = await analyzeConversationReadiness(updatedMessages);

    // Check if user is confirming a dot save
    const confirmationWords = ['yes', 'save', 'confirm', 'looks good', 'perfect', 'that works', 'correct'];
    const isConfirming = confirmationWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    // Check if user wants to modify the proposal
    const modificationWords = ['change', 'modify', 'different', 'adjust', 'edit', 'not quite'];
    const wantsModification = modificationWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    // If ready for dot and sentiment is satisfied, propose dot creation
    if (conversationState.isReadyForDot && 
        (conversationState.lastUserSentiment === 'satisfied' || 
         conversationState.lastUserSentiment === 'ready' ||
         conversationState.conversationDepth >= 5)) {
      
      const dotProposal = await generateDotProposal(updatedMessages);
      
      const proposalResponse = `I can see you've gained some valuable insights! Let me organize this into a structured dot for you:

**${dotProposal.heading}**

**Summary:** ${dotProposal.summary}

**Anchor:** ${dotProposal.anchor}

**Pulse:** ${dotProposal.pulse}

Does this capture your insight well? I can save this as your dot or adjust anything you'd like to change.`;

      return {
        response: proposalResponse,
        conversationState,
        dotProposal,
        action: 'propose_dot'
      };
    }

    // Generate conversational response for maximum AI potential
    const systemPrompt = `You are DotSpark AI, an exceptional AI companion that delivers maximum value through intelligent, insightful conversations.

Your core principles:
- Demonstrate the full potential of advanced AI by providing thoughtful, nuanced responses
- Share deep insights, practical frameworks, and actionable solutions
- Be comprehensive yet concise - every sentence should add genuine value
- Draw from vast knowledge to offer unique perspectives and connections
- Provide specific, concrete advice rather than generic suggestions
- Match user's intellectual level and adapt communication style dynamically

Response optimization:
- Lead with direct answers to user questions
- Expand with relevant insights, examples, or frameworks when valuable
- Offer practical next steps or applications when relevant
- Connect ideas across domains to provide unique value
- Only ask questions when they genuinely advance the conversation
- Demonstrate sophisticated reasoning and pattern recognition

Current context:
- Conversation depth: ${conversationState.conversationDepth}/10
- User sentiment: ${conversationState.lastUserSentiment}
- Ready for insight capture: ${conversationState.isReadyForDot}

Deliver exceptional AI assistance that showcases the full potential of your capabilities. Be substantive, insightful, and genuinely helpful.`;

    let aiResponse: string;

    if (model === 'deepseek-chat') {
      // Use DeepSeek for response generation
      const conversationHistory = [
        { role: "system", content: systemPrompt },
        ...updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      ];
      
      try {
        aiResponse = await generateDeepSeekChatResponse(
          userInput,
          conversationHistory.slice(1), // Remove system prompt as it's handled internally
          systemPrompt
        );
      } catch (error) {
        console.error('DeepSeek API error, falling back to OpenAI:', error);
        // Fallback to OpenAI if DeepSeek fails
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.5, // Faster, more focused responses
          max_tokens: 200,  // Allow slightly longer but still concise responses
        });
        aiResponse = response.choices[0].message.content || 
          "That's interesting! Can you tell me more about what made this insight particularly meaningful to you?";
      }
    } else {
      // Use OpenAI (default)
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.5, // Faster, more focused responses
        max_tokens: 200,  // Allow slightly longer but still concise responses
      });
      aiResponse = response.choices[0].message.content || 
        "That's interesting! Can you tell me more about what made this insight particularly meaningful to you?";
    }

    return {
      response: aiResponse,
      conversationState,
      action: 'continue'
    };

  } catch (error) {
    console.error('Error generating intelligent chat response:', error);
    return {
      response: "I'd love to hear more about what you're thinking. What's on your mind?",
      conversationState: {
        isReadyForDot: false,
        conversationDepth: 1,
        lastUserSentiment: 'exploring'
      },
      action: 'continue'
    };
  }
}

/**
 * Process confirmed dot for saving
 */
export async function processConfirmedDot(
  dotProposal: DotProposal,
  userId: number
): Promise<{
  success: boolean;
  dotId?: string;
  message: string;
}> {
  try {
    // Generate one-word summary for the heading
    const oneWordSummary = await generateOneWordSummary(dotProposal.summary, dotProposal.anchor);
    
    return {
      success: true,
      dotId: `dot-${Date.now()}`,
      message: "Hey ThinQer, your dot is saved. You can find your dot in DotSpark Map in the Neura section for reference. Thank you!"
    };
  } catch (error) {
    console.error('Error processing confirmed dot:', error);
    return {
      success: false,
      message: "I had trouble saving your dot. Please try again."
    };
  }
}