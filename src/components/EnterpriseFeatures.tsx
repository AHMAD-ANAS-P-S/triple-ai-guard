import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Lock, Activity, QrCode, Mic, Globe } from "lucide-react";

export default function EnterpriseFeatures() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Behavioral AI Layer",
      description: "Detects DOM manipulation, credential harvesting, and keylogging attempts",
      status: "Active"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Social Engineering Detection",
      description: "Multi-language persuasion pattern analysis with AI",
      status: "Active"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "URL Decomposition Engine",
      description: "Advanced subdomain analysis and homograph attack detection",
      status: "Active"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Browser Isolation Mode",
      description: "Sandboxed environment for suspicious sites",
      status: "Active"
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Code Detection",
      description: "Real-time QR code scanning and threat analysis",
      status: "Active"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Vishing Detection",
      description: "Voice phishing and deepfake detection",
      status: "Active"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Dark Web Monitoring",
      description: "Breach detection and exposure scoring",
      status: "Active"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">🚀 Enterprise Protection Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="p-4 border-border hover:border-primary/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <Badge className="text-xs bg-success/10 text-success border-success/20">{feature.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
