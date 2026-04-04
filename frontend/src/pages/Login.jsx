// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
import {
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    type: null,
    title: null,
    message: null,
    icon: null,
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered");
  const justLoggedOut = searchParams.get("loggedout");

  // Toon melding als net geregistreerd
  useEffect(() => {
    if (justRegistered) {
      setAlertMessage({
        type: "success",
        title: "Registratie succesvol!",
        message: "Je account is aangemaakt. Log nu in met je gegevens.",
      });
      toast.success("Account succesvol aangemaakt!");
    }
  }, [justRegistered]);

  // Toon melding als net uitgelogd
  useEffect(() => {
    if (justLoggedOut) {
      setAlertMessage({
        type: "info",
        title: "Uitgelogd",
        message: "Je bent succesvol uitgelogd. Log hieronder opnieuw in.",
      });
      toast.info("Je bent uitgelogd");
    }
  }, [justLoggedOut]);

  // Clear alert na 5 seconden
  useEffect(() => {
    if (alertMessage.message) {
      const timer = setTimeout(() => {
        setAlertMessage({ type: null, title: null, message: null, icon: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validatie
    if (!email || !password) {
      setAlertMessage({
        type: "warning",
        title: "Velden ontbreken",
        message: "Vul zowel je e-mailadres als wachtwoord in.",
      });
      toast.error("Vul alle velden in");
      return;
    }

    if (!email.includes("@")) {
      setAlertMessage({
        type: "warning",
        title: "Ongeldig e-mailadres",
        message: "Voer een geldig e-mailadres in.",
      });
      toast.error("Ongeldig e-mailadres");
      return;
    }

    setIsLoading(true);
    setAlertMessage({ type: null, title: null, message: null, icon: null });

    try {
      const result = await login(email, password);

      if (result.success) {
        setAlertMessage({
          type: "success",
          title: "Welkom terug!",
          message: `Je bent succesvol ingelogd als ${result.user?.role}. Je wordt doorgestuurd...`,
        });
        toast.success("Succesvol ingelogd!");

        setTimeout(() => {
          if (result.user?.role === "docent") {
            navigate("/docent/dashboard");
          } else if (result.user?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/student/dashboard");
          }
        }, 1500);
      } else {
        let errorTitle = "Inloggen mislukt";
        let errorMessage = "Controleer je e-mailadres en wachtwoord.";

        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.errors) {
          const errors = Object.values(result.errors).flat();
          errorMessage = errors.join(", ");
        }

        // Specifieke foutmeldingen voor betere UX
        if (errorMessage.toLowerCase().includes("email")) {
          errorTitle = "E-mailadres niet gevonden";
          errorMessage =
            "Dit e-mailadres is niet bij ons bekend. Controleer of je het juiste adres gebruikt.";
        } else if (errorMessage.toLowerCase().includes("wachtwoord")) {
          errorTitle = "Onjuist wachtwoord";
          errorMessage =
            "Het ingevoerde wachtwoord is niet correct. Probeer het opnieuw.";
        }

        setAlertMessage({
          type: "destructive",
          title: errorTitle,
          message: errorMessage,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage({
        type: "destructive",
        title: "Netwerkfout",
        message:
          "Er is een verbindingsprobleem. Controleer je internetverbinding en probeer opnieuw.",
      });
      toast.error("Netwerkfout - probeer opnieuw");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper om icoon te tonen bij alert
  const getAlertIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="size-4" />;
      case "destructive":
        return <XCircle className="size-4" />;
      case "warning":
        return <AlertCircle className="size-4" />;
      case "info":
        return <Info className="size-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-linear-to-br from-purple-600 to-violet-700 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="size-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Welkom terug!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Log in met je e-mailadres en wachtwoord
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alert Meldingen */}
          {alertMessage.type && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <Alert variant={alertMessage.type}>
                {getAlertIcon(alertMessage.type)}
                <AlertTitle>{alertMessage.title}</AlertTitle>
                <AlertDescription>{alertMessage.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                E-mailadres
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="naam@school.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Bezig met inloggen...
                </div>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Nog geen account? </span>
            <Link
              to="/register"
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
            >
              Registreren
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
