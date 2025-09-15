<div align="center">
  <img src="assets/card/card.png" alt="Architect AI Logo" width="800" />
  <p><em>Intelligent System Design Documentation</em></p>
</div>

---

## Project Overview

**Architect AI** is an intelligent documentation generation system that automates the creation of comprehensive system design documents. This project addresses the daily challenge faced by developers and system architects who need to create detailed, well-structured documentation for their projects.

### Problem Statement
As a developer, I frequently need to create system design documents for various projects, which involves:
- Planning the overall architecture
- Breaking down complex systems into manageable components
- Writing detailed documentation for each component
- Ensuring consistency and completeness across all sections

This manual process is time-consuming, repetitive, and often results in incomplete or inconsistent documentation.

### Solution
Architect AI automates this entire workflow by:
1. **Reasoning**: Analyzing user requirements and understanding the system scope
2. **Planning**: Creating a structured plan with logical sections and dependencies
3. **Executing**: Generating comprehensive documentation for each planned section
4. **Exporting**: Providing AI-optimized files for further development

## Core Features (Mandatory Requirements)

### ✅ AI Agent Implementation
- **Reasoning**: The system analyzes user prompts to understand system requirements and scope
- **Planning**: Creates structured plans with logical sections (Overview, Architecture, Database, API, etc.)
- **Execution**: Automatically generates detailed content for each planned section
- **Automation**: Completely automates the system design documentation process

### ✅ User Interface
- **Modern Web Application**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Components**: Real-time plan generation and document viewing
- **Export Functionality**: Download individual files or complete ZIP packages

### ✅ Source Code
- **Complete Prototype**: Full source code available in this repository
- **Modern Tech Stack**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Clean Architecture**: Well-organized components and services
- **Type Safety**: Full TypeScript implementation

### ✅ System Design Document
- **Architecture Overview**: Detailed system architecture and component breakdown
- **Technology Choices**: Justification for all technology selections
- **Data Design**: Document structure and AI optimization strategies
- **Component Analysis**: Detailed breakdown of all system components

### ✅ Interaction Logs
- **AI Prompts**: Complete history of prompts used with the AI system
- **Chat History**: Detailed interaction logs showing the reasoning and planning process
- **Development Process**: Documentation of the entire development workflow

## Time Constraints & Development Context

**Important Note**: This project was developed during a particularly challenging period due to mid-semester examinations at my college. The tight timeline required:

- **Rapid Prototyping**: Focus on core functionality over extensive features
- **Efficient Development**: Leveraging modern tools and frameworks for faster development
- **Streamlined UI**: Clean, minimalistic design that delivers maximum functionality
- **AI Integration**: Utilizing Google Gemini API for intelligent content generation

Despite these time constraints, the project successfully delivers all mandatory requirements while maintaining high code quality and user experience standards.

## Technology Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and functional components
- **TypeScript 5.8.2**: Type-safe development
- **Vite 6.2.0**: Fast build tool and development server
- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **shadcn/ui**: Modern, accessible UI components
- **Radix UI**: Headless UI components for accessibility

### AI Integration
- **Google Gemini API (@google/genai 1.19.0)**: Advanced AI model for content generation
- **Custom Prompt Engineering**: Optimized prompts for system design documentation
- **AI Response Caching**: Redis-based caching for improved performance and cost reduction
- **API Key Caching**: Secure caching of user-provided Gemini API keys

### Authentication & UI
- **Firebase Auth**: User authentication with Google Sign-In
- **Lucide React (0.544.0)**: Beautiful icon library
- **React Markdown (10.1.0)**: Markdown rendering with GitHub Flavored Markdown

### Backend & Caching
- **Redis 5.8.2**: In-memory data store for caching and rate limiting
- **Rate Limiting**: Configurable user request limits with Redis backend
- **Session Management**: User activity tracking and analytics

### Development Tools
- **pnpm**: Fast, efficient package manager
- **PostCSS 8.5.6**: CSS processing and optimization
- **Autoprefixer 10.4.21**: CSS vendor prefixing
- **JSZip 3.10.1**: ZIP file creation and export functionality

## Project Structure

```
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui) customised
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── icons/            # Custom icon components
│   ├── ApiKeyDialog.tsx  # API key management
│   ├── DocumentViewer.tsx # Document display and export
│   ├── PlanViewer.tsx    # Plan visualization
│   └── PromptInput.tsx   # User input interface
├── services/             # API services
│   ├── geminiService.ts  # Google Gemini API integration
│   ├── redis.ts          # Redis caching and rate limiting
│   └── firebase.ts       # Firebase authentication
├── assets/               # Static assets
│   ├── card/            # Logo and branding
│   ├── fonts/           # Custom fonts (Fira Code, Lineal, Inter, Playfair)
│   └── icons/           # Icon assets
├── lib/                  # Utility functions
│   └── utils.ts         # Helper functions
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── index.css            # Global styles
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── components.json      # shadcn/ui configuration
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Google Gemini API key
- Redis instance (optional, for caching and rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashuwhy/architectai
   cd architectai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # Redis Configuration (optional - for caching and rate limiting)
   REDIS_HOST=your_redis_host
   REDIS_PORT=6379
   REDIS_USERNAME=default
   REDIS_PASSWORD=your_redis_password

   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # Rate Limiting Configuration
   RATE_LIMIT_REQUESTS_PER_HOUR=10
   RATE_LIMIT_WINDOW_SECONDS=3600

   # Cache Configuration
   AI_RESPONSE_CACHE_TTL=3600
   GEMINI_API_KEY_CACHE_TTL=300
   ```

   **Note**: If Redis is not configured, the application will work without caching and rate limiting features. The Gemini API key can also be provided directly in the UI.

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

1. **Enter System Requirements**: Describe your system in the prompt input
2. **Generate Plan**: Click "Generate Plan" to create a structured documentation plan
3. **Review Progress**: Watch as the AI generates content for each section
4. **Export Documentation**: Download individual files or complete ZIP package

## Key Features

### Intelligent Planning
- Analyzes user requirements
- Creates logical section breakdown
- Establishes proper dependencies
- Ensures comprehensive coverage

### AI-Powered Content Generation
- Context-aware content creation
- Consistent formatting and structure
- Technical accuracy and detail
- AI-optimized for further development
- **Response Caching**: Redis-based caching for faster repeated requests
- **API Key Management**: Secure caching of user-provided API keys

### Performance & Scalability
- **Rate Limiting**: Configurable request limits per user
- **Caching System**: Redis-based caching for AI responses and API keys
- **User Analytics**: Activity tracking and usage statistics
- **Real-time Status**: Live generation progress tracking

### Professional Export
- Multiple file formats (Markdown)
- AI-optimized documentation
- Organized file structure
- Ready for development teams

## Development Process

### Single 6-Hour Development Session (September 15, 2025)

**Hour 1-2: Project Setup and Core Architecture**
- Project initialization with Vite + React + TypeScript
- Technology stack selection and setup
- Basic project structure creation
- AI service integration planning
- Core component development (PromptInput, PlanViewer, DocumentViewer)

**Hour 2-3: AI Service Integration**
- AI service implementation with Gemini API
- Prompt engineering and optimization
- State management implementation
- Error handling and retry logic

**Hour 3-4: User Interface Development**
- UI styling and responsive design
- Component implementation and integration
- Real-time progress tracking
- Basic error handling and user feedback

**Hour 4-5: Export System and Advanced Features**
- Export system implementation with JSZip
- Document generation and formatting
- ZIP file export functionality
- Enhanced button styling and UI polish

**Hour 5-6: Final Polish and Documentation**
- UI enhancements and animations
- Logo integration and branding
- Comprehensive documentation creation
- Final testing and bug fixes

## Challenges & Solutions

### Challenge 1: Time Constraints
**Problem**: Limited development time due to mid-semester exams
**Solution**: Focused on core functionality, leveraged modern tools for rapid development

### Challenge 2: AI Integration
**Problem**: Ensuring consistent, high-quality AI-generated content
**Solution**: Implemented sophisticated prompt engineering and content validation

### Challenge 3: User Experience
**Problem**: Creating an intuitive interface for complex documentation generation
**Solution**: Designed a clean, minimalistic interface with real-time feedback

## Future Enhancements

- **Template System**: Pre-built templates for common system types
- **Collaboration Features**: Multi-user editing and review
- **Version Control**: Document versioning and change tracking
- **Integration**: Connect with popular development tools
- **Advanced AI**: Support for multiple AI models and custom prompts

## Contributing

This project was developed as part of an academic assignment. For questions or feedback, please contact the developer.

## License

This project is developed for educational purposes as part of an academic assignment.

## Contact

**Developer**: Ashutosh Sharma  
**Institution**: IIT Kharagpur

<!-- **Submission Date**: [Current Date] -->

---

*Architect AI demonstrates the practical application of AI in automating complex documentation tasks, showcasing the potential of intelligent systems in software development workflows.*