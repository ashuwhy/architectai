import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
// import { Progress } from './ui/progress';
import { getGenerationStatus, getUserActivity, getUserStats } from '../services/redis';
import { useAuth } from './auth/AuthProvider';
import { Activity, BarChart3, Clock, Zap } from 'lucide-react';

interface RedisStatusProps {
  isGenerating: boolean;
}

const RedisStatus: React.FC<RedisStatusProps> = ({ isGenerating }) => {
  const { user } = useAuth();
  const [generationStatus, setGenerationStatus] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        // Get generation status
        const status = await getGenerationStatus(user.uid, 'current');
        setGenerationStatus(status);

        // Get user stats
        const stats = await getUserStats(user.uid, 7);
        setUserStats(stats);

        // Get recent activity
        const activity = await getUserActivity(user.uid, 5);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to fetch Redis status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [user, isGenerating]);

  if (!user) return null;

  const getTotalRequests = () => {
    let total = 0;
    Object.values(userStats).forEach((dayStats: any) => {
      Object.values(dayStats).forEach((count: any) => {
        total += parseInt(count) || 0;
      });
    });
    return total;
  };

  const getTodayRequests = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = userStats[today] || {};
    return Object.values(todayStats).reduce((sum: number, count: any) => sum + (parseInt(count) || 0), 0);
  };

  const getActivityDisplayName = (activityType: string) => {
    const activityMap: { [key: string]: string } = {
      'plan_generation_started': 'Plan Started',
      'plan_generated': 'Plan Generated',
      'document_generated': 'Doc Generated',
      'document_completed': 'Doc Completed',
      'history_viewed': 'History Viewed',
      'api_key_used': 'API Key Used',
      'rate_limit_hit': 'Rate Limit Hit'
    };
    
    return activityMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Generation Status */}
      {generationStatus && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'Lineal, serif' }}>
              <Zap className="h-4 w-4 text-primary" />
              Generation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{generationStatus.progress || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${generationStatus.progress || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{generationStatus.currentSection || 'Starting...'}</span>
                <span>{generationStatus.completedSections || 0}/{generationStatus.totalSections || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'Lineal, serif' }}>
            <BarChart3 className="h-4 w-4" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getTotalRequests()}</div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTodayRequests()}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'Lineal, serif' }}>
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{getActivityDisplayName(activity.type)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RedisStatus;
