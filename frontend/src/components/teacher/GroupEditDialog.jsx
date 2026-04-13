
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
import { Loader2, Save, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export function GroupEditDialog({
  open,
  onOpenChange,
  group,
  onUpdate,
  onDelete,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
    }
  }, [group]);

  if (!group) return null;

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Groep naam is verplicht");
      return;
    }

    setIsLoading(true);
    const success = await onUpdate(group.id, {
      name: name.trim(),
      description,
    });
    setIsLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(`Weet je zeker dat je groep "${group.name}" wilt verwijderen?`)
    ) {
      setIsLoading(true);
      const success = await onDelete(group.id);
      setIsLoading(false);
      if (success) {
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Groep Bewerken
          </DialogTitle>
          <DialogDescription>
            Wijzig de naam of beschrijving van de groep
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Groep Naam</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Class 3A"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Beschrijving (optioneel)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Groep beschrijving..."
              rows={3}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Opslaan
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Verwijderen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
