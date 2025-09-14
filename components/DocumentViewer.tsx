import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JSZip from 'jszip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, Download, FileText, Code, Layers, Database, Shield, GitBranch, Package } from 'lucide-react';

interface DocumentViewerProps {
  content: string;
  isExecuting: boolean;
  planExists: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ content, isExecuting, planExists }) => {
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Parse content into sections for better AI tool consumption
  const parseContentIntoSections = (fullContent: string) => {
    const sections = {
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
      monitoring: ''
    };

    // Simple parsing logic - you can enhance this based on your actual content structure
    const lines = fullContent.split('\n');
    let currentSection = 'overview';
    let sectionContent = '';

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Detect section changes
      if (lowerLine.includes('tech stack') || lowerLine.includes('technology stack')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'techStack';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('architecture') || lowerLine.includes('system design')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'architecture';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('database') || lowerLine.includes('data model')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'database';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('api') || lowerLine.includes('endpoints')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'api';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('frontend') || lowerLine.includes('client')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'frontend';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('backend') || lowerLine.includes('server')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'backend';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('security') || lowerLine.includes('authentication')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'security';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('deployment') || lowerLine.includes('infrastructure')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'deployment';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('task') || lowerLine.includes('implementation')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'tasks';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('test') || lowerLine.includes('quality')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'testing';
        sectionContent = line + '\n';
      } else if (lowerLine.includes('monitor') || lowerLine.includes('observability')) {
        if (sectionContent) sections[currentSection] = sectionContent;
        currentSection = 'monitoring';
        sectionContent = line + '\n';
      } else {
        sectionContent += line + '\n';
      }
    });

    // Save the last section
    if (sectionContent) sections[currentSection] = sectionContent;

    // If no sections were detected, put everything in overview
    if (Object.values(sections).every(s => s === '')) {
      sections.overview = fullContent;
    }

    return sections;
  };

  // Generate individual markdown files optimized for AI coding assistants
  const generateAIOptimizedFiles = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const sections = parseContentIntoSections(content);
    const files = [];

    // 1. PROJECT_OVERVIEW.md
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

    // 2. TECH_STACK.md
    if (sections.techStack) {
      files.push({
        name: 'TECH_STACK.md',
        icon: <Package className="w-4 h-4" />,
        content: `# Technology Stack
<!-- AI Assistant Context: These are the required technologies. Ensure all code uses these specific versions and frameworks. -->

${sections.techStack}

## Package Installation Commands

### Frontend Dependencies
\`\`\`bash
# Add your npm/yarn commands here based on the tech stack
npm install [packages]
\`\`\`

### Backend Dependencies
\`\`\`bash
# Add your npm/yarn commands here based on the tech stack
npm install [packages]
\`\`\`

## Configuration Templates
<!-- AI: Generate configuration files based on these technologies -->

### tsconfig.json
\`\`\`json
{
  "compilerOptions": {
    // Add appropriate TypeScript config
  }
}
\`\`\`

### package.json scripts
\`\`\`json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
\`\`\`

---
*Optimized for AI-assisted development*
*Date: ${timestamp}*`
      });
    }

    // 3. ARCHITECTURE.md
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

    // 4. DATABASE_SCHEMA.md
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

    // 5. API_ENDPOINTS.md
    if (sections.api) {
      files.push({
        name: 'API_ENDPOINTS.md',
        icon: <GitBranch className="w-4 h-4" />,
        content: `# API Endpoints Specification
<!-- AI Assistant Context: Implement these exact endpoints with the specified request/response formats. -->

${sections.api}

## Implementation Template
\`\`\`typescript
// AI: Use this template for all API endpoints

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate request method
    // Validate request body
    // Process business logic
    // Return response
  } catch (error) {
    // Handle errors appropriately
  }
}
\`\`\`

## Error Response Format
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
\`\`\`

---
*API implementation guide*
*Date: ${timestamp}*`
      });
    }

    // 6. IMPLEMENTATION_TASKS.md
    const tasksContent = `# Implementation Tasks
<!-- AI Assistant Context: Complete these tasks in order. Each task should be a separate commit. -->

${sections.tasks || '## Tasks to be defined based on project requirements'}

## Task Execution Order

### Phase 1: Foundation
- [ ] Set up project structure
- [ ] Install dependencies
- [ ] Configure development environment
- [ ] Set up version control

### Phase 2: Backend Development
- [ ] Create database schema
- [ ] Implement data models
- [ ] Build API endpoints
- [ ] Add authentication/authorization

### Phase 3: Frontend Development
- [ ] Create component library
- [ ] Implement pages/routes
- [ ] Connect to backend API
- [ ] Add state management

### Phase 4: Integration & Testing
- [ ] Write unit tests
- [ ] Implement integration tests
- [ ] Perform end-to-end testing
- [ ] Fix bugs and optimize

### Phase 5: Deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Deploy application
- [ ] Monitor and maintain

## Code Generation Instructions
For each task:
1. Read the relevant documentation files
2. Generate complete, production-ready code
3. Include proper error handling
4. Add appropriate comments
5. Ensure TypeScript types are defined

---
*Task list for AI-assisted development*
*Date: ${timestamp}*`;

    files.push({
      name: 'IMPLEMENTATION_TASKS.md',
      icon: <Code className="w-4 h-4" />,
      content: tasksContent
    });

    // 7. PROMPTS_FOR_AI.md
    const promptsContent = `# AI Assistant Prompts
<!-- These are optimized prompts to use with Claude, Cursor, or other AI coding assistants -->

## Initial Setup Prompt
\`\`\`
Based on PROJECT_OVERVIEW.md and TECH_STACK.md, create the initial project structure with all necessary configuration files, including package.json, tsconfig.json, and any framework-specific configs.
\`\`\`

## Component Generation Prompt
\`\`\`
Using ARCHITECTURE.md as a guide, create a [ComponentName] component that [describe functionality]. Follow the established patterns and include TypeScript types, error handling, and proper documentation.
\`\`\`

## API Endpoint Creation Prompt
\`\`\`
Based on API_ENDPOINTS.md, implement the [endpoint name] endpoint. Include request validation, error handling, and proper TypeScript types. Follow RESTful conventions and the established error format.
\`\`\`

## Database Model Prompt
\`\`\`
Using DATABASE_SCHEMA.md, create the [Model name] model with all relationships and validations. Include migration files and seed data for development.
\`\`\`

## Testing Prompt
\`\`\`
Write comprehensive tests for [component/function/endpoint]. Include unit tests, edge cases, and error scenarios. Use the project's testing framework and follow best practices.
\`\`\`

## Refactoring Prompt
\`\`\`
Refactor [code section] to improve performance/readability/maintainability. Ensure backward compatibility and add appropriate tests for the changes.
\`\`\`

## Bug Fix Prompt
\`\`\`
Debug and fix [describe issue]. Provide a detailed explanation of the root cause and implement a robust solution with proper error handling.
\`\`\`

---
*Prompt templates for AI-assisted development*
*Date: ${timestamp}*`;

    files.push({
      name: 'PROMPTS_FOR_AI.md',
      icon: <Shield className="w-4 h-4" />,
      content: promptsContent
    });

    return files;
  };

  // Download all files as a zip (simplified version - downloads individually)
  const handleDownloadAll = async () => {
    const files = generateAIOptimizedFiles();
    const zip = new JSZip();
    
    // Add all files to the ZIP
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });
    
    try {
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
  const handleDownloadSingle = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportFiles = generateAIOptimizedFiles();

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
                    >
                      <Package className="w-4 h-4" />
                      <span className="font-medium">Download All Files</span>
                    </Button>
                  </div>
                  <div className="border-t border-border/30 pt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">Individual Files:</p>
                    {exportFiles.map((file) => (
                      <Button
                        key={file.name}
                        onClick={() => handleDownloadSingle(file.name, file.content)}
                        variant="ghost"
                        className="w-full justify-start gap-3 text-xs h-9 hover:bg-muted/50 transition-all duration-200 rounded-lg group"
                        size="sm"
                      >
                        <span className="text-muted-foreground group-hover:text-primary transition-colors duration-200">
                          {file.icon}
                        </span>
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors duration-200">
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
            <div className="prose prose-sm prose-invert max-w-none h-full overflow-y-auto text-sm leading-relaxed text-foreground/90">
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