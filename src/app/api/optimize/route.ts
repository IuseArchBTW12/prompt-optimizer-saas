import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { prompt, settings } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use Claude API to optimize the prompt
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      // Fallback to a simple rule-based optimization if no API key
      const optimized = optimizePromptFallback(prompt, settings);
      return NextResponse.json(optimized);
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      temperature: 0.3,
      system: getOptimizationSystemPrompt(settings),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the text content from Claude's response
    const optimizedContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse the response to extract optimized prompt and explanation
    const parsed = parseOptimizationResponse(optimizedContent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Optimization error:", error);
    // Fallback to rule-based optimization on error
    const { prompt: originalPrompt, settings } = await request.json();
    const fallback = optimizePromptFallback(originalPrompt, settings);
    return NextResponse.json(fallback);
  }
}

function getOptimizationSystemPrompt(settings: any): string {
  const { targetModel, tone, outputPreference } = settings;

  let basePrompt = `You are an expert prompt engineer specializing in optimizing prompts for LLMs.

Your task: Analyze the user's prompt and rewrite it to be more effective for ${targetModel}.

Core optimization principles:
1. Add a clear role definition
2. Define specific constraints and requirements
3. Specify the desired output format
4. Add task boundaries
5. Use clear, unambiguous language
6. Structure the prompt logically

`;

  // TONE-SPECIFIC INSTRUCTIONS
  if (tone === "technical") {
    basePrompt += `TONE REQUIREMENT - TECHNICAL:
- Use precise, technical terminology
- Include explicit step-by-step instructions
- Add specific technical constraints
- Define exact output specifications
- Use formal, professional language
- Include edge cases and error handling
- Be extremely detailed and unambiguous

`;
  } else if (tone === "creative") {
    basePrompt += `TONE REQUIREMENT - CREATIVE:
- Use engaging, expressive language
- Allow for creative interpretation
- Encourage innovative approaches
- Use metaphors and examples
- Balance clarity with flexibility
- Inspire creative thinking while maintaining structure
- Make the prompt feel inviting and open-ended

`;
  } else if (tone === "concise") {
    basePrompt += `TONE REQUIREMENT - CONCISE:
- Use minimal words for maximum impact
- Remove all unnecessary language
- Use bullet points and short sentences
- Direct, imperative commands
- No fluff or redundancy
- Crystal clear and to the point
- Ultra-brief but complete

`;
  }

  // OUTPUT PREFERENCE INSTRUCTIONS
  if (outputPreference === "detailed") {
    basePrompt += `OUTPUT PREFERENCE - DETAILED:
- Create a comprehensive, multi-paragraph prompt
- Include extensive context and background
- Add multiple examples if helpful
- Provide detailed instructions for each step
- Include formatting specifications
- Add constraints, requirements, and expectations
- The optimized prompt should be substantially longer and more thorough

`;
  } else {
    basePrompt += `OUTPUT PREFERENCE - CONCISE:
- Keep the optimized prompt SHORT and focused
- Only include essential information
- Avoid unnecessary elaboration
- Use compact formatting
- Prioritize brevity without losing clarity
- The optimized prompt should be streamlined and efficient

`;
  }

  basePrompt += `CRITICAL: Your response must follow this EXACT format:

OPTIMIZED_PROMPT:
[The optimized prompt here - following the tone and length requirements above]

EXPLANATION:
[Brief explanation of what changed and why, 2-3 sentences]

Do NOT include any other text outside this format.`;

  return basePrompt;
}

function parseOptimizationResponse(content: string): {
  optimizedPrompt: string;
  explanation: string;
} {
  const optimizedMatch = content.match(/OPTIMIZED_PROMPT:\s*([\s\S]*?)(?=EXPLANATION:|$)/);
  const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)$/);

  return {
    optimizedPrompt: optimizedMatch
      ? optimizedMatch[1].trim()
      : content.trim(),
    explanation: explanationMatch
      ? explanationMatch[1].trim()
      : "The prompt has been optimized with clearer structure and specific instructions.",
  };
}

function optimizePromptFallback(
  prompt: string,
  settings: any
): { optimizedPrompt: string; explanation: string } {
  const { targetModel, tone } = settings;

  let optimized = `You are an expert assistant specializing in ${targetModel} interactions.\n\n`;
  optimized += `Task: ${prompt}\n\n`;
  optimized += `Requirements:\n`;
  optimized += `- Provide clear, ${tone} responses\n`;
  optimized += `- Follow best practices for ${targetModel}\n`;
  optimized += `- Be specific and actionable\n\n`;
  optimized += `Output format: Provide your response in a structured, easy-to-understand format.`;

  return {
    optimizedPrompt: optimized,
    explanation:
      "Added role definition, structured requirements, and output format specifications to improve prompt clarity and effectiveness.",
  };
}
