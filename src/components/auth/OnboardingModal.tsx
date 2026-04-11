import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Loader2, Plane, Sparkles, CheckCircle2, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const INTEREST_CATEGORIES = [
  { id: "nature", label: "Nature & Outdoors", icon: "🌲" },
  { id: "food", label: "Food & Culinary", icon: "🍕" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "nightlife", label: "Nightlife", icon: "🥂" },
  { id: "culture", label: "Culture & History", icon: "🕌" },
  { id: "luxury", label: "Luxury Travel", icon: "💎" },
  { id: "budget", label: "Budget/Backpacking", icon: "🎒" },
  { id: "relaxation", label: "Relaxation & Wellness", icon: "🧘" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "sports", label: "Sports & Fitness", icon: "🛶" },
  { id: "solo", label: "Solo Friendly", icon: "🧍" },
];

export const OnboardingModal = () => {
  const { user, needsOnboarding, refreshOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    display_name: user?.user_metadata?.full_name || "",
    phone: "",
    interests: [] as string[],
  });

  const toggleInterest = (id: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.display_name.trim() || !form.phone.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in your name and phone number.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (form.interests.length === 0) {
      toast({
        title: "Preferences Required",
        description: "Please select at least one interest to personalize your experience.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: form.display_name.trim(),
          phone: form.phone.trim(),
          interests: form.interests,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      await refreshOnboarding();
      toast({
        title: "Welcome to Explorer Mind!",
        description: "Your personalized travel profile is ready.",
      });
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      toast({
        title: "Setup Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={needsOnboarding}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary z-50" />
        
        <div className="relative p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <Plane className="h-8 w-8 text-primary" />
                  </div>
                  <DialogTitle className="font-display text-3xl font-bold">Welcome Explorer!</DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                    Let's start by confirming your identity.
                  </DialogDescription>
                </div>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rahul Sharma"
                      value={form.display_name}
                      onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                      className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="h-12 bg-muted/50 border-none rounded-xl opacity-70 cursor-not-allowed italic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary shadow-inner"
                    />
                  </div>
                </div>

                <Button onClick={handleNext} className="btn-hero w-full h-14 text-lg font-bold group shadow-glow">
                  Continue to Personalization <Sparkles className="ml-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 mb-4 text-secondary">
                    <Heart className="h-8 w-8" />
                  </div>
                  <DialogTitle className="font-display text-3xl font-bold">What's Your Travel DNA?</DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                    Select your interests to help us recommend the best trips for you.
                  </DialogDescription>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {INTEREST_CATEGORIES.map((category) => {
                    const isSelected = form.interests.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleInterest(category.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative group",
                          isSelected 
                            ? "bg-secondary/10 border-secondary text-secondary shadow-soft" 
                            : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/20"
                        )}
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
                        <span className="text-xs font-bold text-center leading-tight">{category.label}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-4 w-4 fill-secondary text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="h-14 font-bold text-muted-foreground">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="btn-hero flex-1 h-14 text-lg font-bold shadow-glow"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
