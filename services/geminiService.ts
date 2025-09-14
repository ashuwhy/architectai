
import { GoogleGenAI, Type } from "@google/genai";
import { PlanItem, PlanStatus } from '../types';

// Get API key from environment or use custom key
function getApiKey(customApiKey?: string): string {
  if (customApiKey) {
    return customApiKey;
  }
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  throw new Error("No API key provided. Please configure your Gemini API key.");
}

export async function generatePlan(appDescription: string, customApiKey?: string): Promise<PlanItem[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Lead Software Architect (Planner Agent), your task is to take a high-level application description and create a structured plan for a comprehensive system design document. 
    Break down the document into essential sections. For each section, provide a clear title and a brief description of what it should cover.
    
    Application Description: "${appDescription}"
    
    Generate a plan with 6-8 logical sections.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the system design document section.",
              },
              description: {
                type: Type.STRING,
                description: "A brief one-sentence description of what this section will cover.",
              },
            },
            required: ["title", "description"],
          },
        },
      },
    });

    const parsedPlan = JSON.parse(response.text);
    return parsedPlan.map((item: { title: string; description: string; }, index: number) => ({
      ...item,
      id: `section-${index}-${Date.now()}`,
      status: PlanStatus.Pending,
    }));
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate a plan from the AI. Please check the console for details.");
  }
}


export async function generateSectionContent(
  appDescription: string, 
  sectionTitle: string,
  documentContext: string,
  customApiKey?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Senior Software Engineer (Executor Agent), your task is to write a specific section of a system design document.
    
    Overall Application Idea: "${appDescription}"
    
    Previously Generated Document Content (for context, do not repeat):
    ---
    ${documentContext}
    ---
    
    Now, write the content for the following section: "${sectionTitle}".
    
    Be detailed, professional, and thorough. Use Markdown for formatting (e.g., headings, lists, bold text). 
    Do NOT include the section title itself in your response; only provide the body content for that section.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating content for section "${sectionTitle}":`, error);
    throw new Error(`Failed to generate content for section "${sectionTitle}".`);
  }
}
