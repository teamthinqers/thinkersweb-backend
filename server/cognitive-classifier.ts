import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CognitiveStructure {
  type: 'dot' | 'wheel' | 'chakra';
  confidence: number;
  reasoning: string;
  keyIndicators: string[];
  suggestedStructure: {
    heading: string;
    content: string;
    timeline?: string;
    purpose?: string;
    goals?: string;
  };
}

export interface SemanticAnalysis {
  themes: string[];
  mood: string;
  complexity: 'simple' | 'moderate' | 'complex';
  actionOriented: boolean;
  timeHorizon: 'immediate' | 'short-term' | 'long-term' | 'life-long';
  domains: string[];
  readinessScore: number; // 0-100
}

/**
 * Classify content into cognitive structures (Dot, Wheel, or Chakra)
 */
export async function classifyCognitiveStructure(content: string): Promise<CognitiveStructure> {
  try {
    const prompt = `
    Analyze the following content and classify it as either a DOT, WHEEL, or CHAKRA based on these STRICT criteria:

    DOT CRITERIA (Single Insight):
    - Single, specific insight or realization
    - No goals, timelines, or action plans
    - 1-2 sentences maximum
    - Specific observation or learning
    - Present-focused understanding

    WHEEL CRITERIA (Goal-Oriented Project):
    - Clear goal or objective stated
    - Actionable steps or components
    - Measurable outcomes
    - Time-bound elements (deadlines, milestones)
    - Project or task-oriented

    CHAKRA CRITERIA (Life-Level Purpose):
    - Life-level purpose or identity transformation
    - Affects multiple life domains (career, relationships, health, etc.)
    - Strategic vision or fundamental life change
    - Long-term personal evolution
    - Core values or life philosophy

    CONSERVATIVE CLASSIFICATION: When uncertain, default to simpler structures (DOT → WHEEL → CHAKRA).

    Content to analyze: "${content}"

    Respond with JSON in this exact format:
    {
      "type": "dot|wheel|chakra",
      "confidence": 85,
      "reasoning": "Detailed explanation of why this classification was chosen",
      "keyIndicators": ["indicator1", "indicator2", "indicator3"],
      "suggestedStructure": {
        "heading": "Clear, descriptive title",
        "content": "Main content or description",
        "timeline": "Optional: if wheel/chakra with time elements",
        "purpose": "Optional: if chakra with life purpose",
        "goals": "Optional: if wheel with specific goals"
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200 // Increased for comprehensive classification
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and ensure proper structure
    return {
      type: result.type || 'dot',
      confidence: Math.min(Math.max(result.confidence || 70, 0), 100),
      reasoning: result.reasoning || 'Classification based on content analysis',
      keyIndicators: Array.isArray(result.keyIndicators) ? result.keyIndicators : [],
      suggestedStructure: {
        heading: result.suggestedStructure?.heading || 'Untitled',
        content: result.suggestedStructure?.content || content,
        timeline: result.suggestedStructure?.timeline,
        purpose: result.suggestedStructure?.purpose,
        goals: result.suggestedStructure?.goals
      }
    };

  } catch (error) {
    console.error('Error in cognitive classification:', error);
    
    // Fallback classification
    const wordCount = content.split(' ').length;
    const hasGoals = /goal|achieve|plan|target|deadline|by|complete/i.test(content);
    const hasLifeTerms = /life|identity|purpose|values|transformation|vision/i.test(content);
    
    let type: 'dot' | 'wheel' | 'chakra' = 'dot';
    
    if (hasLifeTerms && wordCount > 20) {
      type = 'chakra';
    } else if (hasGoals && wordCount > 10) {
      type = 'wheel';
    }

    return {
      type,
      confidence: 60,
      reasoning: 'Fallback classification based on keyword analysis',
      keyIndicators: ['automated fallback classification'],
      suggestedStructure: {
        heading: content.split('.')[0] || 'Untitled',
        content: content
      }
    };
  }
}

/**
 * Perform semantic analysis of content
 */
export async function performSemanticAnalysis(content: string): Promise<SemanticAnalysis> {
  try {
    const prompt = `
    Perform semantic analysis on the following content. Analyze:
    1. Main themes (2-4 key themes)
    2. Emotional mood/tone
    3. Complexity level
    4. Action orientation
    5. Time horizon
    6. Life domains involved
    7. Readiness score for content creation (0-100)

    Content: "${content}"

    Respond with JSON:
    {
      "themes": ["theme1", "theme2"],
      "mood": "emotional tone",
      "complexity": "simple|moderate|complex",
      "actionOriented": true|false,
      "timeHorizon": "immediate|short-term|long-term|life-long",
      "domains": ["career", "health", "relationships", etc.],
      "readinessScore": 85
    }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1000 // Increased for detailed queries
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      themes: Array.isArray(result.themes) ? result.themes : ['general'],
      mood: result.mood || 'neutral',
      complexity: ['simple', 'moderate', 'complex'].includes(result.complexity) ? result.complexity : 'moderate',
      actionOriented: Boolean(result.actionOriented),
      timeHorizon: ['immediate', 'short-term', 'long-term', 'life-long'].includes(result.timeHorizon) ? result.timeHorizon : 'short-term',
      domains: Array.isArray(result.domains) ? result.domains : ['personal'],
      readinessScore: Math.min(Math.max(result.readinessScore || 70, 0), 100)
    };

  } catch (error) {
    console.error('Error in semantic analysis:', error);
    
    // Fallback analysis
    return {
      themes: ['general'],
      mood: 'neutral',
      complexity: 'moderate',
      actionOriented: /goal|plan|do|action|complete|achieve/i.test(content),
      timeHorizon: 'short-term',
      domains: ['personal'],
      readinessScore: 70
    };
  }
}

/**
 * Generate contextual insights based on cognitive structure and related content
 */
export async function generateContextualInsights(
  structure: CognitiveStructure,
  relatedContent: Array<{ content: string; type: string; similarity: number }>,
  userHistory?: Array<{ content: string; timestamp: Date }>
): Promise<{
  insights: string[];
  recommendations: string[];
  connections: string[];
  nextSteps: string[];
}> {
  try {
    const prompt = `
    Generate contextual insights for a ${structure.type.toUpperCase()} with the following context:

    Current Structure:
    - Type: ${structure.type}
    - Content: ${structure.suggestedStructure.content}
    - Confidence: ${structure.confidence}%

    Related Content:
    ${relatedContent.map((item, i) => `${i + 1}. [${item.type}] ${item.content} (${Math.round(item.similarity * 100)}% similar)`).join('\n')}

    User History Pattern:
    ${userHistory?.slice(-3).map(h => `- ${h.content}`).join('\n') || 'No recent history'}

    Provide JSON response:
    {
      "insights": ["insight1", "insight2", "insight3"],
      "recommendations": ["recommendation1", "recommendation2"],
      "connections": ["connection to related content"],
      "nextSteps": ["suggested next action1", "suggested next action2"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1200 // Increased for comprehensive insights
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      insights: Array.isArray(result.insights) ? result.insights : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      connections: Array.isArray(result.connections) ? result.connections : [],
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps : []
    };

  } catch (error) {
    console.error('Error generating contextual insights:', error);
    
    return {
      insights: [`This ${structure.type} represents ${structure.reasoning.toLowerCase()}`],
      recommendations: [`Consider developing this ${structure.type} further based on your patterns`],
      connections: ['Related content shows similar themes in your thinking'],
      nextSteps: ['Review and refine this cognitive structure']
    };
  }
}

/**
 * Extract key entities and concepts from content
 */
export async function extractKeyEntities(content: string): Promise<{
  entities: string[];
  concepts: string[];
  keywords: string[];
  topics: string[];
}> {
  try {
    const prompt = `
    Extract key information from the following content:
    
    Content: "${content}"
    
    Extract:
    1. Named entities (people, places, organizations, dates)
    2. Core concepts (abstract ideas, theories, principles)
    3. Important keywords (significant terms)
    4. Main topics (subject areas)

    Respond with JSON:
    {
      "entities": ["entity1", "entity2"],
      "concepts": ["concept1", "concept2"],
      "keywords": ["keyword1", "keyword2"],
      "topics": ["topic1", "topic2"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000 // Increased for complete structural analysis
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      entities: Array.isArray(result.entities) ? result.entities : [],
      concepts: Array.isArray(result.concepts) ? result.concepts : [],
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      topics: Array.isArray(result.topics) ? result.topics : []
    };

  } catch (error) {
    console.error('Error extracting entities:', error);
    
    // Simple keyword extraction fallback
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const uniqueWords = Array.from(new Set(words)).slice(0, 5);
    
    return {
      entities: [],
      concepts: [],
      keywords: uniqueWords,
      topics: ['general']
    };
  }
}