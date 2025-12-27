import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Activity } from 'lucide-react';

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
  admin_name?: string;
}

interface ActivityLogTimelineProps {
  logs: ActivityLog[];
  maxItems?: number;
}

export function ActivityLogTimeline({ logs, maxItems = 10 }: ActivityLogTimelineProps) {
  const displayLogs = logs.slice(0, maxItems);

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return '+';
    if (action.includes('delete')) return '×';
    if (action.includes('update') || action.includes('edit')) return '↻';
    if (action.includes('approve')) return '✓';
    if (action.includes('reject')) return '✗';
    return '•';
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('update') || action.includes('edit'))
      return 'bg-blue-100 text-blue-800';
    if (action.includes('approve')) return 'bg-green-100 text-green-800';
    if (action.includes('reject')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent admin actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No activity yet</p>
          ) : (
            displayLogs.map((log, index) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getActionColor(
                      log.action
                    )}`}
                  >
                    {getActionIcon(log.action)}
                  </div>
                  {index < displayLogs.length - 1 && (
                    <div className="w-px h-full bg-gray-200 mt-1" />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {log.entity_type}
                    </span>
                  </div>

                  {log.admin_name && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span>{log.admin_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


