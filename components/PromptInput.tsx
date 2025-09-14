
import React, { useState } from 'react';
import SpinnerIcon from './icons/SpinnerIcon';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isExecuting: boolean;
  apiKey?: string;
  onApiKeyChange: (apiKey: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, isExecuting, apiKey, onApiKeyChange }) => {
  const isButtonDisabled = isLoading || isExecuting || prompt.trim().length < 10;
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-sm font-semibold text-primary">1</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Funnel Display, serif' }}>Describe Your Application</h2>
          <p className="text-xs text-muted-foreground/60 mt-1">Describe your system requirements</p>
        </div>
      </div>
      
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Textarea
            id="application-description"
            name="application-description"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A mobile app for dog walkers to find clients and manage their schedules."
            className="min-h-24 resize-none border border-primary/50 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-0 focus:outline-none w-full transition-colors duration-200"
            style={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            disabled={isLoading || isExecuting}
            aria-label="Describe your application"
          />
          <div className="flex flex-col gap-3">
            <Button
              onClick={onSubmit}
              disabled={isButtonDisabled}
              className="w-full h-10 text-base font-medium bg-primary hover:bg-primary/90 text-black transition-all duration-200 disabled:opacity-50 mt-4"
              style={{ fontFamily: 'Funnel Display, serif' }}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-4 h-4" />
                  Generating Plan...
                </>
              ) : (
                'Generate System Design'
              )}
            </Button>
            {prompt.trim().length > 0 && prompt.trim().length < 10 && (
              <p className="text-xs text-amber-500 text-center bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded border border-amber-200 dark:border-amber-800">
                Please provide more detail (at least 10 characters)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* API Key Configuration */}
      <div className="mt-4">
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Funnel Display, serif' }}>
                  API Configuration
                </h4>
                {apiKey && apiKey.trim().length > 0 && (
                  <div className="w-6 h-6 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs font-semibold">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Enter your Gemini API key to use the AI features
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2 py-4">
                <label htmlFor="api-key" className="text-sm font-medium text-foreground">
                  Gemini API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="ENTER YOUR GEMINI API KEY..."
                  className="mt-2 w-full h-10 px-4 py-2 text-sm text-foreground border border-border/50 bg-transparent rounded-lg focus:border-primary/50 focus:outline-none transition-colors duration-200"
                />
              </div>
              <p className="text-xs text-muted-foreground/60">
                Get your API key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default PromptInput;
