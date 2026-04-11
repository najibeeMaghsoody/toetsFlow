
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

export function SectionFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
}) {
  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe Sectie</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe sectie toe aan de toets. Secties kunnen bestaan uit
            meerdere vragen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Part 1: Geometry"
            />
          </div>
          <div className="space-y-2">
            <Label>Beschrijving (optioneel)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Section description..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.new_page}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, new_page: checked })
              }
            />
            <Label>Nieuwe pagina</Label>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Nieuwe Sectie Toevoegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
