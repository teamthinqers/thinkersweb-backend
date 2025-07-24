import OpenAI from "openai";
import { db } from "../db";
import { userPatternMemory, conversationSessions, dots, wheels, users } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OrganizeThoughtsMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ThoughtClassification {
  type: 'dot' | 'wheel' | 'chakra' | 'exploring';
  confidence: number;
  reasoning: string;
  suggestedStructure?: {
    title?: string;
    timeline?: string;
    relatedTopics?: string[];
    potentialConnections?: string[];
  };
}

export interface OrganizedThoughtSummary {
  classification: ThoughtClassification;
  structuredData: {
    dots?: Array<{
      summary: string;
      anchor: string;
      pulse: string;
    }>;
    wheels?: Array<{
      name: string;
      goals: string;
      timeline: string;
      dots: Array<{
        summary: string;
        anchor: string;
        pulse: string;
      }>;
    }>;
    chakras?: Array<{
      name: string;
      purpose: string;
      wheels: Array<{
        name: string;
        goals: string;
        timeline: string;
      }>;
    }>;
  };
  visualSummary: string;
  userConfirmationNeeded: boolean;
}

/**
 * Retrieve user's conversation patterns and memory
 */
async function getUserPatterns(userId: number): Promise<{
  patterns: Array<{ thoughtPattern: string; keywords: string[]; conversationStyle?: string; preferredTopics?: string[] }>;
  recentDots: Array<{ summary: string; anchor: string; pulse: string }>;
  recentWheels: Array<{ name: string; goals?: string; timeline?: string }>;
  recentChakras: Array<{ name: string; purpose?: string }>;
}> {
  try {
    // Get user patterns
    const patterns = await db.query.userPatternMemory.findMany({
      where: eq(userPatternMemory.userId, userId),
      orderBy: desc(userPatternMemory.lastUpdated),
      limit: 5
    });

    // Get recent dots, wheels, chakras for context
    const recentDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt),
      limit: 10
    });

    const recentWheels = await db.query.wheels.findMany({
      where: and(eq(wheels.userId, userId), eq(wheels.chakraId, null)),
      orderBy: desc(wheels.createdAt),
      limit: 5
    });

    const recentChakras = await db.query.wheels.findMany({
      where: and(eq(wheels.userId, userId), eq(wheels.chakraId, undefined)),
      orderBy: desc(wheels.createdAt),
      limit: 3
    });

    return {
      patterns: patterns.map(p => ({
        thoughtPattern: p.thoughtPattern,
        keywords: JSON.parse(p.keywords || '[]'),
        conversationStyle: p.conversationStyle || undefined,
        preferredTopics: JSON.parse(p.preferredTopics || '[]')
      })),
      recentDots: recentDots.map(d => ({ summary: d.summary, anchor: d.anchor, pulse: d.pulse })),
      recentWheels: recentWheels.map(w => ({ name: w.name, goals: w.goals || undefined, timeline: w.timeline || undefined })),
      recentChakras: recentChakras.map(c => ({ name: c.name, purpose: c.purpose || undefined }))
    };
  } catch (error) {
    console.error('Error retrieving user patterns:', error);
    return { patterns: [], recentDots: [], recentWheels: [], recentChakras: [] };
  }
}

/**
 * Classify user's thoughts using advanced AI analysis
 */
async function classifyThoughts(
  messages: OrganizeThoughtsMessage[],
  userPatterns: any
): Promise<ThoughtClassification> {
  const conversationContext = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const classificationPrompt = `You are an expert thought organizer. Analyze this conversation and classify the user's thoughts into one of these categories:

**DOT**: Random insights, individual learnings, standalone thoughts that don't require complex structure
**WHEEL**: Goal-oriented thoughts that could cluster with other related thoughts, have actionable steps or timelines
**CHAKRA**: High-level, purpose-driven thoughts that encompass multiple areas or strategic vision

User's Previous Patterns:
- Recent thought patterns: ${userPatterns.patterns.map(p => p.thoughtPattern).join(', ')}
- Recent topics: ${userPatterns.patterns.flatMap(p => p.preferredTopics).join(', ')}
- Recent dots: ${userPatterns.recentDots.map(d => d.summary).slice(0, 3).join('; ')}
- Recent wheels: ${userPatterns.recentWheels.map(w => w.name).join('; ')}
- Recent chakras: ${userPatterns.recentChakras.map(c => c.name).join('; ')}

Current Conversation:
${conversationContext}

Analyze the user's thoughts and classify them. Consider:
1. Complexity and scope of the thoughts
2. Whether they mention goals, timelines, or action items (suggests WHEEL)
3. Whether they discuss high-level purpose, life direction, or strategic vision (suggests CHAKRA)
4. Whether they're sharing individual insights or learnings (suggests DOT)
5. How this fits with their historical patterns

Respond with JSON:
{
  "type": "dot" | "wheel" | "chakra" | "exploring",
  "confidence": number (0-1),
  "reasoning": "detailed explanation of classification",
  "suggestedStructure": {
    "title": "suggested title for the structure",
    "timeline": "suggested timeline if applicable",
    "relatedTopics": ["topic1", "topic2"],
    "potentialConnections": ["connection to existing dots/wheels/chakras"]
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: classificationPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const classification = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      type: classification.type || 'exploring',
      confidence: classification.confidence || 0.5,
      reasoning: classification.reasoning || "Unable to classify",
      suggestedStructure: classification.suggestedStructure || {}
    };
  } catch (error) {
    console.error('Error classifying thoughts:', error);
    return {
      type: 'exploring',
      confidence: 0.1,
      reasoning: "Classification error occurred"
    };
  }
}

/**
 * Generate intelligent conversation guidance based on thought classification
 */
async function generateConversationGuidance(
  classification: ThoughtClassification,
  messages: OrganizeThoughtsMessage[],
  userPatterns: any
): Promise<string> {
  const conversationContext = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
  
  let guidancePrompt = `You are DotSpark's thought organization assistant. Based on the classification of the user's thoughts as "${classification.type}" (confidence: ${classification.confidence}), guide them through organizing their thoughts.

User's Context:
- Classification: ${classification.type} (${classification.reasoning})
- Recent conversation:
${conversationContext}

Your Response Guidelines:
- Be conversational and supportive
- Ask intelligent follow-up questions to help organize their thoughts
- Guide them toward the specific structure (${classification.type})
- Don't reveal the classification directly - guide naturally
- Keep responses concise but insightful
- Reference their patterns subtly when relevant

`;

  if (classification.type === 'dot') {
    guidancePrompt += `
Since this appears to be a DOT (individual insight), help them:
1. Clarify the core insight
2. Understand why it's meaningful to them
3. Identify the emotional connection
4. Capture it in a structured way

Ask questions that help them distill their insight into a clear, memorable format.`;

  } else if (classification.type === 'wheel') {
    guidancePrompt += `
Since this appears to be a WHEEL (goal-oriented thoughts), help them:
1. Identify the central goal or theme
2. Explore related sub-goals or action items
3. Discuss timelines and milestones
4. Connect to their broader objectives

Ask questions that help them structure this as an actionable goal system.`;

  } else if (classification.type === 'chakra') {
    guidancePrompt += `
Since this appears to be a CHAKRA (purpose-driven vision), help them:
1. Clarify the overarching purpose or vision
2. Identify the key areas or domains it encompasses
3. Explore how different aspects connect
4. Consider the strategic importance

Ask questions that help them structure this as a comprehensive life/work area.`;

  } else {
    guidancePrompt += `
The user is still exploring their thoughts. Help them:
1. Clarify what they're thinking about
2. Understand the significance to them
3. Identify patterns or themes
4. Determine the appropriate structure

Ask open-ended questions that help them organize their thinking.`;
  }

  guidancePrompt += `\n\nProvide a helpful, conversational response (max 150 words) that guides them forward in organizing their thoughts.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: guidancePrompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "Tell me more about what's on your mind, and I'll help you organize these thoughts.";
  } catch (error) {
    console.error('Error generating conversation guidance:', error);
    return "I'm here to help you organize your thoughts. Can you tell me more about what you're thinking about?";
  }
}

/**
 * Generate organized thought summary with visual preview
 */
async function generateOrganizedSummary(
  classification: ThoughtClassification,
  messages: OrganizeThoughtsMessage[],
  userPatterns: any
): Promise<OrganizedThoughtSummary> {
  const conversationContent = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n\n');

  let structurePrompt = `Based on this conversation, create a structured organization of the user's thoughts as a ${classification.type.toUpperCase()}.

Conversation:
${conversationContent}

Classification: ${classification.type} (${classification.reasoning})

`;

  if (classification.type === 'dot') {
    structurePrompt += `
Create a DOT structure with:
- Summary: Core insight (max 220 chars)
- Anchor: Context for future recall (max 300 chars)  
- Pulse: One emotion word (excited, curious, focused, happy, calm, inspired, confident, grateful, motivated)

Respond with JSON:
{
  "structuredData": {
    "dots": [{
      "summary": "core insight in user's voice",
      "anchor": "context that helps them remember/apply this",
      "pulse": "emotion_word"
    }]
  },
  "visualSummary": "Beautiful text summary of how this insight is organized"
}`;

  } else if (classification.type === 'wheel') {
    structurePrompt += `
Create a WHEEL structure with:
- Name: Clear goal/theme name
- Goals: Specific objectives or focus areas
- Timeline: Realistic timeframe
- Related dots: Supporting insights/actions

Respond with JSON:
{
  "structuredData": {
    "wheels": [{
      "name": "clear wheel name",
      "goals": "specific goals and objectives",
      "timeline": "realistic timeframe",
      "dots": [
        {
          "summary": "supporting insight 1",
          "anchor": "how this supports the goal",
          "pulse": "emotion_word"
        }
      ]
    }]
  },
  "visualSummary": "Beautiful text summary of how this goal system is organized"
}`;

  } else if (classification.type === 'chakra') {
    structurePrompt += `
Create a CHAKRA structure with:
- Name: High-level purpose/vision name
- Purpose: Core purpose or strategic direction
- Related wheels: Supporting goal areas

Respond with JSON:
{
  "structuredData": {
    "chakras": [{
      "name": "chakra name",
      "purpose": "overarching purpose/vision",
      "wheels": [
        {
          "name": "supporting area 1",
          "goals": "specific goals for this area",
          "timeline": "timeframe"
        }
      ]
    }]
  },
  "visualSummary": "Beautiful text summary of how this strategic vision is organized"
}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: structurePrompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 600,
    });

    const organized = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      classification,
      structuredData: organized.structuredData || {},
      visualSummary: organized.visualSummary || "Your thoughts have been organized and are ready to save.",
      userConfirmationNeeded: true
    };
  } catch (error) {
    console.error('Error generating organized summary:', error);
    return {
      classification,
      structuredData: {},
      visualSummary: "I've organized your thoughts and they're ready to save to your grid.",
      userConfirmationNeeded: true
    };
  }
}

/**
 * Save organized thoughts to the database
 */
async function saveOrganizedThoughts(
  userId: number,
  organizedSummary: OrganizedThoughtSummary,
  sessionId: string
): Promise<{ success: boolean; message: string; savedItems: Array<{ type: string; id: number; name: string }> }> {
  try {
    const savedItems: Array<{ type: string; id: number; name: string }> = [];
    
    // Save dots
    if (organizedSummary.structuredData.dots) {
      for (const dotData of organizedSummary.structuredData.dots) {
        const [savedDot] = await db.insert(dots).values({
          userId,
          summary: dotData.summary,
          anchor: dotData.anchor,
          pulse: dotData.pulse,
          sourceType: 'text',
          captureMode: 'ai'
        }).returning();
        
        savedItems.push({ type: 'dot', id: savedDot.id, name: dotData.summary.substring(0, 50) });
      }
    }
    
    // Save wheels
    if (organizedSummary.structuredData.wheels) {
      for (const wheelData of organizedSummary.structuredData.wheels) {
        const [savedWheel] = await db.insert(wheels).values({
          userId,
          name: wheelData.name,
          goals: wheelData.goals,
          timeline: wheelData.timeline,
          category: 'Personal', // Default category
          color: '#EA580C' // Orange for wheels
        }).returning();
        
        savedItems.push({ type: 'wheel', id: savedWheel.id, name: wheelData.name });
        
        // Save associated dots
        if (wheelData.dots) {
          for (const dotData of wheelData.dots) {
            await db.insert(dots).values({
              userId,
              summary: dotData.summary,
              anchor: dotData.anchor,
              pulse: dotData.pulse,
              wheelId: savedWheel.id,
              sourceType: 'text',
              captureMode: 'ai'
            });
          }
        }
      }
    }
    
    // Save chakras
    if (organizedSummary.structuredData.chakras) {
      for (const chakraData of organizedSummary.structuredData.chakras) {
        const [savedChakra] = await db.insert(wheels).values({
          userId,
          name: chakraData.name,
          purpose: chakraData.purpose,
          category: 'Strategic', // Default category for chakras
          color: '#B45309' // Dark amber for chakras
        }).returning();
        
        savedItems.push({ type: 'chakra', id: savedChakra.id, name: chakraData.name });
        
        // Save associated wheels
        if (chakraData.wheels) {
          for (const wheelData of chakraData.wheels) {
            await db.insert(wheels).values({
              userId,
              name: wheelData.name,
              goals: wheelData.goals,
              timeline: wheelData.timeline,
              chakraId: savedChakra.id,
              category: 'Personal',
              color: '#EA580C'
            });
          }
        }
      }
    }
    
    // Update conversation session status
    await db.update(conversationSessions)
      .set({ 
        status: 'completed',
        organizationSummary: organizedSummary.visualSummary,
        updatedAt: new Date()
      })
      .where(eq(conversationSessions.sessionId, sessionId));
    
    return {
      success: true,
      message: `Successfully saved ${savedItems.length} items to your grid!`,
      savedItems
    };
    
  } catch (error) {
    console.error('Error saving organized thoughts:', error);
    return {
      success: false,
      message: "I encountered an error while saving your organized thoughts. Please try again.",
      savedItems: []
    };
  }
}

/**
 * Update user pattern memory based on conversation
 */
async function updateUserPatterns(
  userId: number,
  classification: ThoughtClassification,
  messages: OrganizeThoughtsMessage[]
): Promise<void> {
  try {
    // Extract keywords from user messages
    const userContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');
    
    // Simple keyword extraction (in production, could use more sophisticated NLP)
    const keywords = userContent
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'have', 'been', 'they', 'will'].includes(word))
      .slice(0, 10);
    
    // Check if pattern exists
    const existingPattern = await db.query.userPatternMemory.findFirst({
      where: and(
        eq(userPatternMemory.userId, userId),
        eq(userPatternMemory.thoughtPattern, classification.type)
      )
    });
    
    if (existingPattern) {
      // Merge keywords
      const existingKeywords = JSON.parse(existingPattern.keywords || '[]');
      const mergedKeywords = [...new Set([...existingKeywords, ...keywords])].slice(0, 20);
      
      await db.update(userPatternMemory)
        .set({
          keywords: JSON.stringify(mergedKeywords),
          lastUpdated: new Date()
        })
        .where(eq(userPatternMemory.id, existingPattern.id));
    } else {
      // Create new pattern
      await db.insert(userPatternMemory).values({
        userId,
        thoughtPattern: classification.type,
        keywords: JSON.stringify(keywords),
        conversationStyle: messages.length > 8 ? 'detailed' : 'brief'
      });
    }
  } catch (error) {
    console.error('Error updating user patterns:', error);
  }
}

/**
 * Main function to handle "Organize Thoughts" special prompt
 */
export async function handleOrganizeThoughts(
  userInput: string,
  userId: number | null,
  sessionId: string,
  conversationStep: 'initial' | 'exploring' | 'organizing' | 'confirming' = 'initial'
): Promise<{
  response: string;
  nextStep: 'exploring' | 'organizing' | 'confirming' | 'completed';
  organizedSummary?: OrganizedThoughtSummary;
  saveResult?: { success: boolean; message: string; savedItems: Array<{ type: string; id: number; name: string }> };
}> {
  
  try {
    // Get or create conversation session
    let session = await db.query.conversationSessions.findFirst({
      where: eq(conversationSessions.sessionId, sessionId)
    });
    
    if (!session) {
      await db.insert(conversationSessions).values({
        userId,
        sessionId,
        thoughtType: 'exploring',
        conversationData: JSON.stringify([])
      });
      
      session = await db.query.conversationSessions.findFirst({
        where: eq(conversationSessions.sessionId, sessionId)
      });
    }
    
    // Parse existing conversation
    const messages: OrganizeThoughtsMessage[] = JSON.parse(session?.conversationData || '[]');
    
    // Add new user message
    messages.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });
    
    // Get user patterns if authenticated
    const userPatterns = userId ? await getUserPatterns(userId) : { patterns: [], recentDots: [], recentWheels: [], recentChakras: [] };
    
    // Handle different conversation steps
    if (conversationStep === 'initial' || conversationStep === 'exploring') {
      // Classify thoughts and generate guidance
      const classification = await classifyThoughts(messages, userPatterns);
      const guidance = await generateConversationGuidance(classification, messages, userPatterns);
      
      // Add assistant response to conversation
      messages.push({
        role: 'assistant',
        content: guidance,
        timestamp: new Date()
      });
      
      // Update session
      await db.update(conversationSessions)
        .set({
          thoughtType: classification.type,
          conversationData: JSON.stringify(messages),
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.sessionId, sessionId));
      
      // Determine next step based on classification confidence and conversation depth
      const nextStep = classification.confidence > 0.7 && messages.length > 6 ? 'organizing' : 'exploring';
      
      return {
        response: guidance,
        nextStep
      };
      
    } else if (conversationStep === 'organizing') {
      // Generate organized summary
      const classification = await classifyThoughts(messages, userPatterns);
      const organizedSummary = await generateOrganizedSummary(classification, messages, userPatterns);
      
      // Update user patterns
      if (userId) {
        await updateUserPatterns(userId, classification, messages);
      }
      
      const summaryResponse = `Perfect! I've organized your thoughts. Here's how I've structured them:

${organizedSummary.visualSummary}

Would you like me to save this to your grid, or would you like to adjust anything first?`;
      
      // Add assistant response
      messages.push({
        role: 'assistant',
        content: summaryResponse,
        timestamp: new Date()
      });
      
      // Update session
      await db.update(conversationSessions)
        .set({
          conversationData: JSON.stringify(messages),
          organizationSummary: organizedSummary.visualSummary,
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.sessionId, sessionId));
      
      return {
        response: summaryResponse,
        nextStep: 'confirming',
        organizedSummary
      };
      
    } else if (conversationStep === 'confirming') {
      // User is confirming to save
      if (userInput.toLowerCase().includes('save') || userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('looks good')) {
        
        if (!userId) {
          return {
            response: "I'd love to save your organized thoughts, but you'll need to sign in first. Once you're signed in, I can save everything to your personal grid!",
            nextStep: 'completed'
          };
        }
        
        // Get the organized summary from session
        const classification = await classifyThoughts(messages, userPatterns);
        const organizedSummary = await generateOrganizedSummary(classification, messages, userPatterns);
        
        // Save to database
        const saveResult = await saveOrganizedThoughts(userId, organizedSummary, sessionId);
        
        const finalResponse = saveResult.success 
          ? `✅ ${saveResult.message}\n\nYour organized thoughts are now in your grid and ready to help spark new insights! You can find them in your dashboard.`
          : `❌ ${saveResult.message}`;
        
        return {
          response: finalResponse,
          nextStep: 'completed',
          saveResult
        };
        
      } else {
        // User wants to modify
        const modificationGuidance = "What would you like to adjust about how I've organized your thoughts? I can restructure them differently or focus on specific aspects.";
        
        messages.push({
          role: 'assistant',
          content: modificationGuidance,
          timestamp: new Date()
        });
        
        await db.update(conversationSessions)
          .set({
            conversationData: JSON.stringify(messages),
            updatedAt: new Date()
          })
          .where(eq(conversationSessions.sessionId, sessionId));
        
        return {
          response: modificationGuidance,
          nextStep: 'organizing'
        };
      }
    }
    
    // Default fallback
    return {
      response: "I'm here to help you organize your thoughts. What's on your mind?",
      nextStep: 'exploring'
    };
    
  } catch (error) {
    console.error('Error in handleOrganizeThoughts:', error);
    return {
      response: "I encountered an error while organizing your thoughts. Let's try again - what would you like to organize?",
      nextStep: 'exploring'
    };
  }
}