import { Card } from "@/components/ui/card";
import { Brain, Image, Network } from "lucide-react";
import aiDetectionImage from "@/assets/ai-detection.jpg";

const TripleAI = () => {
  const aiEngines = [
    {
      icon: Brain,
      title: "NLP Detective",
      tech: "BERT/RoBERTa",
      checks: ["Urgent/fake text patterns", "AI-generated content", "Social engineering tactics"],
      time: "15ms",
      color: "primary"
    },
    {
      icon: Image,
      title: "Visual Detective",
      tech: "CNN (ResNet/EfficientNet)",
      checks: ["Fake logos & branding", "Layout mismatches", "Color scheme anomalies"],
      time: "20ms",
      color: "warning"
    },
    {
      icon: Network,
      title: "Network Detective",
      tech: "GNN (PyTorch)",
      checks: ["Scam domain patterns", "Server clusters", "DNS anomalies"],
      time: "10ms",
      color: "success"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Triple-AI Detection</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-warning to-success bg-clip-text text-transparent">
              Three Layers, Instant Protection
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Three specialized AI models work in parallel, analyzing every aspect 
            of potential threats in under 50 milliseconds
          </p>
        </div>

        {/* AI Visualization */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-primary/20">
            <img 
              src={aiDetectionImage} 
              alt="AI Detection Network" 
              className="w-full h-auto opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="text-2xl font-bold text-foreground mb-2">
                Parallel Analysis Pipeline
              </div>
              <div className="text-muted-foreground">
                All three detectives analyze simultaneously for maximum speed and accuracy
              </div>
            </div>
          </div>
        </div>

        {/* AI Engine Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {aiEngines.map((engine, index) => {
            const Icon = engine.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="space-y-4">
                  {/* Icon & Time */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-${engine.color}/10 border border-${engine.color}/20`}>
                      <Icon className={`w-6 h-6 text-${engine.color}`} />
                    </div>
                    <div className={`text-2xl font-bold text-${engine.color}`}>
                      {engine.time}
                    </div>
                  </div>

                  {/* Title & Tech */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {engine.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {engine.tech}
                    </p>
                  </div>

                  {/* Checks */}
                  <div className="space-y-2">
                    {engine.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${engine.color} mt-1.5 flex-shrink-0`} />
                        <span className="text-sm text-muted-foreground">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-secondary/50 backdrop-blur-sm border border-primary/20">
            <span className="text-sm text-muted-foreground">Combined Analysis:</span>
            <span className="text-2xl font-bold text-primary">&lt;50ms</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-2xl font-bold text-success">99.8%</span>
            <span className="text-sm text-muted-foreground">Accuracy</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripleAI;
