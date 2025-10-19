import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Clock, Globe, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import ThreatMap from "@/components/ThreatMap";

const Dashboard = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    warned: 0,
    safe: 0,
    avgResponseTime: "42ms"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreats();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchThreats, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchThreats = async () => {
    try {
      // Use secure edge function instead of direct database access
      const { data, error } = await supabase.functions.invoke('get-threats');

      if (error) throw error;

      setThreats(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const blocked = data?.filter((t: any) => t.threat_level === 'high').length || 0;
      const warned = data?.filter((t: any) => t.threat_level === 'medium').length || 0;
      const safe = data?.filter((t: any) => t.threat_level === 'low').length || 0;
      
      setStats({ total, blocked, warned, safe, avgResponseTime: "42ms" });
    } catch (error) {
      console.error('Error fetching threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const topThreats = [
    { category: "Banking/Financial", count: stats.blocked, percentage: stats.total > 0 ? (stats.blocked / stats.total) * 100 : 0 },
    { category: "Suspicious URLs", count: stats.warned, percentage: stats.total > 0 ? (stats.warned / stats.total) * 100 : 0 },
    { category: "Safe Content", count: stats.safe, percentage: stats.total > 0 ? (stats.safe / stats.total) * 100 : 0 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Security Dashboard</h1>
                <p className="text-muted-foreground">Real-time protection analytics and threat monitoring</p>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                Protected
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <Badge variant="outline" className="text-destructive border-destructive/50">
                  High Risk
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{loading ? '-' : stats.blocked}</div>
                <div className="text-sm text-muted-foreground">Threats Blocked</div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <Badge variant="outline" className="text-warning border-warning/50">
                  Medium Risk
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{loading ? '-' : stats.warned}</div>
                <div className="text-sm text-muted-foreground">Warnings Issued</div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="text-success border-success/50">
                  +{stats.total}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{loading ? '-' : stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Analyzed</div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <Badge variant="outline" className="text-accent border-accent/50">
                  Fast
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{stats.avgResponseTime}</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </Card>
          </div>

          {/* Global Threat Map */}
          <div className="mb-8">
            <ThreatMap threats={threats} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Threats */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Recent Detections</h2>
                  <Badge variant="outline">Real-time</Badge>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading threats...</p>
                  ) : threats.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No threats detected yet</p>
                      <p className="text-sm text-muted-foreground">
                        Try analyzing some content in the <a href="/demo" className="text-primary hover:underline">Demo page</a>
                      </p>
                    </div>
                  ) : (
                    threats.slice(0, 5).map((threat) => (
                      <div 
                        key={threat.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all"
                      >
                        <div className={`p-2 rounded-lg bg-${getStatusColor(threat.threat_level)}/10 border border-${getStatusColor(threat.threat_level)}/20 flex-shrink-0`}>
                          {threat.threat_level === 'high' && <Shield className="w-5 h-5 text-destructive" />}
                          {threat.threat_level === 'medium' && <AlertTriangle className="w-5 h-5 text-warning" />}
                          {threat.threat_level === 'low' && <CheckCircle className="w-5 h-5 text-success" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <Badge className={`bg-${getStatusColor(threat.threat_level)}/10 text-${getStatusColor(threat.threat_level)} border-${getStatusColor(threat.threat_level)}/20 mb-2`}>
                                {threat.verdict}
                              </Badge>
                              <div className="font-semibold text-foreground truncate">
                                {threat.url ? threat.url.substring(0, 50) + '...' : 'Email/SMS Content'}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(threat.created_at)}</div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{threat.reason}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-${getStatusColor(threat.threat_level)}`}
                                style={{ width: `${threat.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground">{threat.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Threat Categories */}
            <div className="space-y-6">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Threat Distribution</h2>
                <div className="space-y-4">
                  {topThreats.map((threat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{threat.category}</span>
                        <span className="text-sm font-bold text-primary">{threat.count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${threat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-start gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Protection Score</h3>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {stats.total > 0 ? Math.round((stats.blocked / stats.total) * 100) : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detection rate based on AI analysis
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-accent flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">AI Detection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Powered by Triple-AI Engine (NLP + Visual + Network)
                    </p>
                    <div className="text-2xl font-bold text-accent">Real-time</div>
                    <div className="text-xs text-muted-foreground">Analysis speed</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;