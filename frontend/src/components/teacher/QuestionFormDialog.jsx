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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Trash2, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export function QuestionFormDialog({
  open,
  onOpenChange,
  initialData = null,
  sectionId,
  sectionTitle = "",
  onSubmit,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    question_text: "",
    type: "multiple_choice",
    answers: [{ text: "", isCorrect: false }],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        // Zet bestaande antwoorden om
        const answers = (initialData.answers || []).map((a) => ({
          text: a.answer_text || "",
          isCorrect: a.is_correct === true || a.is_correct === 1,
          id: a.id,
        }));

        if (answers.length === 0) {
          answers.push({ text: "", isCorrect: false });
        }

        setFormData({
          question_text: initialData.question_text || "",
          type: initialData.type || "multiple_choice",
          answers: answers,
        });
      } else {
        setFormData({
          question_text: "",
          type: "multiple_choice",
          answers: [{ text: "", isCorrect: false }],
        });
      }
    }
  }, [initialData, isEditing, open]);

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, { text: "", isCorrect: false }],
    });
  };

  const updateAnswer = (index, field, value) => {
    const newAnswers = [...formData.answers];

    if (field === "isCorrect") {
      // Zorg dat value een boolean is
      const isChecked = value === true || value === "true";

      if (formData.type === "single_choice" && isChecked) {
        // Single choice: alleen deze true, alle anderen false
        newAnswers.forEach((_, i) => {
          newAnswers[i].isCorrect = i === index;
        });
      } else {
        // Multiple choice: toggle de waarde
        newAnswers[index].isCorrect = isChecked;
      }
    } else {
      newAnswers[index][field] = value;
    }

    setFormData({ ...formData, answers: newAnswers });
  };

  const removeAnswer = (index) => {
    if (formData.answers.length === 1) {
      toast.error("Een vraag moet minimaal één antwoord hebben");
      return;
    }
    const newAnswers = formData.answers.filter((_, i) => i !== index);
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async () => {
    if (!formData.question_text.trim()) {
      toast.error("Vraag tekst is verplicht");
      return;
    }

    if (!isEditing && !sectionId) {
      toast.error("Geen sectie geselecteerd");
      return;
    }

    if (formData.type !== "text") {
      const hasEmptyAnswer = formData.answers.some((a) => !a.text.trim());
      if (hasEmptyAnswer) {
        toast.error("Vul alle antwoorden in");
        return;
      }

      const hasCorrectAnswer = formData.answers.some(
        (a) => a.isCorrect === true,
      );
      if (!hasCorrectAnswer) {
        toast.error("Selecteer minimaal één correct antwoord");
        return;
      }
    }

    if (typeof onSubmit !== "function") {
      toast.error("Er is een configuratiefout");
      return;
    }

    setIsLoading(true);
    try {
      let success;

      if (isEditing && initialData) {
        const questionData = {
          question_text: formData.question_text,
          type: formData.type,
        };
        success = await onSubmit(initialData.id, questionData);
      } else {
        const questionData = {
          question_text: formData.question_text,
          type: formData.type,
          answers: formData.answers.map((a) => ({
            text: a.text,
            isCorrect: a.isCorrect === true,
          })),
        };
        success = await onSubmit(questionData);
      }

      if (success !== false) {
        onOpenChange(false);
        if (!isEditing) {
          setFormData({
            question_text: "",
            type: "multiple_choice",
            answers: [{ text: "", isCorrect: false }],
          });
        }
        toast.success(isEditing ? "Vraag bijgewerkt" : "Vraag toegevoegd");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Er is een fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            {isEditing ? "Vraag Bewerken" : "Nieuwe Vraag"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Wijzig de vraag${sectionTitle ? ` in sectie: ${sectionTitle}` : ""}`
              : `Voeg een nieuwe vraag toe${sectionTitle ? ` aan sectie: ${sectionTitle}` : ""}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vraag tekst</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="Wat is 2 + 2?"
              rows={3}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Vraag type</Label>
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
              <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">
                  Enkele keuze (radio button)
                </SelectItem>
                <SelectItem value="multiple_choice">
                  Meerkeuze (checkbox)
                </SelectItem>
                <SelectItem value="text">Open vraag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== "text" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Antwoorden</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addAnswer}
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Antwoord toevoegen
                </Button>
              </div>

              <div className="space-y-2">
                {formData.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center p-3 rounded-lg border border-gray-200"
                  >
                    {/* Correct antwoord indicator */}
                    <div className="shrink-0">
                      {formData.type === "single_choice" ? (
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={answer.isCorrect === true}
                          onChange={() =>
                            updateAnswer(index, "isCorrect", true)
                          }
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={answer.isCorrect === true}
                          onChange={(e) =>
                            updateAnswer(index, "isCorrect", e.target.checked)
                          }
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
                        />
                      )}
                    </div>

                    {/* Antwoord tekst */}
                    <Input
                      value={answer.text}
                      onChange={(e) =>
                        updateAnswer(index, "text", e.target.value)
                      }
                      placeholder={`Antwoord optie ${index + 1}`}
                      className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />

                    {/* Verwijder button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnswer(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md">
                {formData.type === "single_choice"
                  ? " Selecteer het juiste antwoord met de radio button (slechts één correct antwoord mogelijk)"
                  : " Selecteer alle juiste antwoorden met de checkboxes (meerdere correcte antwoorden mogelijk)"}
              </p>
            </div>
          )}

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
