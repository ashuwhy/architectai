import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JSZip from 'jszip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, Download, FileText, Code, Layers, Database, Shield, GitBranch, Package } from 'lucide-react';
import { 
  generateTechStackFromOverview, 
  generateApiEndpointsFromOverview, 
  generateImplementationTasksFromOverview, 
  generateAiPromptsFromOverview 
} from '../services/geminiService';

interface DocumentViewerProps {
  content: string;
  isExecuting: boolean;
  planExists: boolean;
  apiKey?: string;
  originalPrompt?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ content, isExecuting, planExists, apiKey, originalPrompt }) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);

  // Parse content into sections for better AI tool consumption
  const parseContentIntoSections = (fullContent: string) => {
    const sections: Record<string, string> = {
      overview: '',
      techStack: '',
      architecture: '',
      database: '',
      api: '',
      frontend: '',
      backend: '',
      security: '',
      deployment: '',
      tasks: '',
      testing: '',
      monitoring: '',
      performance: '' // Added this missing section
    };

    const sectionMap: { [key: string]: keyof typeof sections } = {
      'architecture overview': 'architecture',
      'system components': 'overview', // Components can be part of the overview
      'data design': 'database',
      'technology stack': 'techStack',
      'api design': 'api',
      'user interface design': 'frontend',
      'security considerations': 'security',
      'performance optimization': 'performance', // This was missing in the original sections object
      'deployment architecture': 'deployment',
      'future scalability': 'overview' // Can be part of overview or deployment, for simplicity put in overview
    };

    const lines = fullContent.split('\n');
    let currentSectionKey: keyof typeof sections = 'overview';
    let sectionContentBuffer: string[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(/^##\s*(.*)/); // Match lines starting with "## "

      if (match) {
        // New section found
        const heading = match[1].toLowerCase();
        
        // Save content of the previous section if it exists
        if (sectionContentBuffer.length > 0) {
          sections[currentSectionKey] += sectionContentBuffer.join('\n') + '\n';
          sectionContentBuffer = [];
        }

        // Determine the new section key
        let newSectionFound = false;
        for (const keyword in sectionMap) {
          if (heading.includes(keyword)) {
            currentSectionKey = sectionMap[keyword];
            newSectionFound = true;
            break;
          }
        }
        if (!newSectionFound) {
            // If it's a new H2 heading but doesn't match a specific key, add it to overview
            currentSectionKey = 'overview';
        }
        sectionContentBuffer.push(line); // Include the heading itself in the section content
      } else {
        // Accumulate lines for the current section
        sectionContentBuffer.push(line);
      }
    });

    // Save content of the last section
    if (sectionContentBuffer.length > 0) {
      sections[currentSectionKey] += sectionContentBuffer.join('\n') + '\n';
    }

    // Fallback: If no specific sections were populated, put all content into overview
    if (Object.values(sections).every(s => s === '')) {
      sections.overview = fullContent;
    }

    return sections;
  };

  // Generate individual markdown files optimized for AI coding assistants using AI analysis
  const generateAIOptimizedFiles = async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const sections = parseContentIntoSections(content);
    const files = [];

    // 1. PROJECT_OVERVIEW.md (static - based on parsed content)
    if (sections.overview) {
      files.push({
        name: 'PROJECT_OVERVIEW.md',
        icon: <FileText className="w-4 h-4" />,
        content: `# Project Overview
<!-- AI Assistant Context: This is the main project overview. Use this to understand the overall system requirements and goals. -->

${sections.overview}

## AI Development Instructions
- Review this overview before implementing any features
- Ensure all implementations align with the stated goals
- Reference this document when making architectural decisions

## Key Points for Implementation
- Follow the architecture patterns described
- Maintain consistency with the defined structure
- Prioritize the core features listed above

---
*Generated for AI-assisted development with Claude/Cursor*
*Date: ${timestamp}*`
      });
    }

    // 2. ARCHITECTURE.md (static - based on parsed content)
    if (sections.architecture) {
      files.push({
        name: 'ARCHITECTURE.md',
        icon: <Layers className="w-4 h-4" />,
        content: `# System Architecture
<!-- AI Assistant Context: Follow this architecture strictly. All components should adhere to these patterns. -->

${sections.architecture}

## Directory Structure
\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Next.js pages or route components
├── services/      # API and business logic
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles and themes
\`\`\`

## Component Guidelines
- Use functional components with TypeScript
- Implement proper error boundaries
- Follow the single responsibility principle
- Ensure components are testable

## State Management Rules
- Use React Context for global state
- Implement proper state isolation
- Avoid prop drilling

---
*Architecture guide for AI development*
*Date: ${timestamp}*`
      });
    }

    // 3. DATABASE_SCHEMA.md (static - based on parsed content)
    if (sections.database) {
      files.push({
        name: 'DATABASE_SCHEMA.md',
        icon: <Database className="w-4 h-4" />,
        content: `# Database Schema & Models
<!-- AI Assistant Context: Use these exact schemas when creating database models and migrations. -->

${sections.database}

## Migration Scripts
\`\`\`sql
-- Add your SQL migration scripts here
-- AI: Generate CREATE TABLE statements based on the schema above
\`\`\`

## ORM Models
\`\`\`typescript
// AI: Generate Prisma/TypeORM/Sequelize models based on the schema
\`\`\`

## Seed Data
\`\`\`typescript
// AI: Generate appropriate seed data for development
\`\`\`

---
*Database implementation guide*
*Date: ${timestamp}*`
      });
    }

    // AI-generated files based on original prompt and project overview
    if (originalPrompt && apiKey) {
      try {
        setIsGeneratingFiles(true);

        // Use the original prompt as the primary input for AI generation
        const promptForAI = originalPrompt;

        // 4. TECH_STACK.md (AI-generated)
        const techStackContent = await generateTechStackFromOverview(promptForAI, apiKey);
        files.push({
          name: 'TECH_STACK.md',
          icon: <Package className="w-4 h-4" />,
          content: techStackContent
        });

        // 5. API_ENDPOINTS.md (AI-generated)
        const apiEndpointsContent = await generateApiEndpointsFromOverview(promptForAI, apiKey);
        files.push({
          name: 'API_ENDPOINTS.md',
          icon: <GitBranch className="w-4 h-4" />,
          content: apiEndpointsContent
        });

        // 6. IMPLEMENTATION_TASKS.md (AI-generated)
        const implementationTasksContent = await generateImplementationTasksFromOverview(promptForAI, apiKey);
        files.push({
          name: 'IMPLEMENTATION_TASKS.md',
          icon: <Code className="w-4 h-4" />,
          content: implementationTasksContent
        });

        // 7. PROMPTS_FOR_AI.md (AI-generated)
        const aiPromptsContent = await generateAiPromptsFromOverview(promptForAI, apiKey);
        files.push({
          name: 'PROMPTS_FOR_AI.md',
          icon: <Shield className="w-4 h-4" />,
          content: aiPromptsContent
        });

      } catch (error) {
        console.error('Error generating AI-powered files:', error);
        // Fallback to static templates if AI generation fails
        files.push({
          name: 'TECH_STACK.md',
          icon: <Package className="w-4 h-4" />,
          content: `# Technology Stack
<!-- AI Assistant Context: These are the required technologies. Ensure all code uses these specific versions and frameworks. -->

${sections.techStack || 'Technology stack to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
        });

        files.push({
          name: 'API_ENDPOINTS.md',
          icon: <GitBranch className="w-4 h-4" />,
          content: `# API Endpoints Specification
<!-- AI Assistant Context: Implement these exact endpoints with the specified request/response formats. -->

${sections.api || 'API endpoints to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
        });

        files.push({
          name: 'IMPLEMENTATION_TASKS.md',
          icon: <Code className="w-4 h-4" />,
          content: `# Implementation Tasks
<!-- AI Assistant Context: Complete these tasks in order. Each task should be a separate commit. -->

${sections.tasks || 'Tasks to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
        });

        files.push({
          name: 'PROMPTS_FOR_AI.md',
          icon: <Shield className="w-4 h-4" />,
          content: `# AI Assistant Prompts
<!-- These are optimized prompts to use with Claude, Cursor, or other AI coding assistants -->

Prompts to be generated based on project requirements.

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
        });
      } finally {
        setIsGeneratingFiles(false);
      }
    } else if (originalPrompt && !apiKey) {
      // Show placeholder files when no API key is available
      files.push({
        name: 'TECH_STACK.md',
        icon: <Package className="w-4 h-4" />,
        content: `# Technology Stack
<!-- AI Assistant Context: These are the required technologies. Ensure all code uses these specific versions and frameworks. -->

${sections.techStack || 'Technology stack to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
      });

      files.push({
        name: 'API_ENDPOINTS.md',
        icon: <GitBranch className="w-4 h-4" />,
        content: `# API Endpoints Specification
<!-- AI Assistant Context: Implement these exact endpoints with the specified request/response formats. -->

${sections.api || 'API endpoints to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
      });

      files.push({
        name: 'IMPLEMENTATION_TASKS.md',
        icon: <Code className="w-4 h-4" />,
        content: `# Implementation Tasks
<!-- AI Assistant Context: Complete these tasks in order. Each task should be a separate commit. -->

${sections.tasks || 'Tasks to be defined based on project requirements.'}

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
      });

      files.push({
        name: 'PROMPTS_FOR_AI.md',
        icon: <Shield className="w-4 h-4" />,
        content: `# AI Assistant Prompts
<!-- These are optimized prompts to use with Claude, Cursor, or other AI coding assistants -->

Prompts to be generated based on project requirements.

---
*Generated for AI-assisted development*
*Date: ${timestamp}*`
      });
    }

    return files;
  };

  // Download all files as a zip (simplified version - downloads individually)
  const handleDownloadAll = async () => {
    try {
      const files = await generateAIOptimizedFiles();
      const zip = new JSZip();
      
      // Add all files to the ZIP
      files.forEach((file) => {
        zip.file(file.name, file.content);
      });
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `architect-ai-documentation-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  };

  // Download single file
  const handleDownloadSingle = async (fileName: string) => {
    try {
      const files = await generateAIOptimizedFiles();
      const file = files.find(f => f.name === fileName);
      if (file) {
        const blob = new Blob([file.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading single file:', error);
    }
  };

  // Generate export files for display (this will be called when needed)
  const [exportFiles, setExportFiles] = useState<Array<{name: string, icon: React.ReactNode, content: string}>>([]);
  
  // Load export files when content changes
  React.useEffect(() => {
    if (content && planExists) {
      generateAIOptimizedFiles().then(setExportFiles).catch(console.error);
    }
  }, [content, planExists, apiKey, originalPrompt]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-semibold text-primary">3</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Funnel Display, serif' }}>
              System Design Document
            </h2>
            <p className="text-xs text-muted-foreground/60 mt-1">
              AI-optimized documentation for Claude & Cursor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isExecuting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" 
                     style={{ animationDuration: '1.2s', animationIterationCount: 'infinite', animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" 
                     style={{ animationDuration: '1.2s', animationIterationCount: 'infinite', animationDelay: '0.4s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" 
                     style={{ animationDuration: '1.2s', animationIterationCount: 'infinite', animationDelay: '0.8s' }}></div>
              </div>
              <span>Generating...</span>
            </div>
          )}
          {content && !isExecuting && (
            <div className="relative">
              <Button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                variant="outline"
                className="flex items-center gap-2 border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export for AI</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExportOptions ? 'rotate-180' : ''}`} />
              </Button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-72 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl p-3 z-10">
                  <div className="mb-3">
                    <Button
                      onClick={handleDownloadAll}
                      variant="default"
                      className="w-full justify-start gap-3 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg"
                      size="sm"
                      disabled={isGeneratingFiles}
                    >
                      <Package className="w-4 h-4" />
                      <span className="font-medium">
                        {isGeneratingFiles ? 'Generating Files...' : 'Download All Files'}
                      </span>
                    </Button>
                  </div>
                  <div className="border-t border-border/30 pt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">Individual Files:</p>
                    {exportFiles.map((file) => (
                        <Button
                          key={file.name}
                          onClick={() => handleDownloadSingle(file.name)}
                          variant="default"
                        className="w-full justify-start gap-3 text-xs h-9 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg rounded-lg group mb-[10px]"
                        size="sm"
                        disabled={isGeneratingFiles}
                      >
                        <span className="text-white group-hover:text-white transition-colors duration-200">
                          {file.icon}
                        </span>
                        <span className="text-white group-hover:text-white transition-colors duration-200">
                          {file.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-4">
          {!planExists ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-foreground" style={{ fontFamily: 'Funnel Display, serif' }}>
                No Plan Generated Yet
              </h3>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Describe your application to generate an AI-powered execution plan
              </p>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-full h-full overflow-y-auto overflow-x-auto text-sm leading-relaxed text-foreground/90">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-foreground mb-4 mt-6 first:mt-0" 
                        style={{ fontFamily: 'Funnel Display, serif' }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-foreground mb-3 mt-5" 
                        style={{ fontFamily: 'Funnel Display, serif' }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-foreground mb-2 mt-4" 
                        style={{ fontFamily: 'Funnel Display, serif' }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p className="mb-3 text-foreground/90 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="mb-3 ml-4 list-disc text-foreground/90">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal text-foreground/90">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground/80 mb-3">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <table className="w-full border-collapse border border-border mb-3">{children}</table>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-3 py-2 text-foreground/90">{children}</td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;