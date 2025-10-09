import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Info, CheckCircle } from "lucide-react";

const DecisionEngine = () => {
  const scenarios = [
    {
      confidence: "91-100%",
      scenario: "All 3 AI engines agree",
      action: "🚫 BLOCK IMMEDIATELY",
      icon: Shield,
      color: "destructive",
      message: "BLOCKED – Fake PayPal detected by all layers",
      example: "Detected fake PayPal login page with spoofed domain and urgent language"
    },
    {
      confidence: "70-90%",
      scenario: "2 out of 3 engines agree",
      action: "🚫 BLOCK with User Option",
      icon: AlertTriangle,
      color: "warning",
      message: "CAUTION – Domain 1 day old + urgent language. Click 'Proceed Anyway' if trusted",
      example: "Suspicious email with new domain but legitimate-looking content"
    },
    {
      confidence: "30-69%",
      scenario: "1 engine detects issues",
      action: "⚠ WARN but ALLOW",
      icon: Info,
      color: "primary",
      message: "ADVISORY – Mild suspicious language detected. Proceed with caution",
      example: "Marketing email with slightly aggressive language but verified domain"
    },
    {
      confidence: "<30%",
      scenario: "All engines report safe",
      action: "✅ ALLOW",
      icon: CheckCircle,
      color: "success",
      message: "Normal browsing continues",
      example: "Legitimate website with proper SSL, verified domain, and clean content"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Smart Decision Engine</span>
            <br />
            <span className="bg-gradient-to-r from-success via-primary to-destructive bg-clip-text text-transparent">
              Confidence-Based Protection
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Our AI doesn't just detect threats—it explains them in plain language 
            and takes appropriate action based on confidence levels
          </p>
        </div>

        {/* Decision Flow */}
        <div className="max-w-4xl mx-auto space-y-6">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left: Icon & Confidence */}
                  <div className="flex-shrink-0">
                    <div className={`p-4 rounded-lg bg-${scenario.color}/10 border border-${scenario.color}/20 mb-3`}>
                      <Icon className={`w-8 h-8 text-${scenario.color}`} />
                    </div>
                    <Badge variant="outline" className={`border-${scenario.color}/50`}>
                      {scenario.confidence}
                    </Badge>
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 space-y-3">
                    {/* Scenario */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Scenario</div>
                      <div className="text-lg font-semibold text-foreground">{scenario.scenario}</div>
                    </div>

                    {/* Action */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Action</div>
                      <div className={`text-lg font-bold text-${scenario.color}`}>{scenario.action}</div>
                    </div>

                    {/* User Message */}
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="text-sm text-muted-foreground mb-1">User sees:</div>
                      <div className="text-foreground font-medium">{scenario.message}</div>
                    </div>

                    {/* Example */}
                    <div className="text-sm text-muted-foreground italic">
                      Example: {scenario.example}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Key Feature Highlight */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-foreground">
                Clear Explanations, Every Time
              </div>
              <p className="text-muted-foreground">
                Zerophish AI doesn't just block threats—it educates users with 
                clear, plain-language explanations for every decision, reducing 
                false positives and building security awareness.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DecisionEngine;
