import OpenAI from "openai";
import { generateDeepSeekChatResponse } from "./deepseek";
import { 
  classifyCognitiveStructure, 
  analyzeConversationWithCoaching, 
  generateCognitiveCoachingResponse,
  EnhancedConversationMessage,
  ConversationAnalysis,
  CognitiveStructure
} from "./cognitive-coach";
import { handleOrganizeThoughts } from "./thought-organizer-clean";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StructureProposal {
  type: 'dot' | 'wheel' | 'chakra';
  heading: string;
  content: {
    summary?: string;
    anchor?: string; 
    pulse?: string;
    goals?: string;
    purpose?: string;
    timeline?: string;
    vision?: string;
    values?: string[];
    domains?: string[];
  };
  confidence: number;
  needsConfirmation: boolean;
}

export interface EnhancedChatResponse {
  response: string;
  analysis: ConversationAnalysis;
  structureProposal?: StructureProposal;
  action: 'continue' | 'deepen' | 'propose_structure' | 'save_structure' | 'special_prompt';
  metadata: {
    conversationQuality: number; // 0-100
    guidanceApplied: string;
    nextStepSuggestion: string;
  };
}

/**
 * Enhanced intelligent chat with cognitive structure training
 */
export async function generateEnhancedChatResponse(
  userInput: string,
  messages: EnhancedConversationMessage[] = [],
  model: 'gpt-4o' | 'deepseek-chat' = 'gpt-4o',
  userId?: number | null,
  sessionId?: string | null
): Promise<EnhancedChatResponse> {
  
  try {
    // Check for special prompts first
    const specialPromptType = isSpecialPrompt(userInput);
    if (specialPromptType === 'organize_thoughts') {
      const sessionId = `organize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const organizeResult = await handleOrganizeThoughts(
        userInput, [], userId || null, sessionId, model
      );
      
      return {
        response: organizeResult.response,
        analysis: {
          structure: { type: 'dot', confidence: 70, reasoning: 'Special organize thoughts prompt', keyIndicators: [] },
          readiness: 50,
          nextStep: 'continue_exploring',
          guidanceMessage: organizeResult.response,
          conversationDepth: 1,
          userIntentClarity: 60
        },
        action: 'special_prompt',
        metadata: {
          conversationQuality: 70,
          guidanceApplied: 'organize_thoughts_handler',
          nextStepSuggestion: 'Continue exploring thoughts naturally'
        }
      };
    }

    // Add user message to enhanced conversation
    const enhancedMessages: EnhancedConversationMessage[] = [
      ...messages,
      {
        role: "user",
        content: userInput,
        timestamp: new Date(),
        metadata: {
          emotionalTone: await detectEmotionalTone(userInput),
          cognitiveDepth: estimateCognitiveDepth(userInput)
        }
      }
    ];

    // Perform advanced conversation analysis
    const analysis = await analyzeConversationWithCoaching(enhancedMessages, model);
    
    // Check if user is confirming or rejecting a proposal
    const confirmationWords = ['yes', 'save', 'confirm', 'looks good', 'perfect', 'that works', 'correct', 'exactly'];
    const rejectionWords = ['no', 'not quite', 'different', 'change', 'modify', 'wrong', 'not right'];
    
    const isConfirming = confirmationWords.some(word => 
      userInput.toLowerCase().includes(word)
    );
    const isRejecting = rejectionWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    // Determine response strategy based on analysis
    if (analysis.readiness >= 80 && analysis.nextStep === 'structure_ready') {
      // Generate structure proposal
      const structureProposal = await generateStructureProposal(enhancedMessages, analysis.structure, model);
      
      const proposalResponse = formatStructureProposal(structureProposal);
      
      return {
        response: proposalResponse,
        analysis,
        structureProposal,
        action: 'propose_structure',
        metadata: {
          conversationQuality: calculateConversationQuality(analysis),
          guidanceApplied: 'structure_proposal_generated',
          nextStepSuggestion: 'Await user confirmation or modification request'
        }
      };
    }
    
    if (isConfirming && messages.length > 0) {
      // User is confirming - save the structure
      return {
        response: "Perfect! I'll save this structured insight for you. You can find it in your DotSpark collection.",
        analysis,
        action: 'save_structure',
        metadata: {
          conversationQuality: 95,
          guidanceApplied: 'structure_confirmation_processed',
          nextStepSuggestion: 'Structure saved successfully'
        }
      };
    }

    // Generate cognitive coaching response
    const coachingResponse = await generateCognitiveCoachingResponse(
      userInput, enhancedMessages, analysis, model
    );

    const action = analysis.nextStep === 'structure_ready' ? 'propose_structure' : 
                   analysis.nextStep === 'deepen_insight' ? 'deepen' : 'continue';

    return {
      response: coachingResponse,
      analysis,
      action,
      metadata: {
        conversationQuality: calculateConversationQuality(analysis),
        guidanceApplied: `cognitive_coaching_${analysis.nextStep}`,
        nextStepSuggestion: getNextStepSuggestion(analysis)
      }
    };

  } catch (error) {
    console.error('Error in enhanced chat response:', error);
    
    // Fallback response
    return {
      response: "I'm here to help you explore your thoughts. What's on your mind?",
      analysis: {
        structure: { type: 'dot', confidence: 30, reasoning: 'Error fallback', keyIndicators: [] },
        readiness: 20,
        nextStep: 'continue_exploring',
        guidanceMessage: 'Fallback response due to error',
        conversationDepth: 1,
        userIntentClarity: 30
      },
      action: 'continue',
      metadata: {
        conversationQuality: 30,
        guidanceApplied: 'error_fallback',
        nextStepSuggestion: 'Continue natural conversation'
      }
    };
  }
}

/**
 * Generate structure proposal based on conversation analysis
 */
async function generateStructureProposal(
  messages: EnhancedConversationMessage[],
  structure: CognitiveStructure,
  model: 'gpt-4o' | 'deepseek-chat'
): Promise<StructureProposal> {
  
  const conversationContext = messages.slice(-6).map(m => 
    `${m.role}: ${m.content}`
  ).join('\n');

  let proposalPrompt = '';
  
  if (structure.type === 'dot') {
    proposalPrompt = `Based on this conversation, create a DOT structure (single insight):

CONVERSATION:
${conversationContext}

Create a structured dot with:
- heading: Brief, catchy title for the insight
- summary: Core insight in 1-2 sentences (max 220 chars)
- anchor: Memory anchor or context (max 300 chars)  
- pulse: Single emotion word

Respond with JSON:
{
  "heading": "string",
  "summary": "string", 
  "anchor": "string",
  "pulse": "string"
}`;
  } else if (structure.type === 'wheel') {
    proposalPrompt = `Based on this conversation, create a WHEEL structure (goal framework):

CONVERSATION:
${conversationContext}

Create a structured wheel with:
- heading: Goal or objective title
- goals: Main objectives and actionable steps
- timeline: Time-bound elements
- summary: Brief overview

Respond with JSON:
{
  "heading": "string",
  "goals": "string",
  "timeline": "string", 
  "summary": "string"
}`;
  } else {
    proposalPrompt = `Based on this conversation, create a CHAKRA structure (life philosophy):

CONVERSATION:
${conversationContext}

Create a structured chakra with:
- heading: Life philosophy or purpose title
- vision: Long-term strategic vision
- values: Core values (array)
- purpose: Deep life purpose statement
- domains: Life domains affected (array)

Respond with JSON:
{
  "heading": "string",
  "vision": "string",
  "values": ["string"],
  "purpose": "string",
  "domains": ["string"]
}`;
  }

  try {
    let proposal;
    if (model === 'deepseek-chat') {
      const response = await generateDeepSeekChatResponse(
        "Generate structure proposal",
        messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        proposalPrompt
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      proposal = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: proposalPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 400,
      });
      proposal = JSON.parse(completion.choices[0].message.content || '{}');
    }

    return {
      type: structure.type,
      heading: proposal.heading || `My ${structure.type}`,
      content: proposal,
      confidence: structure.confidence,
      needsConfirmation: true
    };
  } catch (error) {
    console.error('Error generating structure proposal:', error);
    return {
      type: structure.type,
      heading: `My ${structure.type}`,
      content: { summary: 'Generated from our conversation' },
      confidence: 50,
      needsConfirmation: true
    };
  }
}

/**
 * Format structure proposal for user display
 */
function formatStructureProposal(proposal: StructureProposal): string {
  const { type, heading, content } = proposal;
  
  let formatted = `I can see you've developed a meaningful ${type}! Let me organize this for you:\n\n**${heading}**\n\n`;
  
  if (type === 'dot') {
    formatted += `**Summary:** ${content.summary}\n`;
    formatted += `**Anchor:** ${content.anchor}\n`;
    formatted += `**Pulse:** ${content.pulse}\n`;
  } else if (type === 'wheel') {
    formatted += `**Goals:** ${content.goals}\n`;
    formatted += `**Timeline:** ${content.timeline}\n`;
    formatted += `**Overview:** ${content.summary}\n`;
  } else {
    formatted += `**Vision:** ${content.vision}\n`;
    formatted += `**Purpose:** ${content.purpose}\n`;
    formatted += `**Values:** ${content.values?.join(', ')}\n`;
    formatted += `**Life Domains:** ${content.domains?.join(', ')}\n`;
  }
  
  formatted += `\nDoes this capture your ${type} well? I can save this or adjust anything you'd like to change.`;
  
  return formatted;
}

/**
 * Helper functions
 */
async function detectEmotionalTone(text: string): Promise<string> {
  const emotions = ['excited', 'curious', 'focused', 'confused', 'frustrated', 'satisfied', 'contemplative'];
  // Simple keyword detection - could be enhanced with AI
  for (const emotion of emotions) {
    if (text.toLowerCase().includes(emotion)) return emotion;
  }
  return 'neutral';
}

function estimateCognitiveDepth(text: string): number {
  const depthIndicators = ['because', 'therefore', 'however', 'moreover', 'furthermore', 'consequently'];
  const complexWords = text.split(' ').filter(word => word.length > 6).length;
  const indicators = depthIndicators.filter(indicator => text.toLowerCase().includes(indicator)).length;
  return Math.min(10, Math.floor((complexWords / 5) + (indicators * 2)));
}

function calculateConversationQuality(analysis: ConversationAnalysis): number {
  return Math.round(
    (analysis.readiness * 0.4) + 
    (analysis.userIntentClarity * 0.3) + 
    (analysis.conversationDepth * 8) +
    (analysis.structure.confidence * 0.2)
  );
}

function getNextStepSuggestion(analysis: ConversationAnalysis): string {
  switch (analysis.nextStep) {
    case 'continue_exploring': return 'Continue exploring thoughts naturally';
    case 'deepen_insight': return 'Ask deeper questions to develop insights';
    case 'structure_ready': return 'Prepare to capture structured insights';
    case 'guide_to_structure': return `Guide toward ${analysis.structure.type} development`;
    default: return 'Continue natural conversation';
  }
}

function isSpecialPrompt(input: string): string | null {
  const normalizedInput = input.toLowerCase().trim();
  
  if (normalizedInput.includes('organize my thoughts') || 
      normalizedInput.includes('organize thoughts') ||
      normalizedInput === 'organize my thoughts') {
    return 'organize_thoughts';
  }
  
  return null;
}