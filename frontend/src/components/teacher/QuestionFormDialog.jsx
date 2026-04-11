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
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2 } from "lucide-react";

export function QuestionFormDialog({
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

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, { text: "", isCorrect: false }],
    });
  };

  const updateAnswer = (index, field, value) => {
    const newAnswers = [...formData.answers];
    if (field === "isCorrect" && formData.type === "single_choice" && value) {
      newAnswers.forEach((a, i) => {
        newAnswers[i].isCorrect = i === index;
      });
    } else {
      newAnswers[index][field] = value;
    }
    setFormData({ ...formData, answers: newAnswers });
  };

  const removeAnswer = (index) => {
    setFormData({
      ...formData,
      answers: formData.answers.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Vraag</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe vraag toe aan de sectie. Kies het type vraag en voeg
            de antwoorden toe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Rest van je code blijft hetzelfde */}
          <div className="space-y-2">
            <Label>Vraag Text</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="What is 2 + 2?"
            />
          </div>

          <div className="space-y-2">
            <Label>Vraag Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value,
                  answers: [{ text: "", isCorrect: false }],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">
                  Single Choice (enkele Antwoord)
                </SelectItem>
                <SelectItem value="multiple_choice">
                  Multiple Choice (Multiple Antwoord)
                </SelectItem>
                <SelectItem value="text">Open Vraag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== "text" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Antwoorden</Label>
                <Button size="sm" variant="outline" onClick={addAnswer}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Checkbox
                    checked={answer.isCorrect}
                    onCheckedChange={(checked) =>
                      updateAnswer(index, "isCorrect", checked)
                    }
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) =>
                      updateAnswer(index, "text", e.target.value)
                    }
                    placeholder="Answer option"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnswer(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full">
            Nieuwe Vraag Toevoegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
