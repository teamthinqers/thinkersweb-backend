import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// User's cognitive parameters from CogniShield configuration
export interface CogniShieldProfile {
  // Decision-making style
  decisionSpeed: number; // 0.0 (deliberate) to 1.0 (quick)
  riskTolerance: number; // 0.0 (conservative) to 1.0 (aggressive)
  analyticalDepth: number; // 0.0 (surface) to 1.0 (deep)
  
  // Communication preferences
  communicationStyle: number; // 0.0 (formal) to 1.0 (casual)
  detailLevel: number; // 0.0 (brief) to 1.0 (comprehensive)
  
  // Cognitive patterns
  creativityBias: number; // 0.0 (conventional) to 1.0 (innovative)
  logicalStructure: number; // 0.0 (intuitive) to 1.0 (systematic)
  
  // Learning preferences
  learningStyle: string; // "visual", "auditory", "kinesthetic", "reading"
  conceptualApproach: number; // 0.0 (concrete) to 1.0 (abstract)
  
  // Values and priorities
  priorityFramework: string[]; // e.g., ["efficiency", "accuracy", "innovation"]
  ethicalStance: string; // "pragmatic", "principled", "balanced"
  
  // Industry context
  domainExpertise: string[]; // e.g., ["healthcare", "fintech"]
  professionalLevel: string; // "entry", "mid", "senior", "executive"
}

// AI response analysis result
export interface DeviationAnalysis {
  hasDeviation: boolean;
  deviationScore: number; // 0.0 (aligned) to 1.0 (completely misaligned)
  deviationAreas: string[];
  suggestedCorrections: string[];
  alignmentPrompt: string;
}

/**
 * Analyzes AI-generated content against user's CogniShield profile
 * and suggests corrections for deviations
 */
export async function analyzeCognitiveAlignment(
  aiResponse: string,
  userQuery: string,
  cogniProfile: CogniShieldProfile,
  context?: string
): Promise<DeviationAnalysis> {
  try {
    const analysisPrompt = `You are a cognitive alignment analyst. Analyze the AI response against the user's cognitive profile and identify any deviations from their preferred thinking style.

USER'S COGNITIVE PROFILE:
- Decision Speed: ${cogniProfile.decisionSpeed} (0=deliberate, 1=quick)
- Risk Tolerance: ${cogniProfile.riskTolerance} (0=conservative, 1=aggressive)
- Analytical Depth: ${cogniProfile.analyticalDepth} (0=surface, 1=deep)
- Communication Style: ${cogniProfile.communicationStyle} (0=formal, 1=casual)
- Detail Level: ${cogniProfile.detailLevel} (0=brief, 1=comprehensive)
- Creativity Bias: ${cogniProfile.creativityBias} (0=conventional, 1=innovative)
- Logical Structure: ${cogniProfile.logicalStructure} (0=intuitive, 1=systematic)
- Learning Style: ${cogniProfile.learningStyle}
- Conceptual Approach: ${cogniProfile.conceptualApproach} (0=concrete, 1=abstract)
- Priority Framework: ${cogniProfile.priorityFramework.join(", ")}
- Ethical Stance: ${cogniProfile.ethicalStance}
- Domain Expertise: ${cogniProfile.domainExpertise.join(", ")}
- Professional Level: ${cogniProfile.professionalLevel}

ORIGINAL USER QUERY: "${userQuery}"

AI RESPONSE TO ANALYZE: "${aiResponse}"

${context ? `CONTEXT: ${context}` : ''}

Analyze the AI response and determine if it aligns with the user's cognitive profile. Respond with JSON in this exact format:
{
  "hasDeviation": boolean,
  "deviationScore": number,
  "deviationAreas": ["area1", "area2"],
  "suggestedCorrections": ["correction1", "correction2"],
  "alignmentPrompt": "A refined prompt that would generate a response more aligned with the user's cognitive style"
}

Focus on:
1. Communication style alignment (formal vs casual, brief vs detailed)
2. Decision-making approach (quick vs deliberate, risk-averse vs risk-taking)
3. Analytical depth (surface vs deep analysis)
4. Creative vs conventional solutions
5. Systematic vs intuitive structure
6. Domain-appropriate expertise level
7. Value alignment with priority framework`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      hasDeviation: analysis.hasDeviation || false,
      deviationScore: Math.max(0, Math.min(1, analysis.deviationScore || 0)),
      deviationAreas: analysis.deviationAreas || [],
      suggestedCorrections: analysis.suggestedCorrections || [],
      alignmentPrompt: analysis.alignmentPrompt || "",
    };

  } catch (error) {
    console.error('Error analyzing cognitive alignment:', error);
    return {
      hasDeviation: false,
      deviationScore: 0,
      deviationAreas: [],
      suggestedCorrections: [],
      alignmentPrompt: "",
    };
  }
}

/**
 * Generates a corrected response using the alignment prompt
 */
export async function generateAlignedResponse(
  originalQuery: string,
  alignmentPrompt: string,
  cogniProfile: CogniShieldProfile,
  context?: string
): Promise<string> {
  try {
    const correctedPrompt = `${alignmentPrompt}

IMPORTANT: Adapt your response to match these specific user preferences:
- Communication: ${cogniProfile.communicationStyle > 0.5 ? 'Casual and conversational' : 'Professional and formal'}
- Detail Level: ${cogniProfile.detailLevel > 0.5 ? 'Comprehensive with examples' : 'Concise and to-the-point'}
- Structure: ${cogniProfile.logicalStructure > 0.5 ? 'Systematic step-by-step approach' : 'Intuitive flow'}
- Creativity: ${cogniProfile.creativityBias > 0.5 ? 'Include innovative alternatives' : 'Focus on proven approaches'}
- Risk Approach: ${cogniProfile.riskTolerance > 0.5 ? 'Bold recommendations' : 'Conservative suggestions'}
- Analysis Depth: ${cogniProfile.analyticalDepth > 0.5 ? 'Deep dive into implications' : 'High-level overview'}

${context ? `Context: ${context}` : ''}

Original Query: "${originalQuery}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: correctedPrompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "";

  } catch (error) {
    console.error('Error generating aligned response:', error);
    return "";
  }
}

/**
 * Creates a user-specific system prompt based on their CogniShield profile
 */
export function generateCogniShieldSystemPrompt(cogniProfile: CogniShieldProfile): string {
  const styleDescriptors = [];
  
  // Decision-making style
  if (cogniProfile.decisionSpeed > 0.7) {
    styleDescriptors.push("Make quick, decisive recommendations");
  } else if (cogniProfile.decisionSpeed < 0.3) {
    styleDescriptors.push("Provide thorough deliberation before conclusions");
  }
  
  // Risk tolerance
  if (cogniProfile.riskTolerance > 0.7) {
    styleDescriptors.push("Suggest bold, innovative approaches");
  } else if (cogniProfile.riskTolerance < 0.3) {
    styleDescriptors.push("Focus on safe, proven methodologies");
  }
  
  // Communication style
  if (cogniProfile.communicationStyle > 0.6) {
    styleDescriptors.push("Use conversational, approachable language");
  } else {
    styleDescriptors.push("Maintain professional, formal tone");
  }
  
  // Detail level
  if (cogniProfile.detailLevel > 0.6) {
    styleDescriptors.push("Provide comprehensive explanations with examples");
  } else {
    styleDescriptors.push("Keep responses concise and action-oriented");
  }
  
  // Structure preference
  if (cogniProfile.logicalStructure > 0.6) {
    styleDescriptors.push("Present information in clear, systematic steps");
  } else {
    styleDescriptors.push("Use natural, intuitive flow of ideas");
  }
  
  // Creativity bias
  if (cogniProfile.creativityBias > 0.6) {
    styleDescriptors.push("Include creative alternatives and innovative solutions");
  } else {
    styleDescriptors.push("Focus on conventional, well-established approaches");
  }

  const systemPrompt = `You are an AI assistant configured to match the user's cognitive style and preferences. 

USER PROFILE:
- Professional Level: ${cogniProfile.professionalLevel}
- Domain Expertise: ${cogniProfile.domainExpertise.join(", ")}
- Learning Style: ${cogniProfile.learningStyle}
- Priority Framework: ${cogniProfile.priorityFramework.join(", ")}
- Ethical Stance: ${cogniProfile.ethicalStance}

COMMUNICATION GUIDELINES:
${styleDescriptors.map(descriptor => `- ${descriptor}`).join('\n')}

RESPONSE REQUIREMENTS:
- Align all recommendations with the user's priority framework
- Consider their ${cogniProfile.professionalLevel}-level expertise in ${cogniProfile.domainExpertise.join(" and ")}
- Adapt explanations to their ${cogniProfile.learningStyle} learning preference
- Maintain ${cogniProfile.ethicalStance} ethical perspective
- ${cogniProfile.conceptualApproach > 0.5 ? 'Use abstract concepts and theoretical frameworks' : 'Focus on concrete examples and practical applications'}

Always ensure your responses reflect these preferences consistently.`;

  return systemPrompt;
}

/**
 * Monitors ongoing conversation for cognitive alignment
 */
export async function monitorConversationAlignment(
  conversationHistory: Array<{role: string, content: string}>,
  cogniProfile: CogniShieldProfile
): Promise<{
  overallAlignment: number;
  suggestions: string[];
  correctionPrompts: string[];
}> {
  try {
    const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
    const conversationText = recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const monitoringPrompt = `Analyze this conversation for alignment with the user's cognitive profile:

USER COGNITIVE PROFILE:
- Decision Speed: ${cogniProfile.decisionSpeed}
- Risk Tolerance: ${cogniProfile.riskTolerance}
- Communication Style: ${cogniProfile.communicationStyle}
- Detail Level: ${cogniProfile.detailLevel}
- Creativity Bias: ${cogniProfile.creativityBias}
- Logical Structure: ${cogniProfile.logicalStructure}
- Priority Framework: ${cogniProfile.priorityFramework.join(", ")}

CONVERSATION:
${conversationText}

Provide alignment analysis in JSON format:
{
  "overallAlignment": number, // 0.0 to 1.0
  "suggestions": ["suggestion1", "suggestion2"],
  "correctionPrompts": ["prompt1", "prompt2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: monitoringPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      overallAlignment: Math.max(0, Math.min(1, analysis.overallAlignment || 1)),
      suggestions: analysis.suggestions || [],
      correctionPrompts: analysis.correctionPrompts || [],
    };

  } catch (error) {
    console.error('Error monitoring conversation alignment:', error);
    return {
      overallAlignment: 1,
      suggestions: [],
      correctionPrompts: [],
    };
  }
}