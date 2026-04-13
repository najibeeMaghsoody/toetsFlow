// components/teacher/SectionFormDialog.jsx
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
import { Loader2, Layers } from "lucide-react";
import { toast } from "sonner";

export function SectionFormDialog({
  open,
  onOpenChange,
  initialData = null,
  testId,
  onSubmit,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    new_page: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        console.log("📝 SectionFormDialog - Setting edit data:", initialData);
        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          new_page: initialData.new_page || false,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          new_page: false,
        });
      }
    }
  }, [initialData, isEditing, open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Titel is verplicht");
      return;
    }

    console.log("📝 SectionFormDialog - handleSubmit called");
    console.log("📝 isEditing:", isEditing);
    console.log("📝 initialData:", initialData);
    console.log("📝 testId:", testId);
    console.log("📝 formData:", formData);
    console.log("📝 onSubmit type:", typeof onSubmit);

    if (typeof onSubmit !== "function") {
      console.error("❌ onSubmit is not a function!");
      toast.error("Er is een configuratiefout");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description || "",
        new_page: formData.new_page,
      };

      let success;

      if (isEditing) {
        // Voor editing: eerste parameter is het ID, tweede is de data
        if (!initialData || !initialData.id) {
          console.error("❌ No section ID available for edit");
          toast.error("Kan sectie niet bewerken: ID ontbreekt");
          setIsLoading(false);
          return;
        }

        console.log("📝 Calling onSubmit with ID:", initialData.id);
        success = await onSubmit(initialData.id, submitData);
      } else {
        // Voor create: alleen de data doorgeven
        if (!testId) {
          console.error("❌ No test ID available for create");
          toast.error("Kan sectie niet toevoegen: toets ID ontbreekt");
          setIsLoading(false);
          return;
        }

        console.log("📝 Calling onSubmit with data only");
        success = await onSubmit(submitData);
      }

      console.log("📝 SectionFormDialog - onSubmit returned:", success);

      if (success !== false) {
        onOpenChange(false);
        if (!isEditing) {
          setFormData({
            title: "",
            description: "",
            new_page: false,
          });
        }
      }
    } catch (error) {
      console.error("❌ SectionFormDialog - Error:", error);
      toast.error(error.response?.data?.message || "Er is een fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            {isEditing ? "Sectie Bewerken" : "Nieuwe Sectie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van deze sectie"
              : "Voeg een nieuwe sectie toe aan de toets."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Titel *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Bijv. Deel 1: Algebra"
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
              placeholder="Sectie beschrijving..."
              rows={3}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.new_page}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, new_page: checked })
              }
            />
            <Label className="text-sm font-medium">Nieuwe pagina</Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isEditing ? "Bijwerken" : "Toevoegen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
