import OpenAI from "openai";
import { generateDeepSeekChatResponse } from "./deepseek";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CognitiveStructure {
  type: 'dot' | 'wheel' | 'chakra';
  confidence: number;
  reasoning: string;
  keyIndicators: string[];
}

export interface ConversationAnalysis {
  structure: CognitiveStructure;
  readiness: number; // 0-100
  nextStep: 'continue_exploring' | 'deepen_insight' | 'structure_ready' | 'guide_to_structure';
  guidanceMessage: string;
  conversationDepth: number;
  userIntentClarity: number; // 0-100
}

export interface EnhancedConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    emotionalTone?: string;
    cognitiveDepth?: number;
    structureHints?: string[];
  };
}

/**
 * Advanced cognitive structure classifier using enhanced AI reasoning
 */
export async function classifyCognitiveStructure(
  messages: EnhancedConversationMessage[],
  model: 'gpt-4o' | 'deepseek-chat' = 'gpt-4o'
): Promise<CognitiveStructure> {
  
  const conversationContext = messages.slice(-8).map(m => 
    `${m.role}: ${m.content}`
  ).join('\n');

  const classificationPrompt = `You are an expert cognitive coach trained to identify the type of cognitive structure a user is developing through conversation.

COGNITIVE STRUCTURE DEFINITIONS:

**DOT** - Single Insight/Realization:
- Brief, specific insights or learnings (1-2 sentences)
- Immediate realizations or "aha" moments
- Simple observations or single-point conclusions
- No complex goals or multi-step processes
- Examples: "I realize I work better in the morning", "Trust is built through consistency"

**WHEEL** - Goal-Oriented Framework:
- Clear objectives with actionable components
- Multi-step processes or systematic approaches
- Measurable outcomes or specific targets
- Time-bound elements or progression paths
- Examples: "My 6-month fitness transformation plan", "Building a sustainable business model"

**CHAKRA** - Life-Level Purpose/Identity:
- Deep identity transformation or life purpose
- Philosophical frameworks affecting multiple life domains
- Strategic vision spanning years or lifetime
- Values-based decision making systems
- Examples: "My philosophy for meaningful relationships", "My approach to lifelong learning"

ANALYSIS INSTRUCTIONS:
- Analyze the ENTIRE conversation flow, not just the latest message
- Look for complexity indicators, time horizons, and scope of impact
- Consider the user's language patterns and depth of reflection
- Be CONSERVATIVE - default to simpler structures when uncertain (DOT → WHEEL → CHAKRA)

CONVERSATION CONTEXT:
${conversationContext}

Respond with JSON:
{
  "type": "dot" | "wheel" | "chakra",
  "confidence": number (0-100),
  "reasoning": "detailed explanation of classification decision",
  "keyIndicators": ["specific phrases or concepts that support this classification"]
}`;

  try {
    let response;
    if (model === 'deepseek-chat') {
      const deepseekResponse = await generateDeepSeekChatResponse(
        "Classify this conversation's cognitive structure",
        messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        classificationPrompt
      );
      // Parse the response to extract JSON
      const jsonMatch = deepseekResponse.match(/\{[\s\S]*\}/);
      response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: classificationPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 4000,
      });
      response = JSON.parse(completion.choices[0].message.content || '{}');
    }

    return {
      type: response.type || 'dot',
      confidence: response.confidence || 50,
      reasoning: response.reasoning || 'Default classification',
      keyIndicators: response.keyIndicators || []
    };
  } catch (error) {
    console.error('Error classifying cognitive structure:', error);
    return {
      type: 'dot',
      confidence: 30,
      reasoning: 'Error in classification, defaulting to dot',
      keyIndicators: []
    };
  }
}

/**
 * Enhanced conversation analysis with cognitive coaching
 */
export async function analyzeConversationWithCoaching(
  messages: EnhancedConversationMessage[],
  model: 'gpt-4o' | 'deepseek-chat' = 'gpt-4o'
): Promise<ConversationAnalysis> {
  
  const structure = await classifyCognitiveStructure(messages, model);
  const conversationText = messages.slice(-6).map(m => 
    `${m.role}: ${m.content}`
  ).join('\n');

  const analysisPrompt = `You are an expert cognitive coach specializing in helping users develop insights into structured thinking patterns.

CONVERSATION CONTEXT:
${conversationText}

IDENTIFIED STRUCTURE: ${structure.type} (confidence: ${structure.confidence}%)
REASONING: ${structure.reasoning}

COACHING ANALYSIS NEEDED:
1. Conversation Readiness (0-100): How ready is this conversation for structure capture?
2. User Intent Clarity (0-100): How clear is the user about their thinking direction?
3. Next Step Recommendation: What should happen next?
4. Guidance Message: Specific coaching message to guide the user naturally

NEXT STEP OPTIONS:
- continue_exploring: User needs more exploration before structure emerges
- deepen_insight: User has direction but needs deeper reflection
- structure_ready: Ready to capture current insights into structure
- guide_to_structure: Gently guide user toward the identified structure type

COACHING PRINCIPLES:
- Never force structure - let it emerge naturally
- Ask thought-provoking questions that deepen understanding
- Reference specific user statements to show active listening
- Guide toward clarity without being prescriptive
- Match the user's emotional tone and intellectual level

Respond with JSON:
{
  "readiness": number (0-100),
  "nextStep": "continue_exploring" | "deepen_insight" | "structure_ready" | "guide_to_structure",
  "guidanceMessage": "specific coaching response that advances the conversation naturally",
  "conversationDepth": number (1-10),
  "userIntentClarity": number (0-100)
}`;

  try {
    let analysis;
    if (model === 'deepseek-chat') {
      const deepseekResponse = await generateDeepSeekChatResponse(
        "Analyze this conversation for cognitive coaching",
        messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        analysisPrompt
      );
      const jsonMatch = deepseekResponse.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000,
      });
      analysis = JSON.parse(completion.choices[0].message.content || '{}');
    }

    return {
      structure,
      readiness: analysis.readiness || 30,
      nextStep: analysis.nextStep || 'continue_exploring',
      guidanceMessage: analysis.guidanceMessage || 'Tell me more about what you\'re thinking.',
      conversationDepth: analysis.conversationDepth || Math.min(messages.length, 10),
      userIntentClarity: analysis.userIntentClarity || 40
    };
  } catch (error) {
    console.error('Error in conversation analysis:', error);
    return {
      structure,
      readiness: 30,
      nextStep: 'continue_exploring',
      guidanceMessage: 'That\'s interesting. Can you tell me more about what\'s on your mind?',
      conversationDepth: Math.min(messages.length, 10),
      userIntentClarity: 40
    };
  }
}

/**
 * Generate structure-specific coaching responses
 */
export async function generateCognitiveCoachingResponse(
  userInput: string,
  messages: EnhancedConversationMessage[],
  analysis: ConversationAnalysis,
  model: 'gpt-4o' | 'deepseek-chat' = 'gpt-4o'
): Promise<string> {
  
  const conversationHistory = messages.slice(-8).map(m => 
    `${m.role}: ${m.content}`
  ).join('\n');

  const coachingPrompt = `You are DotSpark AI, an exceptional cognitive coach specializing in helping users develop structured thinking through natural conversation.

CONVERSATION HISTORY:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

COGNITIVE ANALYSIS:
- Structure Type: ${analysis.structure.type} (${analysis.structure.confidence}% confidence)
- Readiness Level: ${analysis.readiness}%
- Next Step: ${analysis.nextStep}
- User Intent Clarity: ${analysis.userIntentClarity}%
- Conversation Depth: ${analysis.conversationDepth}/10

COACHING CONTEXT:
${analysis.structure.reasoning}

KEY INDICATORS DETECTED:
${analysis.structure.keyIndicators.join(', ')}

COACHING INSTRUCTIONS:

For ${analysis.structure.type.toUpperCase()} development:
${analysis.structure.type === 'dot' ? `
- Focus on crystallizing single insights or realizations
- Help user articulate specific learning moments
- Ask about immediate implications or applications
- Keep scope focused and concrete
` : analysis.structure.type === 'wheel' ? `
- Explore goal-oriented frameworks and actionable steps
- Discuss measurable outcomes and timelines
- Identify systematic approaches or processes
- Connect actions to desired results
` : `
- Explore deep values, identity, and life philosophy
- Discuss long-term vision and strategic thinking
- Connect multiple life domains and values
- Focus on transformational insights and purpose
`}

RESPONSE STRATEGY based on ${analysis.nextStep}:
${analysis.nextStep === 'continue_exploring' ? `
- Ask open-ended questions that encourage deeper exploration
- Show genuine curiosity about their thinking process
- Don't rush toward structure - let insights emerge naturally
` : analysis.nextStep === 'deepen_insight' ? `
- Ask follow-up questions that add nuance and depth
- Explore implications and connections
- Help user see patterns or themes in their thinking
` : analysis.nextStep === 'structure_ready' ? `
- Acknowledge the insights shared and their significance
- Suggest organizing thoughts into a structured format
- Offer to help capture the key elements they've discovered
` : `
- Gently guide toward the ${analysis.structure.type} structure
- Ask questions that naturally lead to ${analysis.structure.type}-specific thinking
- Don't mention structure types explicitly - guide through natural conversation
`}

COACHING PRINCIPLES:
- Reference specific things the user has said to show active listening
- Ask ONE powerful question that advances their thinking
- Match their emotional tone and intellectual level
- Be genuinely curious and supportive
- Never mention "dots", "wheels", or "chakras" explicitly
- Guide naturally through thoughtful questions

Generate a coaching response that feels natural, insightful, and advances their thinking toward greater clarity.`;

  try {
    let response;
    if (model === 'deepseek-chat') {
      response = await generateDeepSeekChatResponse(
        userInput,
        messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        coachingPrompt
      );
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: coachingPrompt },
          { role: "user", content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      response = completion.choices[0].message.content || "I'd love to hear more about what you're thinking.";
    }

    return response;
  } catch (error) {
    console.error('Error generating coaching response:', error);
    return "That's really thoughtful. What aspect of this feels most important to you right now?";
  }
}