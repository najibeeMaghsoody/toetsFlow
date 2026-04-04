// frontend/src/pages/Register.jsx
import { useState, useEffect } from "react";
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
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    type: null,
    title: null,
    message: null,
    details: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { register } = useAuth();

  // Clear alert na 5 seconden
  useEffect(() => {
    if (alertMessage.message) {
      const timer = setTimeout(() => {
        setAlertMessage({
          type: null,
          title: null,
          message: null,
          details: null,
        });
        setFieldErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Clear field errors when user starts typing
  const handleFieldChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "passwordConfirmation") setPasswordConfirmation(value);

    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Clear alert when user starts typing
    if (alertMessage.message) {
      setAlertMessage({
        type: null,
        title: null,
        message: null,
        details: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setAlertMessage({ type: null, title: null, message: null, details: null });
    setFieldErrors({});

    // Client-side validatie
    if (!email || !password || !name) {
      setAlertMessage({
        type: "warning",
        title: "Velden ontbreken",
        message: "Vul alle verplichte velden in.",
      });
      toast.error("Vul alle velden in");
      return;
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({ password: "Wachtwoorden komen niet overeen" });
      setAlertMessage({
        type: "destructive",
        title: "Wachtwoord komt niet overeen",
        message:
          "Het ingevoerde wachtwoord en de bevestiging komen niet overeen.",
      });
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }

    if (password.length < 8) {
      setFieldErrors({
        password: "Wachtwoord moet minimaal 8 tekens bevatten",
      });
      setAlertMessage({
        type: "destructive",
        title: "Wachtwoord te kort",
        message:
          "Je wachtwoord moet minimaal 8 tekens bevatten voor de veiligheid.",
      });
      toast.error("Wachtwoord moet minimaal 8 tekens bevatten");
      return;
    }

    if (!email.endsWith("@school.nl")) {
      setFieldErrors({ email: "Gebruik je schoolmail (@school.nl)" });
      setAlertMessage({
        type: "destructive",
        title: "Ongeldig e-mailadres",
        message: "Gebruik je schoolmailadres dat eindigt op @school.nl",
      });
      toast.error("Gebruik je schoolmail (@school.nl)");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      if (result.success) {
        setAlertMessage({
          type: "success",
          title: "Registratie succesvol! 🎉",
          message: "Je account is aangemaakt!",
          details: "Je wordt doorgestuurd naar de inlogpagina...",
        });
        toast.success("Account aangemaakt! Je kunt nu inloggen.");

        // Redirect na 2 seconden zodat gebruiker de melding kan zien
        setTimeout(() => {
          navigate("/login?registered=true");
        }, 2000);
      } else {
        // Verwerk verschillende soorten fouten
        let errorTitle = "Registratie mislukt";
        let errorMessage =
          "Er is een probleem opgetreden bij het aanmaken van je account.";
        let errorDetails = null;
        let fieldErrorMap = {};

        if (result.errors) {
          // Validatiefouten van de backend
          errorTitle = "Validatiefout";
          errorMessage = "Er zijn problemen met de ingevoerde gegevens:";

          const errorKeys = Object.keys(result.errors);
          const errorList = [];

          errorKeys.forEach((key) => {
            const messages = result.errors[key];
            const fieldError = messages[0];
            fieldErrorMap[key] = fieldError;
            errorList.push(`• ${fieldError}`);
            if (!errorDetails) {
              errorDetails = fieldError;
            }
          });

          errorDetails = errorList.join("\n");
          setFieldErrors(fieldErrorMap);
        } else if (result.message) {
          errorMessage = result.message;

          // Specifieke foutmeldingen
          if (
            result.message.includes("already been taken") ||
            result.message.includes("bestaat al")
          ) {
            errorTitle = "E-mailadres al in gebruik";
            errorMessage =
              "Dit e-mailadres is al geregistreerd. Log in met je bestaande account of gebruik een ander e-mailadres.";
            setFieldErrors({ email: "Dit e-mailadres is al geregistreerd" });
          }
        }

        setAlertMessage({
          type: "destructive",
          title: errorTitle,
          message: errorMessage,
          details: errorDetails,
        });

        // Toon ook via toast
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Register error:", error);
      setAlertMessage({
        type: "destructive",
        title: "Netwerkfout",
        message: "Er is een verbindingsprobleem opgetreden.",
        details: "Controleer je internetverbinding en probeer het opnieuw.",
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
    <Card className="w-full max-w-md mx-auto shadow-xl border-2">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-linear-to-br from-purple-600 to-violet-700 p-4 rounded-2xl shadow-2xl">
            <GraduationCap className="size-10 text-white" />
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
        {/* Alert Meldingen */}
        {alertMessage.type && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Alert variant={alertMessage.type}>
              {getAlertIcon(alertMessage.type)}
              <AlertTitle>{alertMessage.title}</AlertTitle>
              <AlertDescription>
                {alertMessage.message}
                {alertMessage.details && (
                  <div className="mt-2 text-sm opacity-90 whitespace-pre-line">
                    {alertMessage.details}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-900 font-medium">
              Volledige naam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jan Jansen"
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                fieldErrors.name ? "border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600 mt-1 animate-in slide-in-from-left-2">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-900 font-medium">
              Schoolmail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@school.nl"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className={`focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600 mt-1 animate-in slide-in-from-left-2">
                {fieldErrors.email}
              </p>
            )}
            <p className="text-xs text-gray-500">Moet eindigen op @school.nl</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-900 font-medium">
              Wachtwoord <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimaal 8 tekens"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              className={`focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-600 mt-1 animate-in slide-in-from-left-2">
                {fieldErrors.password}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Minimaal 8 tekens voor een veilig wachtwoord
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password_confirmation"
              className="text-purple-900 font-medium"
            >
              Bevestig wachtwoord <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="Bevestig je wachtwoord"
              value={passwordConfirmation}
              onChange={(e) =>
                handleFieldChange("passwordConfirmation", e.target.value)
              }
              className={`focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Bezig met registreren...
              </div>
            ) : (
              "Registreren"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="w-full hover:bg-purple-50 transition-colors"
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
