import { useState } from "react";
import { useNavigate } from "react-router";
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
import { GraduationCap, ArrowLeft } from "lucide-react";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [naam, setNaam] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !naam) {
      toast.error("Vul alle velden in");
      return;
    }

    if (!email.endsWith("@school.nl")) {
      toast.error("Gebruik je schoolmail (@school.nl)");
      return;
    }

    if (register(email, password, naam)) {
      toast.success("Account aangemaakt! Je wordt ingelogd...");
      navigate("/student");
    } else {
      toast.error("Dit email adres bestaat al");
    }
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
          Student Registratie
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Maak een account aan met je schoolmail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="naam" className="text-purple-900">
              Volledige naam
            </Label>
            <Input
              id="naam"
              type="text"
              placeholder="Jan Jansen"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-900">
              Wachtwoord
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-gradient border-purple-200 bg-white/80"
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary ripple-effect shadow-lg hover:shadow-xl transition-all"
          >
            Registreren
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full hover:bg-purple-50"
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
