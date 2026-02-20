import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo + brand above card */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-lg border border-border/50 ring-1 ring-primary/10">
            <img
              src="/logo.png"
              alt="Darsanian Rohis"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">Darsanian Rohis</h1>
          <p className="text-sm text-muted-foreground mt-1">Global Darussalam Academy · Management System</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-lg font-display text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()} Darsanian Rohis. All rights reserved.
        </p>
      </div>
    </div>
  );
}