import React from 'react';
import { DocumentHistory, deleteDocumentHistory } from '../services/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Calendar, FileText } from 'lucide-react';

interface HistoryViewerProps {
  history: DocumentHistory[];
  onLoadDocument: (history: DocumentHistory) => void;
  onDeleteDocument: (documentId: string) => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ 
  history, 
  onLoadDocument, 
  onDeleteDocument 
}) => {
  const handleDelete = async (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteDocumentHistory(documentId);
      onDeleteDocument(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Lineal, serif' }}>No History Yet</h3>
          <p className="text-muted-foreground">
            Your generated documents will appear here for easy access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Lineal, serif' }}>Document History</h2>
        <span className="text-sm text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-md font-medium">
          {history.length} docs
        </span>
      </div>
      
      <div className="space-y-3">
        {history.map((doc) => (
          <Card 
            key={doc.id} 
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 border-border bg-card/50 mb-4"
            onClick={() => onLoadDocument(doc)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {doc.title || doc.prompt.substring(0, 50) + (doc.prompt.length > 50 ? '...' : '')}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={(e) => handleDelete(doc.id!, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doc.prompt}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md font-medium">
                  {doc.plan.length} sections
                </span>
                <span className="text-xs bg-muted/50 text-muted-foreground border border-border/50 px-2 py-1 rounded-md font-medium">
                  {Math.round(doc.documentContent.length / 1000)}k chars
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryViewer;