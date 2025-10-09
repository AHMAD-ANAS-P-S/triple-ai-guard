import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, Brain, Image, Network, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Demo = () => {
  const [url, setUrl] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeContent = async () => {
    if (!url && !emailContent) {
      toast.error("Please enter a URL or email content to analyze");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-phishing', {
        body: { url, emailContent }
      });

      if (error) {
        console.error('Error analyzing:', error);
        toast.error(error.message || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      setResult(data);
      setIsAnalyzing(false);

      if (data.threat === "high") {
        toast.error("Phishing attempt detected and blocked!");
      } else if (data.threat === "medium") {
        toast.warning("Suspicious content detected. Proceed with caution.");
      } else {
        toast.success("Content appears safe!");
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error("Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case "high": return "destructive";
      case "medium": return "warning";
      default: return "success";
    }
  };

  const getThreatIcon = (threat: string) => {
    switch (threat) {
      case "high": return Shield;
      case "medium": return AlertTriangle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4" variant="outline">
              Interactive Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Test Zerophish AI</span>
              <br />
              <span className="text-primary">Detection Engine</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter a URL or paste email content to see our triple-AI detection in action
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Test Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      URL to Analyze
                    </label>
                    <Input 
                      type="url"
                      placeholder="https://suspicious-paypal-login.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-secondary/50 border-border"
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email/SMS Content
                    </label>
                    <Textarea 
                      placeholder="Paste suspicious email or SMS content here..."
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={8}
                      className="bg-secondary/50 border-border"
                    />
                  </div>

                  <Button 
                    onClick={analyzeContent}
                    disabled={isAnalyzing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Results Section */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Analysis Results</h2>
                
                {!result && !isAnalyzing && (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Enter content above and click "Analyze with AI" to see results
                    </p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
                      <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-foreground">Running Triple-AI Analysis</p>
                      <p className="text-sm text-muted-foreground">NLP • Visual • Network Detection</p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Verdict */}
                    <div className={`p-6 rounded-lg bg-${getThreatColor(result.threat)}/10 border border-${getThreatColor(result.threat)}/20`}>
                      <div className="flex items-start gap-4">
                        {(() => {
                          const Icon = getThreatIcon(result.threat);
                          return <Icon className={`w-8 h-8 text-${getThreatColor(result.threat)} flex-shrink-0`} />;
                        })()}
                        <div className="flex-1">
                          <div className={`text-2xl font-bold text-${getThreatColor(result.threat)} mb-1`}>
                            {result.verdict}
                          </div>
                          <p className="text-foreground">{result.reason}</p>
                          <div className="mt-4">
                            <div className="text-sm text-muted-foreground mb-2">Confidence Score</div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-${getThreatColor(result.threat)} transition-all duration-1000`}
                                  style={{ width: `${result.confidence}%` }}
                                />
                              </div>
                              <span className="text-lg font-bold text-foreground">{result.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Engine Breakdown */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">AI Engine Breakdown</h3>
                      
                      {/* NLP */}
                      <Card className="p-4 bg-secondary/50">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-foreground">NLP Detective</span>
                              <span className="text-primary font-bold">{result.nlp.score}%</span>
                            </div>
                            {result.nlp.issues.length > 0 && (
                              <ul className="space-y-1">
                                {result.nlp.issues.map((issue: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Card>

                      {/* Visual */}
                      <Card className="p-4 bg-secondary/50">
                        <div className="flex items-start gap-3">
                          <Image className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-foreground">Visual Detective</span>
                              <span className="text-warning font-bold">{result.visual.score}%</span>
                            </div>
                            {result.visual.issues.length > 0 && (
                              <ul className="space-y-1">
                                {result.visual.issues.map((issue: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-warning mt-1">•</span>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Card>

                      {/* Network */}
                      <Card className="p-4 bg-secondary/50">
                        <div className="flex items-start gap-3">
                          <Network className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-foreground">Network Detective</span>
                              <span className="text-success font-bold">{result.network.score}%</span>
                            </div>
                            {result.network.issues.length > 0 && (
                              <ul className="space-y-1">
                                {result.network.issues.map((issue: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-success mt-1">•</span>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Example Scenarios */}
            <Card className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Try These Examples</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="text-left h-auto py-3 px-4 border-border hover:border-primary/50"
                  onClick={() => {
                    setUrl("https://paypal-verify-account.suspicious.com");
                    setEmailContent("");
                  }}
                >
                  <div>
                    <div className="font-semibold text-foreground mb-1">Fake PayPal</div>
                    <div className="text-xs text-muted-foreground">High threat scenario</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left h-auto py-3 px-4 border-border hover:border-primary/50"
                  onClick={() => {
                    setEmailContent("URGENT! Your account will be closed in 24 hours. Click here to verify your information immediately or lose access forever!");
                    setUrl("");
                  }}
                >
                  <div>
                    <div className="font-semibold text-foreground mb-1">Urgent Email</div>
                    <div className="text-xs text-muted-foreground">Medium threat scenario</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left h-auto py-3 px-4 border-border hover:border-primary/50"
                  onClick={() => {
                    setUrl("https://github.com/repository");
                    setEmailContent("");
                  }}
                >
                  <div>
                    <div className="font-semibold text-foreground mb-1">Legitimate Site</div>
                    <div className="text-xs text-muted-foreground">Safe scenario</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Demo;
