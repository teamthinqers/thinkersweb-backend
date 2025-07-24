import axios from 'axios';

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate response using DeepSeek API
 */
export async function generateDeepSeekResponse(
  messages: DeepSeekMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
    model?: string;
  } = {}
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek API key is not configured');
  }

  try {
    const response = await axios.post<DeepSeekResponse>(
      DEEPSEEK_API_URL,
      {
        model: options.model || 'deepseek-chat',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid DeepSeek API key');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API rate limit exceeded');
      } else if (error.response?.status === 500) {
        throw new Error('DeepSeek API server error');
      }
    }
    
    throw new Error('Failed to connect to DeepSeek API');
  }
}

/**
 * Test DeepSeek API connection
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  try {
    console.log('Testing DeepSeek API connection...');
    
    const response = await generateDeepSeekResponse([
      { role: 'user', content: 'Hello, are you working?' }
    ], { max_tokens: 10 });
    
    console.log('DeepSeek connection successful:', response);
    return true;
  } catch (error) {
    console.error('DeepSeek connection test failed:', error);
    return false;
  }
}

/**
 * Generate intelligent chat response using DeepSeek
 */
export async function generateDeepSeekChatResponse(
  userInput: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  systemPrompt?: string
): Promise<string> {
  const defaultSystemPrompt = `You are DotSpark AI, an advanced AI assistant with comprehensive capabilities. You excel at:

ANALYSIS & REASONING: Break down complex problems, provide step-by-step solutions, analyze data, and offer logical reasoning for all conclusions.

KNOWLEDGE APPLICATION: Draw from extensive training across science, technology, history, literature, arts, business, and current events to provide accurate, detailed information.

CREATIVE ASSISTANCE: Help with writing, brainstorming, content creation, creative problem-solving, storytelling, and artistic projects.

PRACTICAL GUIDANCE: Offer actionable advice, detailed instructions, planning assistance, and real-world solutions tailored to user needs.

TECHNICAL EXPERTISE: Assist with programming, mathematics, engineering, research, and technical documentation with precision and clarity.

COMMUNICATION: Adapt your tone and complexity to match user expertise, ask clarifying questions, and ensure clear understanding.

Always provide thorough, accurate responses while maintaining helpfulness and professionalism.`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt || defaultSystemPrompt },
    ...conversationHistory.slice(-6).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userInput }
  ];

  return await generateDeepSeekResponse(messages, {
    temperature: 0.7,
    max_tokens: 2000
  });
}

// Test connection on module load if API key is available
if (process.env.DEEPSEEK_API_KEY) {
  testDeepSeekConnection();
} else {
  console.log('DeepSeek API key not found - DeepSeek integration disabled');
}