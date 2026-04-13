
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export function GroupFormDialog({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
        });
      }
    }
  }, [initialData, isEditing, open]);

  const handleSubmit = async () => {
    if (typeof onSubmit !== "function") {
      console.error("onSubmit is not a function", onSubmit);
      toast.error(
        "Er is een configuratiefout. Neem contact op met de beheerder.",
      );
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Groep naam is verplicht");
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success !== false) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Er is een fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            {isEditing ? "Groep Bewerken" : "Nieuwe Groep"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de naam of beschrijving van de groep"
              : "Maak een nieuwe groep aan. Voeg later studenten toe."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Groep Naam</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Bijv. Klas 3A"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Beschrijving (optioneel)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Groep beschrijving..."
              rows={3}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isEditing ? "Bijwerken" : "Aanmaken"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
