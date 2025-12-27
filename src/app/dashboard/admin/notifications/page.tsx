'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  recipient_id: string | null;
  type: string;
  title: string;
  message: string;
  sent_at: string;
  read_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
}

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    type: 'broadcast',
    title: '',
    message: '',
    bloodGroup: '',
    district: '',
  });

  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      // For broadcast, set recipient_id to null
      const { error } = await supabase.from('notifications').insert({
        recipient_id: null,
        type: 'broadcast',
        title: notificationForm.title,
        message: notificationForm.message,
        metadata: {
          blood_group: notificationForm.bloodGroup || null,
          district: notificationForm.district || null,
        },
      });

      if (error) throw error;

      toast.success('Broadcast sent successfully!');
      setShowDialog(false);
      setNotificationForm({
        type: 'broadcast',
        title: '',
        message: '',
        bloodGroup: '',
        district: '',
      });
      loadNotifications();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (notification: Notification) => {
    if (notification.failed_at) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (notification.delivered_at) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusText = (notification: Notification) => {
    if (notification.failed_at) return 'Failed';
    if (notification.delivered_at) return 'Delivered';
    return 'Pending';
  };

  const getStatusColor = (notification: Notification) => {
    if (notification.failed_at) return 'bg-red-100 text-red-800';
    if (notification.delivered_at) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Send and manage system notifications</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Broadcast Notification</DialogTitle>
              <DialogDescription>
                Send a notification to all users or filter by blood group/district
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, title: e.target.value })
                  }
                  placeholder="Emergency Blood Needed"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, message: e.target.value })
                  }
                  placeholder="We urgently need O+ blood donors..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="blood-group">Filter by Blood Group (Optional)</Label>
                  <Select
                    value={notificationForm.bloodGroup}
                    onValueChange={(value) =>
                      setNotificationForm({ ...notificationForm, bloodGroup: value })
                    }
                  >
                    <SelectTrigger id="blood-group">
                      <SelectValue placeholder="All Blood Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Blood Groups</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="district">Filter by District (Optional)</Label>
                  <Input
                    id="district"
                    value={notificationForm.district}
                    onChange={(e) =>
                      setNotificationForm({ ...notificationForm, district: e.target.value })
                    }
                    placeholder="Dhaka"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button onClick={sendBroadcast} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.delivered_at).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => !n.delivered_at && !n.failed_at).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.failed_at).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent notifications sent from the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications sent yet
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex gap-3 flex-1">
                    {getStatusIcon(notification)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{notification.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Sent: {new Date(notification.sent_at).toLocaleString()}
                        </span>
                        {notification.delivered_at && (
                          <span>
                            Delivered:{' '}
                            {new Date(notification.delivered_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(notification)}>
                    {getStatusText(notification)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

