import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "teacher") {
      navigate("/teacher/dashboard");
    } else if (user.role === "student") {
      navigate("/student/dashboard");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vul alle velden in");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success(`Welkom ${result.user.name}!`);

        if (result.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (result.user.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        toast.error(result.error || "Ongeldige email of wachtwoord");
      }
    } catch (error) {
      toast.error("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts voor testen
  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@school.com",
      password: "password",
    },
    {
      role: "Docent",
      email: "teacher@school.com",
      password: "password",
    },
    {
      role: "Student",
      email: "student1@school.com",
      password: "password",
    },
  ];

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <Card className="w-full glass-card border-2 hover-lift">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-4 rounded-2xl pulse-glow shadow-2xl">
            <GraduationCap className="size-10 text-white icon-glow" />
          </div>
        </div>
        <CardTitle className="text-3xl bg-gradient-to-r from-purple-700 via-violet-600 to-cyan-600 bg-clip-text text-transparent font-bold">
          Toets Flow
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Log in om verder te gaan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-900 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-900 font-medium">
              Wachtwoord
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary ripple-effect shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bezig met inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Nog geen account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-purple-700 hover:text-purple-900 font-semibold hover:underline transition-colors"
              disabled={isLoading}
            >
              Registreer als student
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Login;
