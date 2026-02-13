import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Brain, Link2, AlertTriangle, Bug, Eye, Globe, Mail,
  CheckCircle, XCircle, FileText, Fingerprint, QrCode, Mic
} from "lucide-react";

interface ThreatDetailModalProps {
  threat: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
          <circle
            cx="40" cy="40" r="36"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
};

const ScoreBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: any }) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return "bg-destructive";
    if (s >= 40) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">{score}/100</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getBarColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const BoolIndicator = ({ label, value }: { label: string; value: boolean | null | undefined }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    {value ? (
      <div className="flex items-center gap-1 text-destructive">
        <XCircle className="w-4 h-4" />
        <span className="text-xs font-semibold">Detected</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-success">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-semibold">Clear</span>
      </div>
    )}
  </div>
);

const IssueList = ({ issues }: { issues: any[] | null | undefined }) => {
  if (!issues || issues.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No issues detected</p>;
  }
  return (
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
          <span className="text-foreground">{typeof issue === 'string' ? issue : JSON.stringify(issue)}</span>
        </li>
      ))}
    </ul>
  );
};

const ThreatDetailModal = ({ threat, open, onOpenChange }: ThreatDetailModalProps) => {
  if (!threat) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'hsl(var(--destructive))';
      case 'medium': return 'hsl(var(--warning))';
      default: return 'hsl(var(--success))';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              threat.threat_level === 'high' ? 'bg-destructive/10 border border-destructive/20' :
              threat.threat_level === 'medium' ? 'bg-warning/10 border border-warning/20' :
              'bg-success/10 border border-success/20'
            }`}>
              <Shield className="w-5 h-5" style={{ color: getLevelColor(threat.threat_level) }} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg text-foreground truncate">
                {threat.url || 'Email/SMS Content'}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`text-xs ${
                    threat.threat_level === 'high' ? 'bg-destructive/10 text-destructive' :
                    threat.threat_level === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}
                >
                  {threat.verdict}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Confidence: {threat.confidence}%
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Score Overview Rings */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 py-4 border-b border-border">
          <ScoreRing score={threat.nlp_score || 0} label="NLP" color="hsl(var(--primary))" />
          <ScoreRing score={threat.visual_score || 0} label="Visual" color="hsl(var(--accent))" />
          <ScoreRing score={threat.network_score || 0} label="Network" color="hsl(var(--warning))" />
          <ScoreRing score={threat.behavior_score || 0} label="Behavioral" color="hsl(var(--destructive))" />
          <ScoreRing score={threat.social_engineering_score || 0} label="Social Eng." color="hsl(45, 100%, 60%)" />
          <ScoreRing score={threat.url_decomposition_score || 0} label="URL Decomp." color="hsl(280, 80%, 60%)" />
          <ScoreRing score={threat.adversarial_score || 0} label="Adversarial" color="hsl(330, 80%, 55%)" />
          <ScoreRing score={threat.exposure_score || 0} label="Exposure" color="hsl(200, 80%, 55%)" />
        </div>

        <Tabs defaultValue="engines" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="engines">Engines</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="intel">Intelligence</TabsTrigger>
            <TabsTrigger value="explanation">AI Report</TabsTrigger>
          </TabsList>

          {/* Detection Engines Tab */}
          <TabsContent value="engines" className="space-y-4 mt-4">
            <Card className="p-4 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Core Detection Engines
              </h4>
              <div className="space-y-3">
                <ScoreBar label="NLP Analysis" score={threat.nlp_score || 0} icon={FileText} />
                <ScoreBar label="Visual Analysis" score={threat.visual_score || 0} icon={Eye} />
                <ScoreBar label="Network Analysis" score={threat.network_score || 0} icon={Globe} />
              </div>
            </Card>

            <Card className="p-4 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-destructive" /> Advanced Detection Engines
              </h4>
              <div className="space-y-3">
                <ScoreBar label="Behavioral AI" score={threat.behavior_score || 0} icon={Bug} />
                <ScoreBar label="Social Engineering" score={threat.social_engineering_score || 0} icon={AlertTriangle} />
                <ScoreBar label="URL Decomposition" score={threat.url_decomposition_score || 0} icon={Link2} />
                <ScoreBar label="Adversarial Defense" score={threat.adversarial_score || 0} icon={Fingerprint} />
              </div>
            </Card>

            {/* Issues per engine */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary/30 border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">NLP Issues</h5>
                <IssueList issues={threat.nlp_issues} />
              </Card>
              <Card className="p-4 bg-secondary/30 border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Visual Issues</h5>
                <IssueList issues={threat.visual_issues} />
              </Card>
              <Card className="p-4 bg-secondary/30 border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Behavioral Issues</h5>
                <IssueList issues={threat.behavior_issues} />
              </Card>
              <Card className="p-4 bg-secondary/30 border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Adversarial Issues</h5>
                <IssueList issues={threat.adversarial_issues} />
              </Card>
            </div>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-4 mt-4">
            <Card className="p-4 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Threat Indicators</h4>
              <BoolIndicator label="DOM Manipulation" value={threat.dom_manipulation_detected} />
              <BoolIndicator label="Credential Harvesting" value={threat.credential_harvesting_detected} />
              <BoolIndicator label="Homograph Attack" value={threat.homograph_detected} />
              <BoolIndicator label="Punycode Encoding" value={threat.punycode_detected} />
              <BoolIndicator label="Obfuscation" value={threat.obfuscation_detected} />
              <BoolIndicator label="QR Code Detected" value={threat.qr_code_detected} />
              <BoolIndicator label="Deepfake Detected" value={threat.deepfake_detected} />
              <BoolIndicator label="Sandbox Analyzed" value={threat.sandbox_analyzed} />
            </Card>

            <Card className="p-4 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" /> Email Authentication
              </h4>
              <BoolIndicator label="SPF Pass" value={threat.spf_pass} />
              <BoolIndicator label="DKIM Pass" value={threat.dkim_pass} />
              <BoolIndicator label="DMARC Pass" value={threat.dmarc_pass} />
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Sender Reputation</span>
                <span className="text-sm font-bold text-foreground">{threat.sender_reputation || 0}/100</span>
              </div>
            </Card>

            {threat.manipulation_tactics && threat.manipulation_tactics.length > 0 && (
              <Card className="p-4 bg-secondary/30 border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">Social Engineering Tactics</h4>
                <div className="flex flex-wrap gap-2">
                  {threat.manipulation_tactics.map((tactic: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-warning border-warning/30 bg-warning/5">
                      {tactic}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {threat.url_decomposition && Object.keys(threat.url_decomposition).length > 0 && (
              <Card className="p-4 bg-secondary/30 border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> URL Decomposition
                </h4>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(threat.url_decomposition).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-muted-foreground min-w-[80px]">{key}:</span>
                      <span className="text-foreground break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Subdomain Depth</span>
                  <span className="text-sm font-bold text-foreground">{threat.subdomain_depth || 0}</span>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Threat Intelligence Tab */}
          <TabsContent value="intel" className="space-y-4 mt-4">
            <Card className="p-4 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Infrastructure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ASN</span>
                  <span className="text-foreground font-mono">{threat.asn || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISP</span>
                  <span className="text-foreground">{threat.isp || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attack Type</span>
                  <span className="text-foreground">{threat.attack_type || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {threat.breach_data && threat.breach_data.length > 0 && (
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <h4 className="text-sm font-semibold text-destructive mb-3">Dark Web Exposure</h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Exposure Score</span>
                  <span className="text-lg font-bold text-destructive">{threat.exposure_score}/100</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {threat.breach_data.map((breach: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-destructive border-destructive/30">
                      {breach}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {threat.sandbox_report && Object.keys(threat.sandbox_report).length > 0 && (
              <Card className="p-4 bg-secondary/30 border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">Sandbox Report</h4>
                <pre className="text-xs text-muted-foreground bg-background rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(threat.sandbox_report, null, 2)}
                </pre>
              </Card>
            )}

            {threat.vishing_score > 0 && (
              <Card className="p-4 bg-secondary/30 border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Vishing Analysis
                </h4>
                <ScoreBar label="Vishing Score" score={threat.vishing_score || 0} icon={Mic} />
                <BoolIndicator label="Deepfake Detected" value={threat.deepfake_detected} />
                {threat.vishing_explanation && (
                  <p className="text-sm text-muted-foreground mt-3">{threat.vishing_explanation}</p>
                )}
              </Card>
            )}
          </TabsContent>

          {/* AI Explanation Tab */}
          <TabsContent value="explanation" className="mt-4">
            <Card className="p-5 bg-secondary/30 border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> AI-Generated Threat Report
              </h4>
              {threat.ai_explanation ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {threat.ai_explanation}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No AI explanation available for this threat. Newer analyses will include detailed AI-generated reports.
                </p>
              )}
            </Card>

            <Card className="p-5 bg-secondary/30 border-border mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Analysis Summary</h4>
              <p className="text-sm text-foreground mb-4">{threat.reason}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threat Level</span>
                  <Badge className={`text-xs ${
                    threat.threat_level === 'high' ? 'bg-destructive/10 text-destructive' :
                    threat.threat_level === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {threat.threat_level}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-bold text-foreground">{threat.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User IP</span>
                  <span className="font-mono text-xs text-foreground">{threat.user_ip || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs text-foreground">
                    {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ThreatDetailModal;
