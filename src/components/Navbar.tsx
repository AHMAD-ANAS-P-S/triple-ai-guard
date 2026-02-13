import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const scrollToSection = (id: string) => {
    // If not on the index page, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Zerophish AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("how-it-works")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <Link 
              to="/demo"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
            <Link 
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => navigate("/demo")}
                >
                  Try Demo
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                How It Works
              </button>
              <Link 
                to="/demo"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Demo
              </Link>
              <Link 
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-primary/50 hover:bg-primary/10 w-full"
                      onClick={() => {
                        navigate("/dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-primary/50 hover:bg-primary/10 w-full"
                      onClick={() => {
                        navigate("/demo");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Try Demo
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                      onClick={() => {
                        navigate("/auth");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
