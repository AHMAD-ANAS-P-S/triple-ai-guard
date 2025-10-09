import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "User Action",
      description: "Click link, open email/SMS, or visit website",
      detail: "System triggers instant data collection"
    },
    {
      number: "02",
      title: "Smart Collection",
      description: "Capture text, visuals, and network data",
      detail: "Complete threat profile in milliseconds"
    },
    {
      number: "03",
      title: "Triple AI Analysis",
      description: "NLP + CNN + GNN run in parallel",
      detail: "Three detection engines, <50ms total"
    },
    {
      number: "04",
      title: "Decision Engine",
      description: "Confidence scoring & explanation",
      detail: "Clear verdict with reasoning"
    },
    {
      number: "05",
      title: "Action Taken",
      description: "Block, warn, or allow with dashboard update",
      detail: "Real-time protection + analytics"
    },
    {
      number: "06",
      title: "Continuous Learning",
      description: "Auto-retraining + threat feed integration",
      detail: "Always adapting to new threats"
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
            <span className="text-foreground">How Zerophish</span>
            <br />
            <span className="text-primary">Protects You</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            End-to-end protection in six seamless steps
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="flex gap-6 items-start mb-8">
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-1">
                    {step.description}
                  </p>
                  <p className="text-sm text-primary">
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <div className="flex justify-start ml-8 mb-8">
                  <ArrowRight className="w-6 h-6 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="text-3xl font-bold text-foreground">
              From Click to Protection
            </div>
            <div className="text-xl text-primary font-bold">
              &lt;50 milliseconds
            </div>
            <div className="text-muted-foreground max-w-md">
              Faster than a human can blink, Zerophish AI analyzes and protects 
              you from sophisticated phishing attacks
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
