
import React, { useState, useCallback, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { PlanItem, PlanStatus } from './types';
import { generatePlan, generateSectionContent } from './services/geminiService';
import PromptInput from './components/PromptInput';
import PlanViewer from './components/PlanViewer';
import DocumentViewer from './components/DocumentViewer';
import Footer from './components/Footer';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import iconsHero from './assets/icons/icons_hero.png';

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleGeneratePlan = useCallback(async () => {
    if (!prompt || isPlanning || isExecuting) return;

    setIsPlanning(true);
    setError(null);
    setPlan([]);
    setDocumentContent('');

    try {
      const newPlan = await generatePlan(prompt, apiKey || undefined);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsPlanning(false);
    }
  }, [prompt, isPlanning, isExecuting, apiKey]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const executePlan = async () => {
      if (plan.length === 0 || isExecuting || plan.every(p => p.status === PlanStatus.Completed)) {
        return;
      }

      setIsExecuting(true);
      let fullDocument = '';

      for (let i = 0; i < plan.length; i++) {
        setPlan(prevPlan => prevPlan.map((item, index) => 
          index === i ? { ...item, status: PlanStatus.InProgress } : item
        ));
        
        try {
          const sectionContent = await generateSectionContent(prompt, plan[i].title, fullDocument, apiKey || undefined);
          
          const formattedSection = `\n\n## ${plan[i].title}\n\n${sectionContent}`;
          fullDocument += formattedSection;
          setDocumentContent(fullDocument);
          
          setPlan(prevPlan => prevPlan.map((item, index) => 
            index === i ? { ...item, status: PlanStatus.Completed } : item
          ));

        } catch (err) {
          setError(err instanceof Error ? `Error in section '${plan[i].title}': ${err.message}` : `An unknown error occurred in section '${plan[i].title}'.`);
          setPlan(prevPlan => prevPlan.map((item, index) => 
            index === i ? { ...item, status: PlanStatus.Failed } : item
          ));
          // Stop execution on failure
          setIsExecuting(false);
          return; 
        }
      }
      setIsExecuting(false);
    };
    
    // Only trigger execution if there's a new plan and we are not planning
    if (plan.length > 0 && !isPlanning) {
        executePlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, prompt, apiKey]); // Depends on plan to trigger execution. prompt and apiKey are included for context.

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Funnel Display, serif' }}>Architect AI</h1>
              <p className="text-sm text-muted-foreground/60">AI-powered system design documentation</p>
            </div>
            {error && (
              <Alert variant="destructive" className="absolute right-32 top-1/2 -translate-y-1/2 max-w-[35%] z-10">
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="text-sm font-medium">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-primary/50 rounded-full"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl px-6 py-6">
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md mx-auto">
              <div className="">
                <img 
                  src={iconsHero} 
                  alt="Architect AI Hero" 
                  className="w-62 h-62 mx-auto mb-6 opacity-90"
                />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Funnel Display, serif' }}>
                Welcome to Architect AI
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign in to start creating AI-powered system design documentation.<br />
                Generate comprehensive plans and detailed documentation for your applications.
              </p>
              <SignInButton mode="modal">
                <Button className="font-medium">
                  Get Started
                </Button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div 
            className="grid gap-6" 
            style={{ 
              gridTemplateColumns: isDesktop ? '420px 1fr' : '1fr'
            }}
          >
            {/* Left Sidebar */}
            <aside>
              <PromptInput 
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleGeneratePlan}
                isLoading={isPlanning}
                isExecuting={isExecuting}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
              />
            </aside>

            {/* Right Content */}
            <main className="space-y-6">
              <PlanViewer plan={plan} isExecuting={isExecuting} />
              <DocumentViewer 
                content={documentContent} 
                isExecuting={isExecuting} 
                planExists={plan.length > 0} 
              />
            </main>
          </div>
        </SignedIn>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
