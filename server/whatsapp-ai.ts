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
  const systemPrompt = `You are DotSpark's WhatsApp assistant - friendly, helpful, and concise.

Your job is to help users link their WhatsApp to their DotSpark account by collecting their email.

RULES:
1. Keep responses SHORT (max 2-3 sentences)
2. Be friendly and conversational
3. Always end with a clear next step
4. Use "ThinQer" to address users
5. Never be robotic - be human and helpful

CONTEXT:
- If user seems confused, acknowledge and guide them
- If they make a mistake (wrong email format, typo), help them fix it
- If their email isn't registered, encourage registration with link: https://www.dotspark.in
- Always maintain a helpful, supportive tone`;

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
