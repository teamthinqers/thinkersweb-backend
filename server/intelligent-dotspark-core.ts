import OpenAI from 'openai';
import { spawn } from 'child_process';
import { promisify } from 'util';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface DotSparkResponse {
  response: string;
  structuredOutput?: {
    dot?: {
      summary: string;
      context: string;
      pulse: string;
    };
    wheel?: {
      heading: string;
      summary: string;
      timeline: string;
    };
    chakra?: {
      heading: string;
      purpose: string;
      timeline: string;
    };
    suggested_linkages?: string[];
  };
  metadata: {
    model: string;
    timestamp: string;
    processingTime: number;
    userId?: string;
  };
}

/**
 * Run Python DotSpark core logic for advanced cognitive processing
 */
export async function runDotSparkCore(
  userInput: string, 
  userId: string = 'default', 
  modelType: 'gpt-4' | 'deepseek' = 'gpt-4'
): Promise<DotSparkResponse> {
  const startTime = Date.now();

  try {
    // Use Python script for advanced DotSpark processing
    const pythonScript = `
import sys
import os
import json
sys.path.append('${process.cwd()}')

from dotspark_core_fixed import get_response_from_model

try:
    user_input = """${userInput.replace(/"/g, '\\"')}"""
    user_id = "${userId}"
    model_type = "${modelType}"
    
    response = get_response_from_model(user_input, user_id, model_type)
    
    result = {
        "success": True,
        "response": response,
        "metadata": {
            "model": model_type,
            "timestamp": "${new Date().toISOString()}",
            "user_id": user_id
        }
    }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        "success": False,
        "error": str(e),
        "fallback_response": "I'm processing your thought. Let me help you organize it into a structured format.",
        "metadata": {
            "model": "fallback",
            "timestamp": "${new Date().toISOString()}",
            "user_id": "${userId}"
        }
    }
    print(json.dumps(error_result))
`;

    // Execute Python script
    const pythonProcess = spawn('python3', ['-c', pythonScript], {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    const pythonResult = await new Promise<any>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(pythonOutput.trim());
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${pythonOutput}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${pythonError}`));
        }
      });
    });

    const processingTime = Date.now() - startTime;

    if (pythonResult.success) {
      return {
        response: pythonResult.response,
        metadata: {
          model: modelType,
          timestamp: new Date().toISOString(),
          processingTime,
          userId
        }
      };
    } else {
      // Fallback to direct OpenAI call if Python fails
      return await fallbackDotSparkProcessing(userInput, userId, modelType, processingTime);
    }

  } catch (error) {
    console.error('DotSpark Core processing error:', error);
    
    // Fallback to direct OpenAI call
    const processingTime = Date.now() - startTime;
    return await fallbackDotSparkProcessing(userInput, userId, modelType, processingTime);
  }
}

/**
 * Organize thoughts into structured Dot/Wheel/Chakra format
 */
export async function organizeThoughts(
  userInput: string,
  userId: string = 'default',
  modelType: 'gpt-4' | 'deepseek' = 'gpt-4'
): Promise<DotSparkResponse> {
  const startTime = Date.now();

  try {
    // Use Python script for thought organization
    const pythonScript = `
import sys
import os
import json
sys.path.append('${process.cwd()}')

from organize_thoughts_fixed import organize_thoughts

try:
    user_input = """${userInput.replace(/"/g, '\\"')}"""
    user_id = "${userId}"
    model_type = "${modelType}"
    
    response = organize_thoughts(user_input, user_id, model_type)
    
    # Try to parse as JSON for structured output
    try:
        structured_data = json.loads(response)
        result = {
            "success": True,
            "response": "I've organized your thoughts into a structured format.",
            "structured_output": structured_data,
            "metadata": {
                "model": model_type,
                "timestamp": "${new Date().toISOString()}",
                "user_id": user_id
            }
        }
    except:
        # If not JSON, treat as regular response
        result = {
            "success": True,
            "response": response,
            "metadata": {
                "model": model_type,
                "timestamp": "${new Date().toISOString()}",
                "user_id": user_id
            }
        }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        "success": False,
        "error": str(e),
        "fallback_response": "Let me help you organize this thought into a structured format.",
        "metadata": {
            "model": "fallback",
            "timestamp": "${new Date().toISOString()}",
            "user_id": "${userId}"
        }
    }
    print(json.dumps(error_result))
`;

    // Execute Python script
    const pythonProcess = spawn('python3', ['-c', pythonScript], {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    const pythonResult = await new Promise<any>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(pythonOutput.trim());
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${pythonOutput}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${pythonError}`));
        }
      });
    });

    const processingTime = Date.now() - startTime;

    if (pythonResult.success) {
      return {
        response: pythonResult.response,
        structuredOutput: pythonResult.structured_output,
        metadata: {
          model: modelType,
          timestamp: new Date().toISOString(),
          processingTime,
          userId
        }
      };
    } else {
      // Fallback to structured processing
      return await fallbackStructuredProcessing(userInput, userId, modelType, processingTime);
    }

  } catch (error) {
    console.error('Thought organization error:', error);
    
    // Fallback to structured processing
    const processingTime = Date.now() - startTime;
    return await fallbackStructuredProcessing(userInput, userId, modelType, processingTime);
  }
}

/**
 * Fallback DotSpark processing using direct OpenAI
 */
async function fallbackDotSparkProcessing(
  userInput: string,
  userId: string,
  modelType: string,
  processingTime: number
): Promise<DotSparkResponse> {
  const systemPrompt = `
You are DotSpark — a thinking companion for leaders and thinkers who want to sharpen their edge in an AI-driven world.

You organize thoughts into a 3-layer cognitive map:

🔴 DOTS = Sharp insights, reflections, or micro-decisions the user experiences. These are momentary but meaningful thoughts.

🛞 WHEELS = Tactical missions or short-to-mid-term goals that group dots together. Each wheel represents a journey.

🧿 CHAKRAS = Broad, long-term purposes or inner drivers. They reflect the user's mental identity or direction. Chakras contain wheels.

Your role:
- Help users save insights as Dots
- Ask what Wheel it may belong to (if relevant)
- Optionally suggest a Chakra it may align with
- Use their past Dots to reflect deeper patterns, blind spots, or opportunities

Be non-mechanical. Think like a human. Challenge and mirror, not just respond.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      response: response.choices[0].message.content || 'I understand your thought. Let me help you explore it further.',
      metadata: {
        model: 'gpt-4-fallback',
        timestamp: new Date().toISOString(),
        processingTime,
        userId
      }
    };
  } catch (error) {
    return {
      response: 'I\'m here to help you organize your thoughts. What\'s on your mind?',
      metadata: {
        model: 'fallback',
        timestamp: new Date().toISOString(),
        processingTime,
        userId
      }
    };
  }
}

/**
 * Fallback structured processing using direct OpenAI
 */
async function fallbackStructuredProcessing(
  userInput: string,
  userId: string,
  modelType: string,
  processingTime: number
): Promise<DotSparkResponse> {
  const systemPrompt = `
You are DotSpark — a cognitive assistant designed to help thinkers organize their thoughts clearly.

Generate structured output in the following JSON format:

{
  "dot": {
    "summary": "Sharp insight in max 220 characters",
    "context": "What triggered this thought (max 300 characters)",
    "pulse": "1-word emotion"
  },
  "wheel": {
    "heading": "Tactical mission or goal name",
    "summary": "What this goal represents (max 300 characters)",
    "timeline": "short-term"
  },
  "chakra": {
    "heading": "Broad purpose or inner driver",
    "purpose": "What this purpose means (max 300 characters)",
    "timeline": "long-term"
  },
  "suggested_linkages": ["Related concepts"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Organize this thought: "${userInput}"` }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const content = response.choices[0].message.content || '';
    
    try {
      const structuredOutput = JSON.parse(content);
      return {
        response: 'I\'ve organized your thoughts into a structured format.',
        structuredOutput,
        metadata: {
          model: 'gpt-4-structured-fallback',
          timestamp: new Date().toISOString(),
          processingTime,
          userId
        }
      };
    } catch {
      return {
        response: content,
        metadata: {
          model: 'gpt-4-fallback',
          timestamp: new Date().toISOString(),
          processingTime,
          userId
        }
      };
    }
  } catch (error) {
    return {
      response: 'Let me help you organize this thought into a structured format.',
      metadata: {
        model: 'fallback',
        timestamp: new Date().toISOString(),
        processingTime,
        userId
      }
    };
  }
}