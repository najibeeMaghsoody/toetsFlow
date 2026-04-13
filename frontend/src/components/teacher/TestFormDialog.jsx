
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
import { Switch } from "../ui/switch";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export function TestFormDialog({
  open,
  onOpenChange,
  formData: externalFormData,
  setFormData: externalSetFormData,
  initialData = null,
  onSubmit,
  isEditing = false,
}) {
  // Gebruik externe formData of lokale state
  const [localFormData, setLocalFormData] = useState({
    title: "",
    description: "",
    is_public: false,
    max_attempts: 1,
  });
  const [isLoading, setIsLoading] = useState(false);


  const formData = externalFormData || localFormData;
  const setFormData = externalSetFormData || setLocalFormData;

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        console.log("Setting edit data:", initialData);
        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          is_public: initialData.is_public || false,
          max_attempts: initialData.max_attempts || 1,
        });
      } else if (!externalFormData) {
        setLocalFormData({
          title: "",
          description: "",
          is_public: false,
          max_attempts: 1,
        });
      }
    }
  }, [initialData, isEditing, open, externalFormData]);

  const handleSubmit = async () => {

    if (typeof onSubmit !== "function") {
      console.error("onSubmit is not a function!", onSubmit);
      toast.error(
        "Er is een configuratiefout. Neem contact op met de beheerder.",
      );
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Titel is verplicht");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result !== false) {
        onOpenChange(false);
        if (!externalFormData) {
          setLocalFormData({
            title: "",
            description: "",
            is_public: false,
            max_attempts: 1,
          });
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(
        "Er is een fout opgetreden: " + (error.message || "Onbekende fout"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {isEditing ? "Toets Bewerken" : "Nieuwe Toets"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van deze toets"
              : "Maak een nieuwe toets aan. Voeg later secties en vragen toe."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Titel</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Bijv. Wiskunde Hoofdstuk 3"
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
              placeholder="Toets beschrijving..."
              rows={3}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_public: checked })
                }
              />
              <Label className="text-sm font-medium">
                Openbaar beschikbaar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Max. pogingen:</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.max_attempts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_attempts: parseInt(e.target.value) || 1,
                  })
                }
                className="w-20 text-center"
              />
            </div>
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
