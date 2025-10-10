import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Mail, BarChart3, Shield, Globe, Eye, Settings } from "lucide-react";

const UserGuide = () => {
  const steps = [
    {
      icon: Chrome,
      title: "1. Install Chrome Extension",
      description: "Load the extension from public/extension/ folder into Chrome",
      details: [
        "Open Chrome and go to chrome://extensions/",
        "Enable 'Developer mode' in the top right",
        "Click 'Load unpacked' and select the public/extension folder",
        "The Zerophish AI extension is now active!"
      ],
      badge: "Required"
    },
    {
      icon: Globe,
      title: "2. Automatic Website Protection",
      description: "Browse safely with real-time threat detection",
      details: [
        "Visit any website - protection is automatic",
        "High-risk sites are blocked immediately",
        "Medium-risk sites show warnings",
        "All scans complete in <50ms"
      ],
      badge: "Auto"
    },
    {
      icon: Mail,
      title: "3. Gmail Phishing Detection",
      description: "Intelligent email scanning in Gmail",
      details: [
        "Open Gmail - detection runs automatically",
        "Suspicious emails are flagged with warnings",
        "View threat analysis for each email",
        "Supports all languages worldwide"
      ],
      badge: "Auto"
    },
    {
      icon: Eye,
      title: "4. Manual Scanning",
      description: "Scan URLs and content on-demand",
      details: [
        "Click the Zerophish AI extension icon",
        "View current page threat analysis",
        "Manual scan option available",
        "See all three AI detective results"
      ],
      badge: "Manual"
    },
    {
      icon: BarChart3,
      title: "5. View Statistics",
      description: "Track threats and protection metrics",
      details: [
        "Click extension icon to see stats",
        "View total threats blocked",
        "See detection breakdown by level",
        "Access full dashboard for details"
      ],
      badge: "Stats"
    },
    {
      icon: Shield,
      title: "6. Dashboard & Heatmap",
      description: "Analyze global threat patterns",
      details: [
        "Navigate to Dashboard page",
        "View interactive world threat heatmap",
        "See IP origins, domains, countries",
        "Track threat intelligence data"
      ],
      badge: "Analytics"
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Multi-Language Detection",
      description: "Detects phishing in ALL languages - English, Spanish, Chinese, Arabic, and 100+ more"
    },
    {
      icon: Shield,
      title: "Threat Intelligence",
      description: "Integrates AlienVault OTX and URLScan.io for advanced threat data"
    },
    {
      icon: Eye,
      title: "Adversarial Layer",
      description: "Tracks IP origins, ASN, ISP, and domain infrastructure patterns"
    },
    {
      icon: Settings,
      title: "Sandbox Analysis",
      description: "Analyzes URLs in isolated environments to detect malicious behavior"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Complete User Guide
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              How to Use Zerophish AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to get complete protection against phishing attacks
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-shadow border-border bg-card"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{step.badge}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          {/* Advanced Features */}
          <div className="space-y-6 pt-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Advanced Protection Features
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powered by cutting-edge AI and threat intelligence
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Demo & Dashboard Links */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Ready to See It in Action?
              </h3>
              <p className="text-muted-foreground">
                Try our live demo or view the threat dashboard
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <a 
                  href="/demo" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Chrome className="w-5 h-5" />
                  Try Live Demo
                </a>
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UserGuide;
