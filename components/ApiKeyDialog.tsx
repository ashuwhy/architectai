import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      return;
    }
    
    setIsValidating(true);
    try {
      // Basic validation - check if it looks like a Gemini API key
      if (apiKey.length < 20) {
        alert('Please enter a valid Gemini API key');
        return;
      }
      
      onSave(apiKey.trim());
      onClose();
    } catch (error) {
      console.error('Error validating API key:', error);
      alert('Error validating API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border border-border bg-card shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'Lineal, serif' }}>
              API Configuration
            </h3>
            <p className="text-sm text-muted-foreground/60">
              Enter your Gemini API key to use the AI features
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium text-foreground">
              Gemini API Key
            </label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ENTER YOUR GEMINI API KEY..."
              className="w-full"
              disabled={isValidating}
            />
            <p className="text-xs text-muted-foreground/60">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!apiKey.trim() || isValidating}
              style={{ fontFamily: 'Lineal, serif' }}
            >
              {isValidating ? 'Validating...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyDialog;
