import OpenAI from "openai";
import { db } from "../db";
import { conversationSessions, entries } from "../shared/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OrganizeThoughtsMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Main function to handle "Organize Thoughts" with session persistence
 */
export async function handleOrganizeThoughts(
  userInput: string,
  previousMessages: any[],
  userId: number | null,
  sessionId: string,
  model: string = 'gpt-4o'
): Promise<{
  response: string;
  action?: string;
  savedItems?: Array<{ type: string; id: number; name: string }>;
  conversationState?: any;
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

    // Convert messages to our format
    const messages: OrganizeThoughtsMessage[] = [
      ...previousMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || new Date())
      })),
      {
        role: 'user' as const,
        content: userInput,
        timestamp: new Date()
      }
    ];

    // Check conversation depth
    const conversationDepth = messages.filter(m => m.role === 'user').length;
    
    // If user is ready to save or confirms saving
    if (userInput.toLowerCase().includes('save') || userInput.toLowerCase().includes('yes')) {
      // Generate a structured dot from the conversation
      const structuredDot = await generateStructuredDot(messages);
      
      if (userId && structuredDot) {
        // Save the dot
        const entryData = {
          userId,
          title: `Organized Thoughts: ${structuredDot.summary.substring(0, 30)}...`,
          content: JSON.stringify({
            dotType: 'three-layer',
            summary: structuredDot.summary,
            anchor: structuredDot.anchor,
            pulse: structuredDot.pulse,
            sourceType: 'text',
            captureMode: 'ai'
          }),
          visibility: 'private' as const
        };
        
        const [newDot] = await db.insert(entries).values(entryData).returning();
        
        // Update session
        await db.update(conversationSessions)
          .set({ status: 'saved', updatedAt: new Date() })
          .where(eq(conversationSessions.sessionId, sessionId));
        
        return {
          response: "Perfect! I've saved your organized thoughts as a structured dot. You can find it in your DotSpark dashboard. Your insights are now captured and ready to spark new connections!",
          action: 'organize_thoughts_complete',
          savedItems: [{ type: 'dot', id: newDot.id, name: structuredDot.summary }],
          conversationState: { saved: true }
        };
      }
    }
    
    // If conversation is deep enough, offer to organize
    if (conversationDepth >= 3) {
      const structuredDot = await generateStructuredDot(messages);
      
      if (structuredDot) {
        const previewMessage = `Based on our conversation, I can organize your thoughts into this structure:

**Summary:** ${structuredDot.summary}
**Anchor:** ${structuredDot.anchor}  
**Pulse:** ${structuredDot.pulse}

Would you like me to save this organized thought to your DotSpark grid? Just say "yes" or "save it" to confirm.`;
        
        // Update session
        await db.update(conversationSessions)
          .set({
            thoughtType: 'dot',
            conversationData: JSON.stringify(messages),
            organizationSummary: JSON.stringify(structuredDot),
            status: 'completed',
            updatedAt: new Date()
          })
          .where(eq(conversationSessions.sessionId, sessionId));
        
        return {
          response: previewMessage,
          action: 'organize_thoughts_preview',
          conversationState: { structuredDot, ready: true }
        };
      }
    }
    
    // Continue exploring thoughts
    const guidance = await generateGuidance(messages, conversationDepth);
    
    // Update session
    const updatedMessages = [...messages, {
      role: 'assistant' as const,
      content: guidance,
      timestamp: new Date()
    }];
    
    await db.update(conversationSessions)
      .set({
        conversationData: JSON.stringify(updatedMessages),
        updatedAt: new Date()
      })
      .where(eq(conversationSessions.sessionId, sessionId));
    
    return {
      response: guidance,
      action: 'organize_thoughts_continue',
      conversationState: { depth: conversationDepth }
    };
    
  } catch (error) {
    console.error('Error in handleOrganizeThoughts:', error);
    return {
      response: "I encountered an issue while organizing your thoughts. Let's try again - what's on your mind?",
      action: 'organize_thoughts_error',
      conversationState: { error: true }
    };
  }
}

/**
 * Generate structured dot from conversation
 */
async function generateStructuredDot(messages: OrganizeThoughtsMessage[]): Promise<{
  summary: string;
  anchor: string;
  pulse: string;
} | null> {
  try {
    const conversationContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    const prompt = `Based on this conversation, create a structured three-layer dot:

Conversation:
${conversationContent}

Create a structured response with these three layers:
1. Summary: Core insight or main point (max 220 chars)
2. Anchor: Context that helps remember/apply this (max 300 chars)
3. Pulse: One emotion word (excited, curious, focused, happy, calm, inspired, confident, grateful, motivated)

Respond with JSON:
{
  "summary": "core insight from their conversation",
  "anchor": "context that helps them remember this",
  "pulse": "emotion_word"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    if (result.summary && result.anchor && result.pulse) {
      return {
        summary: result.summary.substring(0, 220),
        anchor: result.anchor.substring(0, 300),
        pulse: result.pulse
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error generating structured dot:', error);
    return null;
  }
}

/**
 * Generate conversation guidance
 */
async function generateGuidance(messages: OrganizeThoughtsMessage[], depth: number): Promise<string> {
  try {
    const recentMessages = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `You are DotSpark's thought organization assistant. Guide this user through exploring their thoughts naturally.

Recent conversation:
${recentMessages}

Conversation depth: ${depth} messages

Guidelines:
- Be conversational and supportive
- Ask thoughtful follow-up questions
- Help them explore what's really on their mind
- Guide them toward clarity without being pushy
- Keep responses concise but insightful
- After 3+ messages, start preparing them for organization

Respond with helpful guidance to continue the conversation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "Tell me more about what's on your mind, and I'll help you organize these thoughts.";
  } catch (error) {
    console.error('Error generating guidance:', error);
    return "What's really on your mind? I'm here to help you organize your thoughts.";
  }
}