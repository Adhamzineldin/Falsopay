import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SystemService, SystemStatus } from '@/services/system.service';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Database, 
  Radio, 
  Server,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

const AdminSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStatus();
    
    // Set up interval to refresh every 60 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    setIsLoading(true);
    try {
      const status = await SystemService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system status information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Degraded</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Outage</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>System Status</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchSystemStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Monitor backend services and system health
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && !systemStatus ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : systemStatus ? (
          <div className="space-y-6">
            {/* Database Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Database</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.database.status)}
                  {getStatusBadge(systemStatus.database.status)}
                </div>
              </div>
              <p className="text-sm text-gray-500">{systemStatus.database.message}</p>
              <div className="text-xs text-gray-400">
                Response time: {systemStatus.database.response_time}
              </div>
            </div>

            <Separator />

            {/* WebSocket Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">WebSocket</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.websocket.status)}
                  {getStatusBadge(systemStatus.websocket.status)}
                </div>
              </div>
              <p className="text-sm text-gray-500">{systemStatus.websocket.message}</p>
              <div className="text-xs text-gray-400">
                Response time: {systemStatus.websocket.response_time}
              </div>
            </div>

            <Separator />

            {/* API Server Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">API Server</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.server.status)}
                  {getStatusBadge(systemStatus.server.status)}
                </div>
              </div>
              <p className="text-sm text-gray-500">{systemStatus.server.message}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">PHP Version:</span> {systemStatus.server.php_version}
                </div>
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">Memory Usage:</span> {systemStatus.server.memory_usage}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Unable to fetch system status information
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-gray-500 justify-between flex-wrap">
        <div>Last updated: {systemStatus ? new Date(systemStatus.timestamp).toLocaleString() : 'Never'}</div>
        <div>Updates automatically every 60 seconds</div>
      </CardFooter>
    </Card>
  );
};

export default AdminSystemStatus; 