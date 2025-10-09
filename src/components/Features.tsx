import { Card } from "@/components/ui/card";
import { Chrome, Mail, Smartphone, BarChart3, RefreshCw, Globe } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Real-time protection for Chrome, Edge, and Firefox with instant threat blocking"
    },
    {
      icon: Mail,
      title: "Email Integration",
      description: "Seamlessly integrates with Gmail and Outlook to scan incoming messages"
    },
    {
      icon: Smartphone,
      title: "SMS Protection",
      description: "WhatsApp and SMS integration to catch smishing attempts"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track blocked threats, view patterns, and monitor your security posture"
    },
    {
      icon: RefreshCw,
      title: "Continuous Learning",
      description: "Auto-retraining every 4 hours with global threat feeds for zero-day protection"
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Support for English, Hindi, Tamil, and more languages coming soon"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Complete Protection</span>
            <br />
            <span className="text-primary">Everywhere You Go</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Zerophish AI works across all your devices and platforms
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
