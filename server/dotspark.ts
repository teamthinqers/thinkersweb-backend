import { db } from '@db';
import { entries, categories, tags, entryTags } from '@shared/schema';
import { sql, eq, and, desc, like } from 'drizzle-orm';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * DotSpark core functionality
 * This module implements the core DotSpark capabilities
 * that learn from user interactions and provide intelligent insights
 * 
 * DotSpark functions as a tunable extended brain that adapts to each
 * user's unique thought patterns and can be customized and upgraded
 * with gamified elements
 */

// Interface for topic connections (neural pathways)
interface TopicConnection {
  topic: string;
  relatedTopics: string[];
  strength: number; // 0.0 to 1.0
}

// Interface for pattern detection
interface DetectedPattern {
  pattern: string;
  examples: string[];
  frequency: number;
  lastDetected: Date;
}

// Interface for user insights
interface UserInsight {
  insight: string;
  confidence: number; // 0.0 to 1.0
  topics: string[];
  generatedAt: Date;
}

// DotSpark tuning parameters - allows users to customize how their DotSpark works
interface DotSparkTuning {
  // Core processing parameters
  creativity: number; // 0.0 to 1.0 - affects response variety and uniqueness
  precision: number;  // 0.0 to 1.0 - affects factual accuracy and detail level
  speed: number;      // 0.0 to 1.0 - affects response time vs. depth tradeoff
  cognitivePace: number; // 0.0 to 1.0 - how fast brain processes and switches between thoughts
  signalFocus: number; // 0.0 to 1.0 - narrow beam (0.0) vs wide scanner (1.0) focus style
  
  // Cognitive style parameters
  analytical: number; // 0.0 to 1.0 - logical/systematic thinking emphasis
  intuitive: number;  // 0.0 to 1.0 - pattern recognition/insight emphasis
  
  // Specialty focus areas (weights for different domains)
  specialties: {
    [domain: string]: number; // 0.0 to 1.0 - e.g., "science", "business", "creative"
  };
  
  // Active learning directives - what the extension should prioritize learning
  learningFocus: string[];
}

// Gamification elements for DotSpark
interface NeuralGameElements {
  level: number;              // Overall DotSpark level
  experience: number;         // XP towards next level
  experienceRequired: number; // XP required for next level
  
  // Unlocked capabilities
  unlockedCapabilities: string[];
  
  // Achievements
  achievements: {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: Date;
    progress: number; // 0.0 to 1.0
  }[];
  
  // Neural stats
  stats: {
    messagesProcessed: number;
    insightsGenerated: number;
    connectionsFormed: number;
    adaptationScore: number; // 0.0 to 100.0
  };
}

// Keep track of per-user topic connections (neural pathways)
const userTopicConnections = new Map<number, TopicConnection[]>();

// Keep track of detected patterns in user conversations
const userPatterns = new Map<number, DetectedPattern[]>();

// Store generated insights
const userInsights = new Map<number, UserInsight[]>();

// Store user-specific DotSpark tuning parameters
const userDotSparkTuning = new Map<number, DotSparkTuning>();

// Store gamification elements for each user
const userGameElements = new Map<number, NeuralGameElements>();

// Default DotSpark tuning parameters
const DEFAULT_DOTSPARK_TUNING: DotSparkTuning = {
  creativity: 0.5,
  precision: 0.5,
  speed: 0.5,
  analytical: 0.5,
  intuitive: 0.5,
  specialties: {
    general: 1.0,
    business: 0.5,
    technology: 0.5,
    science: 0.5,
    arts: 0.5,
    personal: 0.5
  },
  learningFocus: []
};

// Default game elements
const DEFAULT_GAME_ELEMENTS: NeuralGameElements = {
  level: 1,
  experience: 0,
  experienceRequired: 100,
  unlockedCapabilities: ['basic-responses', 'pattern-detection'],
  achievements: [
    {
      id: 'first-conversation',
      name: 'First Contact',
      description: 'Start your first conversation with your DotSpark',
      unlocked: false,
      progress: 0
    },
    {
      id: 'regular-user',
      name: 'Neural Sync',
      description: 'Use your DotSpark for 5 consecutive days',
      unlocked: false,
      progress: 0
    },
    {
      id: 'deep-thinker',
      name: 'Deep Thinker',
      description: 'Have 10 meaningful conversations on complex topics',
      unlocked: false,
      progress: 0
    },
    {
      id: 'neural-tuner',
      name: 'Neural Tuner',
      description: 'Customize your DotSpark settings',
      unlocked: false,
      progress: 0
    },
    {
      id: 'insight-collector',
      name: 'Insight Collector',
      description: 'Collect 5 insights from your DotSpark',
      unlocked: false,
      progress: 0
    }
  ],
  stats: {
    messagesProcessed: 0,
    insightsGenerated: 0,
    connectionsFormed: 0,
    adaptationScore: 0
  }
};

/**
 * Record a user interaction for learning purposes
 * @param userId User ID
 * @param message User message
 */
export async function recordUserInteraction(userId: number, message: string): Promise<void> {
  try {
    // Extract topics from the message
    const topics = await extractTopics(message);
    
    // Update topic connections
    await updateTopicConnections(userId, topics);
    
    // Detect patterns in user behavior
    await detectPatterns(userId, message);
    
    console.log(`Recorded interaction for user ${userId} with topics: ${topics.join(', ')}`);
  } catch (error) {
    console.error('Error recording user interaction:', error);
  }
}

/**
 * Extract main topics from a message
 * @param message User message
 * @returns Array of detected topics
 */
async function extractTopics(message: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `Extract the main topics discussed in the following message. 
                   Respond with a JSON array of topic strings. Only include substantive topics, 
                   not conversational elements. For example, from "I'm learning about quantum physics 
                   and its applications in cryptography", extract ["quantum physics", "cryptography"].
                   Return only the JSON array with no additional text.`
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse response
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.topics) ? parsed.topics : [];
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
}

/**
 * Update topic connections for a user
 * @param userId User ID
 * @param newTopics New topics from the latest interaction
 */
async function updateTopicConnections(userId: number, newTopics: string[]): Promise<void> {
  // Get existing connections or initialize
  if (!userTopicConnections.has(userId)) {
    userTopicConnections.set(userId, []);
  }
  
  const connections = userTopicConnections.get(userId)!;
  
  // Update existing topics and add connections
  for (const topic of newTopics) {
    // Find or create topic
    let topicConnection = connections.find(t => t.topic.toLowerCase() === topic.toLowerCase());
    
    if (!topicConnection) {
      topicConnection = {
        topic,
        relatedTopics: [],
        strength: 0.5
      };
      connections.push(topicConnection);
    } else {
      // Strengthen existing topic
      topicConnection.strength = Math.min(1.0, topicConnection.strength + 0.1);
    }
    
    // Connect with other topics in the same message
    for (const relatedTopic of newTopics) {
      if (relatedTopic !== topic && 
          !topicConnection.relatedTopics.includes(relatedTopic)) {
        topicConnection.relatedTopics.push(relatedTopic);
      }
    }
  }
  
  // Save updated connections
  userTopicConnections.set(userId, connections);
}

/**
 * Detect patterns in user messages
 * @param userId User ID
 * @param message Latest user message
 */
async function detectPatterns(userId: number, message: string): Promise<void> {
  // Get existing patterns or initialize
  if (!userPatterns.has(userId)) {
    userPatterns.set(userId, []);
  }
  
  const patterns = userPatterns.get(userId)!;
  
  // Use AI to detect if this message fits an existing pattern or creates a new one
  try {
    // Simple pattern matching based on message format and content
    // This is a placeholder - in a real implementation, we would use more sophisticated
    // pattern recognition techniques
    
    // For now, check if the message is a question, statement, or command
    let patternType = '';
    if (message.trim().endsWith('?')) {
      patternType = 'question';
    } else if (message.toLowerCase().includes('i learned') || 
               message.toLowerCase().includes('i discovered')) {
      patternType = 'learning_statement';
    } else if (message.toLowerCase().includes('help me') || 
               message.toLowerCase().startsWith('find')) {
      patternType = 'request_for_assistance';
    } else {
      patternType = 'general_statement';
    }
    
    // Check if pattern exists
    let pattern = patterns.find(p => p.pattern === patternType);
    
    if (!pattern) {
      // Create new pattern
      pattern = {
        pattern: patternType,
        examples: [message],
        frequency: 1,
        lastDetected: new Date()
      };
      patterns.push(pattern);
    } else {
      // Update existing pattern
      pattern.examples.push(message);
      pattern.frequency += 1;
      pattern.lastDetected = new Date();
      
      // Keep only the 10 most recent examples
      if (pattern.examples.length > 10) {
        pattern.examples = pattern.examples.slice(-10);
      }
    }
    
    // Save updated patterns
    userPatterns.set(userId, patterns);
  } catch (error) {
    console.error('Error detecting patterns:', error);
  }
}

/**
 * Generate insights based on user's history and patterns
 * @param userId User ID
 * @returns Generated insights
 */
export async function generateUserInsights(userId: number): Promise<UserInsight[]> {
  try {
    // Get user's topic connections
    const connections = userTopicConnections.get(userId) || [];
    
    // Get user's detected patterns
    const patterns = userPatterns.get(userId) || [];
    
    // If we don't have enough data, return empty insights
    if (connections.length < 2 && patterns.length < 2) {
      return [];
    }
    
    // Get user's recent entries from database
    const recentEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      orderBy: [desc(entries.createdAt)],
      limit: 10
    });
    
    // Prepare data for insight generation
    const topicsData = connections.map(c => ({
      topic: c.topic,
      strength: c.strength,
      relatedTopics: c.relatedTopics.join(', ')
    }));
    
    const patternsData = patterns.map(p => ({
      pattern: p.pattern,
      frequency: p.frequency,
      examples: p.examples.slice(0, 3).join(' | ')
    }));
    
    const entriesData = recentEntries.map(e => ({
      title: e.title,
      snippet: e.content.substring(0, 100) + '...'
    }));
    
    // Generate insights using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an insight generation system. Based on the user's topics, patterns, and entries,
                   generate 3-5 meaningful insights about their interests, learning patterns, and potential
                   areas they might want to explore further. Each insight should be concise but specific.
                   
                   Respond with a JSON array of insight objects with the following format:
                   [
                     {
                       "insight": "The specific insight text",
                       "confidence": 0.8, // between 0 and 1
                       "topics": ["topic1", "topic2"] // related topics
                     }
                   ]
                   
                   Do not add any text before or after the JSON.`
        },
        {
          role: "user",
          content: `Generate insights based on this user data:
                   
                   TOPICS: ${JSON.stringify(topicsData)}
                   
                   PATTERNS: ${JSON.stringify(patternsData)}
                   
                   RECENT ENTRIES: ${JSON.stringify(entriesData)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse response
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.insights)) return [];
    
    // Create insight objects
    const insights: UserInsight[] = parsed.insights.map((insight: any) => ({
      insight: insight.insight,
      confidence: insight.confidence,
      topics: insight.topics,
      generatedAt: new Date()
    }));
    
    // Store insights
    userInsights.set(userId, insights);
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

/**
 * Get recommended topics based on user's history
 * @param userId User ID
 * @returns Recommended topics
 */
export async function getRecommendedTopics(userId: number): Promise<string[]> {
  try {
    // Get user's topic connections
    const connections = userTopicConnections.get(userId) || [];
    
    // If no connections, return empty array
    if (connections.length === 0) {
      return [];
    }
    
    // Find strongest topics
    const strongTopics = connections
      .filter(c => c.strength > 0.7)
      .map(c => c.topic);
    
    // If no strong topics, use top 3 by strength
    const topTopics = strongTopics.length > 0 ? 
      strongTopics : 
      connections
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map(c => c.topic);
    
    // Use OpenAI to suggest related topics
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `Based on the user's strong interest topics, suggest 3-5 related topics they might
                   be interested in exploring. These should be specific and substantive, not just
                   variations of the existing topics.
                   
                   Respond with a JSON array of strings containing only the topic names.
                   Do not add any text before or after the JSON.`
        },
        {
          role: "user",
          content: `The user is interested in these topics: ${topTopics.join(', ')}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    
    // Parse response
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.topics) ? parsed.topics : [];
  } catch (error) {
    console.error('Error getting recommended topics:', error);
    return [];
  }
}

/**
 * Adapt responses based on user preferences and history
 * @param userId User ID
 * @param baseResponse The initial response
 * @param context The context of the conversation
 * @returns Adapted response
 */
export async function adaptResponseToUser(
  userId: number, 
  baseResponse: string, 
  context: {
    message: string;
    isQuestion: boolean;
  }
): Promise<string> {
  try {
    // Get user's patterns
    const patterns = userPatterns.get(userId) || [];
    
    // Calculate user preferences
    const preferences = {
      detailedResponses: false,
      technicalLanguage: false,
      practicalExamples: false,
      conversationalStyle: true
    };
    
    // Analyze patterns to determine preferences
    if (patterns.length > 0) {
      // Check for detailed questions pattern
      const detailedQuestions = patterns.find(p => 
        p.pattern === 'question' && 
        p.examples.some(e => e.length > 100)
      );
      if (detailedQuestions && detailedQuestions.frequency > 3) {
        preferences.detailedResponses = true;
      }
      
      // Check for technical language pattern
      const technicalTerms = [
        'algorithm', 'implementation', 'methodology', 'framework',
        'architecture', 'infrastructure', 'paradigm', 'protocol',
        'integration', 'deployment', 'optimization'
      ];
      
      const usesTechnicalLanguage = patterns.some(p => 
        p.examples.some(e => 
          technicalTerms.some(term => 
            e.toLowerCase().includes(term)
          )
        )
      );
      
      if (usesTechnicalLanguage) {
        preferences.technicalLanguage = true;
      }
      
      // Check for practical application focus
      const practicalFocus = patterns.some(p =>
        p.examples.some(e =>
          e.toLowerCase().includes('how to') ||
          e.toLowerCase().includes('example') ||
          e.toLowerCase().includes('implement') ||
          e.toLowerCase().includes('apply')
        )
      );
      
      if (practicalFocus) {
        preferences.practicalExamples = true;
      }
    }
    
    // Use OpenAI to adapt the response according to user preferences
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a response adaptation system. Your task is to adapt the given response
                   to better match the user's preferences and communication style.
                   
                   User preferences:
                   - Detailed responses: ${preferences.detailedResponses ? 'Yes' : 'No'}
                   - Technical language: ${preferences.technicalLanguage ? 'Yes' : 'No'}
                   - Practical examples: ${preferences.practicalExamples ? 'Yes' : 'No'}
                   - Conversational style: ${preferences.conversationalStyle ? 'Yes' : 'No'}
                   
                   Adapt the response while maintaining its core information and intent.
                   If the user prefers detailed responses, expand on key points.
                   If the user prefers technical language, use more precise terminology.
                   If the user likes practical examples, include or enhance examples.
                   If the user prefers conversational style, make the tone more friendly.
                   
                   The adaptation should be seamless and feel natural, not forced.`
        },
        {
          role: "user",
          content: `Original user message: "${context.message}"
                   
                   Original response: "${baseResponse}"
                   
                   Please adapt this response to better match the user's preferences.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content || baseResponse;
  } catch (error) {
    console.error('Error adapting response:', error);
    return baseResponse; // Fall back to original response
  }
}

/**
 * Get or initialize the DotSpark tuning parameters for a user
 * @param userId User ID
 * @returns DotSpark tuning parameters
 */
export function getDotSparkTuning(userId: number): DotSparkTuning {
  // If user doesn't have tuning parameters yet, initialize with defaults
  if (!userDotSparkTuning.has(userId)) {
    userDotSparkTuning.set(userId, { ...DEFAULT_DOTSPARK_TUNING });
  }
  
  return userDotSparkTuning.get(userId)!;
}

/**
 * Update a user's DotSpark tuning parameters
 * @param userId User ID
 * @param tuningParams New tuning parameters (partial update supported)
 * @returns Updated DotSpark tuning parameters
 */
export function updateDotSparkTuning(
  userId: number, 
  tuningParams: Partial<DotSparkTuning>
): DotSparkTuning {
  // Get current parameters or initialize with defaults
  const currentParams = getDotSparkTuning(userId);
  
  // Update with new parameters (partial update)
  const updatedParams: DotSparkTuning = {
    ...currentParams,
    ...tuningParams,
    // Handle nested objects specially
    specialties: {
      ...currentParams.specialties,
      ...(tuningParams.specialties || {})
    },
    // Handle arrays specially
    learningFocus: tuningParams.learningFocus || currentParams.learningFocus
  };
  
  // Store updated parameters
  userDotSparkTuning.set(userId, updatedParams);
  
  // Check if this is the first time tuning - unlock achievement
  const gameElements = getGameElements(userId);
  const tunerAchievement = gameElements.achievements.find(a => a.id === 'neural-tuner');
  if (tunerAchievement && !tunerAchievement.unlocked) {
    tunerAchievement.unlocked = true;
    tunerAchievement.unlockedAt = new Date();
    tunerAchievement.progress = 1.0;
    
    // Update game elements
    updateGameElements(userId, {
      achievements: gameElements.achievements,
      experience: gameElements.experience + 25 // Bonus XP for tuning
    });
    
    console.log(`🏆 Neural Tuner achievement unlocked for user ${userId}`);
  }
  
  return updatedParams;
}

/**
 * Get or initialize game elements for a user
 * @param userId User ID
 * @returns Game elements
 */
export function getGameElements(userId: number): NeuralGameElements {
  // If user doesn't have game elements yet, initialize with defaults
  if (!userGameElements.has(userId)) {
    userGameElements.set(userId, JSON.parse(JSON.stringify(DEFAULT_GAME_ELEMENTS)));
  }
  
  return userGameElements.get(userId)!;
}

/**
 * Update a user's game elements
 * @param userId User ID
 * @param elements New game elements (partial update supported)
 * @returns Updated game elements
 */
export function updateGameElements(
  userId: number, 
  elements: Partial<NeuralGameElements>
): NeuralGameElements {
  // Get current elements or initialize with defaults
  const currentElements = getGameElements(userId);
  
  // Update with new elements (partial update)
  const updatedElements: NeuralGameElements = {
    ...currentElements,
    ...elements,
    // Handle nested objects specially
    stats: {
      ...currentElements.stats,
      ...(elements.stats || {})
    },
    // Handle arrays specially
    unlockedCapabilities: elements.unlockedCapabilities || currentElements.unlockedCapabilities,
    achievements: elements.achievements || currentElements.achievements
  };
  
  // Check for level up
  if (
    updatedElements.experience >= updatedElements.experienceRequired && 
    updatedElements.level < 10 // Max level cap
  ) {
    updatedElements.level += 1;
    updatedElements.experience -= updatedElements.experienceRequired;
    updatedElements.experienceRequired = Math.floor(updatedElements.experienceRequired * 1.5); // Increase XP requirement
    
    // Unlock new capabilities based on level
    if (updatedElements.level === 2 && !updatedElements.unlockedCapabilities.includes('topic-insights')) {
      updatedElements.unlockedCapabilities.push('topic-insights');
    } else if (updatedElements.level === 3 && !updatedElements.unlockedCapabilities.includes('neural-tuning')) {
      updatedElements.unlockedCapabilities.push('neural-tuning');
    } else if (updatedElements.level === 5 && !updatedElements.unlockedCapabilities.includes('advanced-insights')) {
      updatedElements.unlockedCapabilities.push('advanced-insights');
    }
    
    console.log(`🎉 User ${userId} leveled up to Neural Extension Level ${updatedElements.level}!`);
  }
  
  // Store updated elements
  userGameElements.set(userId, updatedElements);
  
  return updatedElements;
}

/**
 * Award experience points to a user's DotSpark
 * @param userId User ID
 * @param amount Amount of XP to award
 * @param reason Reason for the XP award (for logging)
 * @returns Updated game elements
 */
export function awardExperience(
  userId: number, 
  amount: number, 
  reason: string
): NeuralGameElements {
  console.log(`🧠 Awarding ${amount} XP to user ${userId} for: ${reason}`);
  
  const gameElements = getGameElements(userId);
  return updateGameElements(userId, {
    experience: gameElements.experience + amount
  });
}

/**
 * Get the DotSpark status for a user
 * @param userId User ID
 * @returns Status information
 */
export function getDotSparkStatus(userId: number): {
  isActive: boolean;
  topicsTracked: number;
  patternsDetected: number;
  insightsGenerated: number;
  adaptationLevel: number; // 0.0 to 1.0
  tuning: DotSparkTuning;
  gameElements: NeuralGameElements;
} {
  // Get user data
  const connections = userTopicConnections.get(userId) || [];
  const patterns = userPatterns.get(userId) || [];
  const insights = userInsights.get(userId) || [];
  const tuning = getDotSparkTuning(userId);
  const gameElements = getGameElements(userId);
  
  // Calculate adaptation level based on amount of data collected
  const connectionScore = Math.min(connections.length / 10, 1);
  const patternScore = Math.min(patterns.length / 5, 1);
  const insightScore = Math.min(insights.length / 3, 1);
  
  const adaptationLevel = (connectionScore + patternScore + insightScore) / 3;
  
  // Update adaptation score in game elements
  if (gameElements.stats.adaptationScore !== Math.round(adaptationLevel * 100)) {
    gameElements.stats.adaptationScore = Math.round(adaptationLevel * 100);
    userGameElements.set(userId, gameElements);
  }
  
  return {
    isActive: connections.length > 0 || patterns.length > 0,
    topicsTracked: connections.length,
    patternsDetected: patterns.length,
    insightsGenerated: insights.length,
    adaptationLevel,
    tuning,
    gameElements
  };
}