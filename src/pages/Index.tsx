import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import hospitalBg from "@/assets/hospital-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = isRegister ? "Register | ECHS" : "Login | ECHS";

    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      navigate("/form", { replace: true });
    }
  }, [navigate, isRegister]);

  const handleLogin = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { username: savedUsername, password: savedPassword } =
        JSON.parse(storedUser);
      if (username === savedUsername && password === savedPassword) {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/form");
        return;
      }
    }
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/form");
      return;
    }
    setError("Invalid credentials. Please try again.");
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    localStorage.setItem("user", JSON.stringify({ username, password }));
    setIsRegister(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (isRegister) {
        handleRegister();
      } else {
        handleLogin();
      }
    }, 600);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${hospitalBg})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 to-background"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-md p-4">
        <h1 className="sr-only">
          {isRegister ? "Hospital Register" : "Hospital Login"}
        </h1>
        <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-xl border border-border animate-enter">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              {isRegister ? "Create Account" : "Hospital Access"}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {isRegister
                ? "Fill the details to register"
                : "Sign in to continue"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isRegister ? "Registering..." : "Signing in..."}
                  </span>
                ) : isRegister ? (
                  "Register"
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsRegister(!isRegister);
                  }}
                  className="text-primary underline"
                >
                  {isRegister ? "Login" : "Register"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Index;
