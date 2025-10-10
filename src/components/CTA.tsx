import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-card to-secondary border border-primary/20 shadow-glow">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Ready to Stop Phishing?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users protected by Zerophish AI. 
                  Install our browser extension and get instant protection in seconds.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">10M+</div>
                  <div className="text-sm text-muted-foreground">Threats Blocked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">4.9/5</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                  onClick={() => navigate("/demo")}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Try Live Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => navigate("/dashboard")}
                >
                  View Dashboard
                </Button>
              </div>

              {/* Trust badge */}
              <p className="text-sm text-muted-foreground pt-4">
                Free forever • No credit card required • 2-minute setup
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
