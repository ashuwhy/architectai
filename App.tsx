
import React, { useState, useCallback, useEffect } from 'react';
import { PlanItem, PlanStatus } from './types';
import { generatePlan, generateSectionContent } from './services/geminiService';
import { useAuth } from './components/auth/AuthProvider';
import AuthButton from './components/auth/AuthButton';
import { saveDocumentHistory, getUserDocumentHistory, DocumentHistory, saveUserActivity, db } from './services/firebase';
import { checkRateLimit, setGenerationStatus, clearGenerationStatus, trackUserActivity } from './services/redis';
import PromptInput from './components/PromptInput';
import PlanViewer from './components/PlanViewer';
import DocumentViewer from './components/DocumentViewer';
import HistoryViewer from './components/HistoryViewer';
import RedisStatus from './components/RedisStatus';
import Footer from './components/Footer';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import iconsHero from './assets/icons/icons_hero.png';

function App() {
  const { user, loading } = useAuth();
  // Safe logging - only log user status, not the full user object
  if (import.meta.env.DEV) {
    console.log('App component - User authenticated:', !!user, 'Loading:', loading);
  }
  const [prompt, setPrompt] = useState<string>('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([]);

  const handleGeneratePlan = useCallback(async () => {
    if (!prompt || isPlanning || isExecuting) return;

    // Check rate limit
    if (user) {
      const rateLimit = await checkRateLimit(user.uid, 10, 3600); // 10 requests per hour
      if (!rateLimit.allowed) {
        setError(`Rate limit exceeded. You can make ${rateLimit.remaining} more requests in the next hour.`);
        return;
      }
    }

    setIsPlanning(true);
    setError(null);
    setPlan([]);
    setDocumentContent('');

    try {
      // Track user activity
      if (user) {
        await trackUserActivity(user.uid, {
          type: 'plan_generation_started',
          prompt: prompt.substring(0, 100),
          timestamp: Date.now()
        });
      }

      const newPlan = await generatePlan(prompt, apiKey || undefined);
      setPlan(newPlan);
      
      // Track successful plan generation
      if (user) {
        await trackUserActivity(user.uid, {
          type: 'plan_generated',
          prompt: prompt.substring(0, 100),
          sections: newPlan.length,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      
      // Track error
      if (user) {
        await trackUserActivity(user.uid, {
          type: 'plan_generation_failed',
          prompt: prompt.substring(0, 100),
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: Date.now()
        });
      }
    } finally {
      setIsPlanning(false);
    }
  }, [prompt, isPlanning, isExecuting, apiKey, user]);

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
      const docId = `doc_${Date.now()}`;

      // Set initial generation status
      if (user) {
        await setGenerationStatus(user.uid, docId, {
          status: 'generating',
          progress: 0,
          totalSections: plan.length,
          currentSection: 'Starting...'
        });
      }

      // Create a local copy of the plan to track status
      const updatedPlan = [...plan];
      
      for (let i = 0; i < plan.length; i++) {
        // Update local plan status
        updatedPlan[i] = { ...updatedPlan[i], status: PlanStatus.InProgress };
        setPlan(prevPlan => prevPlan.map((item, index) => 
          index === i ? { ...item, status: PlanStatus.InProgress } : item
        ));
        
        // Update generation status
        if (user) {
          await setGenerationStatus(user.uid, docId, {
            status: 'generating',
            progress: Math.round((i / plan.length) * 100),
            totalSections: plan.length,
            currentSection: plan[i].title,
            completedSections: i
          });
        }
        
        try {
          const sectionContent = await generateSectionContent(prompt, plan[i].title, fullDocument, apiKey || undefined);
          
          const formattedSection = `\n\n## ${plan[i].title}\n\n${sectionContent}`;
          fullDocument += formattedSection;
          setDocumentContent(fullDocument);
          
          // Update local plan status
          updatedPlan[i] = { ...updatedPlan[i], status: PlanStatus.Completed };
          setPlan(prevPlan => prevPlan.map((item, index) => 
            index === i ? { ...item, status: PlanStatus.Completed } : item
          ));

        } catch (err) {
          setError(err instanceof Error ? `Error in section '${plan[i].title}': ${err.message}` : `An unknown error occurred in section '${plan[i].title}'.`);
          // Update local plan status
          updatedPlan[i] = { ...updatedPlan[i], status: PlanStatus.Failed };
          setPlan(prevPlan => prevPlan.map((item, index) => 
            index === i ? { ...item, status: PlanStatus.Failed } : item
          ));
          // Stop execution on failure
          setIsExecuting(false);
          return; 
        }
      }
      setIsExecuting(false);
      
      // Clear generation status
      if (user) {
        await clearGenerationStatus(user.uid, docId);
      }
      
      // Save to history when document is completed - use the local updatedPlan
      console.log('🔍 Checking document save conditions:', {
        hasUser: !!user,
        hasDocument: !!fullDocument,
        documentLength: fullDocument.length,
        planStatuses: updatedPlan.map(p => p.status),
        allCompleted: updatedPlan.every(p => p.status === PlanStatus.Completed)
      });
      
      if (user && fullDocument && updatedPlan.every(p => p.status === PlanStatus.Completed)) {
        try {
          const startTime = Date.now();
          console.log('💾 Saving document to Firestore...');
          await saveDocumentHistory({
            userId: user.uid,
            prompt: prompt,
            plan: updatedPlan,
            documentContent: fullDocument,
            title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
            apiKey: apiKey || undefined,
            metadata: {
              totalSections: updatedPlan.length,
              documentLength: fullDocument.length,
              generationTime: Date.now() - startTime
            }
          });
          console.log('✅ Document saved to Firestore database');
          
          // Track user activity
          await saveUserActivity({
            userId: user.uid,
            activityType: 'document_generated',
            metadata: {
              prompt: prompt,
              documentId: 'generated'
            }
          });

          // Track detailed analytics
          await trackUserActivity(user.uid, {
            type: 'document_completed',
            prompt: prompt.substring(0, 100),
            sections: plan.length,
            contentLength: fullDocument.length,
            generationTime: Date.now() - startTime,
            timestamp: Date.now()
          });
          
        } catch (error) {
          console.error('❌ Error saving document to history:', error);
        }
      } else {
        console.log('⚠️ Document not saved - conditions not met:', {
          hasUser: !!user,
          hasDocument: !!fullDocument,
          allCompleted: updatedPlan.every(p => p.status === PlanStatus.Completed)
        });
      }
    };
    
    // Only trigger execution if there's a new plan and we are not planning
    if (plan.length > 0 && !isPlanning) {
        executePlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, prompt, apiKey, user]); // Depends on plan to trigger execution. prompt and apiKey are included for context.

  // Load user history when user signs in
  useEffect(() => {
    const loadUserHistory = async () => {
      if (user) {
        try {
          const history = await getUserDocumentHistory(user.uid, 10);
          setDocumentHistory(history);
          console.log('Loaded user history:', history.length, 'items');
          
          // Track history view activity
          await saveUserActivity({
            userId: user.uid,
            activityType: 'history_viewed',
            metadata: {
              documentId: 'history_loaded'
            }
          });
        } catch (error) {
          console.error('Error loading user history:', error);
        }
      } else {
        setDocumentHistory([]);
      }
    };

    loadUserHistory();
  }, [user]);

  const handleLoadDocument = (historyDoc: DocumentHistory) => {
    setPrompt(historyDoc.prompt);
    setPlan(historyDoc.plan);
    setDocumentContent(historyDoc.documentContent);
    setError(null);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentHistory(prev => prev.filter(doc => doc.id !== documentId));
  };

  // Test Firestore database connection
  const testFirestoreConnection = async () => {
    if (!user) {
      alert('Please sign in first to test the database');
      return;
    }

    try {
      console.log('🧪 Testing Firestore connection...');
      
      // Test 1: Save a test document
      const testDoc = {
        userId: user.uid,
        prompt: 'Test document for database connection',
        plan: [{ title: 'Test Section', status: 'Completed' }],
        documentContent: 'This is a test document to verify Firestore is working.',
        title: 'Database Test Document',
        metadata: {
          totalSections: 1,
          documentLength: 50
        }
      };

      const docId = await saveDocumentHistory(testDoc);
      console.log('✅ Test document saved with ID:', docId);

      // Test 2: Retrieve the document
      const history = await getUserDocumentHistory(user.uid, 5);
      console.log('✅ Retrieved documents:', history.length);

      // Test 3: Save user activity
      await saveUserActivity({
        userId: user.uid,
        activityType: 'document_generated',
        metadata: {
          prompt: 'Database test',
          documentId: docId
        }
      });
      console.log('✅ User activity saved');

      alert(`✅ Database test successful!\n\n- Document saved: ${docId}\n- Documents retrieved: ${history.length}\n- Activity logged\n\nCheck the browser console for detailed logs.`);
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
      alert(`❌ Database test failed!\n\nError: ${error.message}\n\nCheck the browser console for details.`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Lineal, serif' }}>Architect AI</h1>
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
              <AuthButton 
                user={user}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md mx-auto">
              <div className="">
                <img 
                  src={iconsHero} 
                  alt="Architect AI Hero" 
                  className="w-72 h-72 mx-auto mb-[-2.5rem] opacity-90"
                />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Lineal, serif' }}>
                Welcome to Architect AI
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign in to start creating AI-powered system design documentation.<br />
                Generate comprehensive plans and detailed documentation for your applications.
              </p>
              <AuthButton 
                user={user}
              />
            </div>
          </div>
        ) : (
          <div 
            className="grid gap-6" 
            style={{ 
              gridTemplateColumns: isDesktop ? '320px 1fr 300px' : '1fr'
            }}
          >
            {/* Left Sidebar - Prompt Input */}
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

            {/* Center Content */}
            <main className="space-y-6">
              <PlanViewer plan={plan} isExecuting={isExecuting} />
              <DocumentViewer 
                content={documentContent} 
                isExecuting={isExecuting} 
                planExists={plan.length > 0}
                apiKey={apiKey}
                originalPrompt={prompt}
              />
            </main>

            {/* Right Sidebar - History & Redis Status */}
            {isDesktop && (
              <aside className="space-y-6">
                <RedisStatus isGenerating={isExecuting} />
                <HistoryViewer 
                  history={documentHistory}
                  onLoadDocument={handleLoadDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              </aside>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
