import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, settings } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use OpenAI API to optimize the prompt
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Fallback to a simple rule-based optimization if no API key
      const optimized = optimizePromptFallback(prompt, settings);
      return NextResponse.json(optimized);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: getOptimizationSystemPrompt(settings),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      const fallback = optimizePromptFallback(prompt, settings);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const optimizedContent = data.choices[0].message.content;

    // Parse the response to extract optimized prompt and explanation
    const parsed = parseOptimizationResponse(optimizedContent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize prompt" },
      { status: 500 }
    );
  }
}

function getOptimizationSystemPrompt(settings: any): string {
  const { targetModel, tone, outputPreference } = settings;

  return `You are an expert prompt engineer specializing in optimizing prompts for LLMs like GPT-4 and Claude.

Your task: Analyze the user's prompt and rewrite it to be more effective using these best practices:

1. Add a clear role definition (e.g., "You are an expert...")
2. Define specific constraints and requirements
3. Specify the desired output format
4. Add task boundaries and assumptions
5. Use clear, unambiguous language
6. Structure the prompt logically

Target Model: ${targetModel}
Tone: ${tone}
Output Preference: ${outputPreference}

${tone === "technical" ? "Use precise technical language and explicit instructions." : ""}
${tone === "creative" ? "Allow for creative interpretation while maintaining clarity." : ""}
${tone === "concise" ? "Keep the prompt brief but comprehensive." : ""}
${outputPreference === "detailed" ? "Create a comprehensive, well-structured prompt." : "Keep the optimized prompt concise."}

CRITICAL: Your response must follow this EXACT format:

OPTIMIZED_PROMPT:
[The optimized prompt here]

EXPLANATION:
[Brief explanation of what changed and why, 2-3 sentences]

Do NOT include any other text outside this format.`;
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
