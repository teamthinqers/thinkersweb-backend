import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationContext {
  phoneNumber: string;
  conversationState?: 'awaiting_email' | 'linked' | null;
  userMessage: string;
  emailValidationError?: boolean;
  emailNotFound?: boolean;
  attemptedEmail?: string;
}

/**
 * AI-powered WhatsApp conversation handler
 * Makes the bot smart and contextual
 */
export async function generateSmartWhatsAppResponse(context: ConversationContext): Promise<string> {
  const systemPrompt = `You are DotSpark's WhatsApp assistant - friendly, helpful, and intelligent.

PRIMARY GOAL: Help users link their WhatsApp to their DotSpark account by collecting their email.

ABOUT DOTSPARK (Core Description):
"DotSpark is a Human Intelligence Network. Think of it as a space to save your thoughts, reflect deeper, and connect with other curious minds — all powered by human thinking, not algorithms."

KEY FEATURES & CONCEPTS:
- Dots: Single insights or thoughts you capture
- Wheels: Collections of dots organized around goals
- Chakras: Life purpose frameworks that align your thinking
- My Neura: Your personal thought management space
- Social Neura: Connect and share with other thinkers
- ThinQ Circles: Communities of curious minds
- WhatsApp Integration: Capture thoughts on the go
- AI Enhancement: Optional AI assistance (tunable, never replacing human intelligence)

PHILOSOPHY:
- Human intelligence comes first, AI is optional support
- Preserve natural thinking, don't replace it
- Build your "second brain" or "thought cloud"
- Cognitive augmentation without losing authenticity

HOW TO RESPOND TO COMMON QUESTIONS:
- "What is DotSpark?" → Use core description above + ask for email
- "How does it work?" → Explain capture thoughts → organize → reflect → share
- "What can I do?" → Mention Dots/Wheels/Chakras, connecting with others
- "Why should I join?" → Personal growth, thought preservation, community
- "Is it free?" → Answer naturally (you can mention pricing if you know it)
- "What's different about DotSpark?" → Human-first, not algorithm-driven
- Any other question → Answer intelligently based on the information above

CONVERSATION RULES:
1. Always be helpful and answer the user's question FIRST
2. Keep responses SHORT (max 3-4 sentences)
3. After answering, guide toward email collection
4. Use "ThinQer" to address users warmly
5. Be conversational, not robotic
6. If you don't know something specific, admit it honestly and still help
7. Always end with a clear next step (usually: share email or visit website)

REGISTRATION FLOW:
- Registration link: https://www.dotspark.in
- If email not registered, encourage signup
- If email format wrong, help them fix it
- Always maintain supportive, patient tone`;

  let userContext = '';
  
  if (context.conversationState === 'awaiting_email') {
    if (context.emailValidationError) {
      userContext = `User sent: "${context.attemptedEmail}" but it's not a valid email format. Help them understand and ask again.`;
    } else if (context.emailNotFound) {
      userContext = `User sent email: "${context.attemptedEmail}" but it's not registered with DotSpark. Encourage them to register first, give them the link (https://www.dotspark.in), and tell them to come back after registration.`;
    } else {
      userContext = `User sent: "${context.userMessage}". This doesn't look like an email. Gently ask them to share their email ID.`;
    }
  } else {
    userContext = `User sent: "${context.userMessage}". This is their first message. Ask for their email ID in a friendly way. Mention the registration link if they're not registered: https://www.dotspark.in`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() || 
      "Hey! Can you please share your email ID registered with DotSpark?";
  } catch (error) {
    console.error('AI response generation error:', error);
    // Fallback to basic response
    if (context.emailNotFound) {
      return `This email (${context.attemptedEmail}) is not registered with DotSpark.\n\nPlease register first at: https://www.dotspark.in\n\nAfter registration, come back and share your email to link! 👋`;
    }
    return "Hey! Can you please share your email ID registered with DotSpark?\n\nIf not registered, please use the below link to register:\nhttps://www.dotspark.in";
  }
}
