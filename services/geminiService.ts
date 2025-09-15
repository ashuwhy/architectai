
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

// AI-powered analysis functions for generating specific documentation files
export async function generateTechStackFromOverview(
  projectDescription: string,
  customApiKey?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Senior Software Architect, analyze the following project description and generate a comprehensive technology stack specification.
    
    Project Description:
    ---
    ${projectDescription}
    ---
    
    Generate a detailed TECH_STACK.md file that includes:
    1. Frontend technologies (React, Vue, Angular, etc.)
    2. Backend technologies (Node.js, Python, Java, etc.)
    3. Database technologies (PostgreSQL, MongoDB, Redis, etc.)
    4. Cloud services and infrastructure
    5. Development tools and frameworks
    6. Package installation commands
    7. Configuration templates
    
    Base your recommendations on the project requirements, scale, and complexity described in the project description.
    Include specific versions and reasoning for each technology choice.
    Format as a complete markdown document ready for AI-assisted development.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating tech stack:", error);
    throw new Error("Failed to generate tech stack from project overview.");
  }
}

export async function generateApiEndpointsFromOverview(
  projectDescription: string,
  customApiKey?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Senior Backend Engineer, analyze the following project description and generate a comprehensive API endpoints specification.
    
    Project Description:
    ---
    ${projectDescription}
    ---
    
    Generate a detailed API_ENDPOINTS.md file that includes:
    1. RESTful API endpoints based on the project requirements
    2. Request/response formats for each endpoint
    3. Authentication and authorization requirements
    4. Error handling specifications
    5. API versioning strategy
    6. Rate limiting considerations
    7. Implementation templates and examples
    
    Base your API design on the features and functionality described in the project description.
    Include proper HTTP methods, status codes, and data validation requirements.
    Format as a complete markdown document ready for AI-assisted development.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating API endpoints:", error);
    throw new Error("Failed to generate API endpoints from project overview.");
  }
}

export async function generateImplementationTasksFromOverview(
  projectDescription: string,
  customApiKey?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Senior Project Manager and Technical Lead, analyze the following project description and generate a comprehensive implementation task list.
    
    Project Description:
    ---
    ${projectDescription}
    ---
    
    Generate a detailed IMPLEMENTATION_TASKS.md file that includes:
    1. Phased development approach (Foundation, Backend, Frontend, Integration, Deployment)
    2. Specific, actionable tasks for each phase
    3. Task dependencies and prerequisites
    4. Estimated complexity and time requirements
    5. Testing and quality assurance tasks
    6. Deployment and DevOps tasks
    7. Code generation instructions for AI assistants
    
    Break down the project into manageable, sequential tasks that can be completed by AI coding assistants.
    Include checkboxes for tracking progress and clear acceptance criteria for each task.
    Format as a complete markdown document ready for AI-assisted development.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating implementation tasks:", error);
    throw new Error("Failed to generate implementation tasks from project overview.");
  }
}

export async function generateAiPromptsFromOverview(
  projectDescription: string,
  customApiKey?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey(customApiKey) });
  const prompt = `
    As a Senior AI Engineer and Technical Writer, analyze the following project description and generate optimized prompts for AI coding assistants.
    
    Project Description:
    ---
    ${projectDescription}
    ---
    
    Generate a detailed PROMPTS_FOR_AI.md file that includes:
    1. Initial setup prompts for project scaffolding
    2. Component generation prompts for UI development
    3. API endpoint creation prompts for backend development
    4. Database model creation prompts
    5. Testing and debugging prompts
    6. Refactoring and optimization prompts
    7. Deployment and DevOps prompts
    
    Create specific, actionable prompts that AI assistants can use to generate high-quality code.
    Include context about the project's architecture, tech stack, and requirements.
    Format as a complete markdown document with ready-to-use prompt templates.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI prompts:", error);
    throw new Error("Failed to generate AI prompts from project overview.");
  }
}
