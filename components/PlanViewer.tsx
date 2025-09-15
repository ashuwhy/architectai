
import React from 'react';
import { PlanItem, PlanStatus } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PlanViewerProps {
  plan: PlanItem[];
  isExecuting: boolean;
}

const StatusBadge: React.FC<{ status: PlanStatus }> = ({ status }) => {
  switch (status) {
    case PlanStatus.InProgress:
      return (
        <div className="inline-flex items-center rounded-full bg-primary/15 text-primary border border-primary/20 px-3 py-1.5 text-xs font-semibold shadow-sm">
          <SpinnerIcon className="w-3 h-3 mr-1.5" />
          Working
        </div>
      );
    case PlanStatus.Completed:
      return (
        <div className="inline-flex items-center rounded-full bg-green-500/15 text-green-600 border border-green-500/20 px-3 py-1.5 text-xs font-semibold shadow-sm">
          <CheckIcon className="w-3 h-3 mr-1.5" />
          Done
        </div>
      );
    case PlanStatus.Pending:
      return (
        <div className="inline-flex items-center rounded-full bg-muted/60 text-muted-foreground border border-border/50 px-3 py-1.5 text-xs font-semibold">
          Pending
        </div>
      );
    case PlanStatus.Failed:
      return (
        <div className="inline-flex items-center rounded-full bg-destructive/15 text-destructive border border-destructive/20 px-3 py-1.5 text-xs font-semibold shadow-sm">
          Failed
        </div>
      );
    default:
      return null;
  }
};

const PlanViewer: React.FC<PlanViewerProps> = ({ plan, isExecuting }) => {
  if (plan.length === 0) {
    return (
      <div className="w-full mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-semibold text-primary">2</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Lineal, serif' }}>Agent's Plan</h2>
            <p className="text-xs text-muted-foreground/60 mt-1">AI-generated execution plan will appear here</p>
          </div>
        </div>
        
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-foreground" style={{ fontFamily: 'Lineal, serif' }}>No Plan Generated Yet</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Describe your application to generate an AI-powered execution plan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-semibold text-primary">2</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Lineal, serif' }}>Agent's Plan</h2>
            <p className="text-xs text-muted-foreground/60 mt-1">AI-generated execution plan</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {plan.filter(p => p.status === PlanStatus.Completed).length}/{plan.length} completed
        </div>
      </div>
      
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-8">
            {plan.map((item, index) => (
              <div
                key={item.id}
                className={`group flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 hover:shadow-md ${index < plan.length - 1 ? 'mb-4' : ''} ${
                  item.status === PlanStatus.InProgress 
                    ? 'bg-primary/8 border-primary/30 shadow-sm ring-1 ring-ring' 
                    : item.status === PlanStatus.Completed
                    ? 'bg-green-500/8 border-green-500/30 shadow-sm ring-1 ring-ring'
                    : item.status === PlanStatus.Failed
                    ? 'bg-destructive/8 border-destructive/30 shadow-sm ring-1 ring-ring'
                    : 'bg-primary/5 border-primary/20 hover:border-primary/30 hover:bg-primary/8'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  item.status === PlanStatus.InProgress 
                    ? 'bg-primary text-white shadow-md' 
                    : item.status === PlanStatus.Completed
                    ? 'bg-green-500 text-white shadow-md'
                    : item.status === PlanStatus.Failed
                    ? 'bg-destructive text-white shadow-md'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-semibold transition-colors duration-200 ${
                    item.status === PlanStatus.Completed 
                      ? 'text-foreground line-through' 
                      : item.status === PlanStatus.Failed
                      ? 'text-destructive'
                      : item.status === PlanStatus.InProgress
                      ? 'text-primary'
                      : 'text-foreground'
                  }`} style={{ fontFamily: 'Lineal, serif' }}>
                    {item.title}
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-200 ${
                    item.status === PlanStatus.Completed 
                      ? 'text-muted-foreground/60' 
                      : 'text-muted-foreground/60'
                  }`}>
                    {item.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanViewer;
