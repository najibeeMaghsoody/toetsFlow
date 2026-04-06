// components/docent/TestFormDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

export function TestFormDialog({
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
          <DialogTitle>New Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Mathematics Chapter 3"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Test description..."
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
              <Label>Publicly available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Max attempts:</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.max_attempts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_attempts: parseInt(e.target.value),
                  })
                }
                className="w-20"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Create Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
