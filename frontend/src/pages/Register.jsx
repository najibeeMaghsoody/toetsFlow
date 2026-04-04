// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
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
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔵 [Register] Form submitted");
    console.log("🔵 [Register] Form data:", {
      name,
      email,
      password,
      passwordConfirmation,
    });

    setIsLoading(true);

    // Validation
    if (!email || !password || !name) {
      console.log("🔴 [Register] Validation failed: missing fields");
      toast.error("Vul alle velden in");
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      console.log("🔴 [Register] Validation failed: passwords don't match");
      toast.error("Wachtwoorden komen niet overeen");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      console.log("🔴 [Register] Validation failed: password too short");
      toast.error("Wachtwoord moet minimaal 8 tekens bevatten");
      setIsLoading(false);
      return;
    }

    if (!email.endsWith("@school.nl")) {
      console.log("🔴 [Register] Validation failed: invalid email domain");
      toast.error("Gebruik je schoolmail (@school.nl)");
      setIsLoading(false);
      return;
    }

    console.log("✅ [Register] Validation passed, calling register API...");

    try {
      const result = await register({
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      console.log("✅ [Register] API response:", result);

      if (result.success) {
        console.log(
          "✅ [Register] Registration successful, redirecting to /student",
        );
        toast.success("Account aangemaakt! Je wordt ingelogd...");
        navigate("/student");
      } else {
        console.log("🔴 [Register] Registration failed:", result);
        if (result.errors?.email) {
          toast.error(result.errors.email[0]);
        } else if (result.message) {
          toast.error(result.message);
        } else {
          toast.error("Er is iets misgegaan bij het registreren");
        }
      }
    } catch (error) {
      console.error("🔴 [Register] Exception caught:", error);
      toast.error("Er is een netwerkfout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full glass-card border-2 hover-lift">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-linear-to-br from-purple-600 to-violet-700 p-4 rounded-2xl pulse-glow shadow-2xl">
            <GraduationCap className="size-10 text-white icon-glow" />
          </div>
        </div>
        <CardTitle className="text-3xl bg-linear-to-r from-purple-700 via-violet-600 to-cyan-600 bg-clip-text text-transparent font-bold">
          Student Registratie
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Maak een account aan met je schoolmail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-900">
              Volledige naam
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jan Jansen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-900">
              Schoolmail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@school.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-900">
              Wachtwoord
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimaal 8 tekens"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-purple-900">
              Bevestig wachtwoord
            </Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="Bevestig je wachtwoord"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary ripple-effect shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Bezig met registreren..." : "Registreren"}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full hover:bg-purple-50"
            disabled={isLoading}
          >
            <ArrowLeft className="size-4 mr-2" />
            Terug naar inloggen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Register;
