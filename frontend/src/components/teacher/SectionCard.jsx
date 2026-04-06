// components/docent/SectionCard.jsx
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { QuestionCard } from "./QuestionCard";

export function SectionCard({
  section,
  onDelete,
  onAddQuestion,
  onDeleteQuestion,
  isQuestionDialogOpen,
  setIsQuestionDialogOpen,
  editingSection,
  setEditingSection,
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium">{section.title}</h5>
          {section.description && (
            <p className="text-sm text-gray-500">{section.description}</p>
          )}
          {section.new_page && (
            <span className="text-xs text-gray-500">New page</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingSection(section);
              setIsQuestionDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {section.questions?.length === 0 ? (
        <p className="text-sm text-gray-500">No questions</p>
      ) : (
        <div className="space-y-2 mt-2">
          {section.questions?.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onDelete={() => onDeleteQuestion(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
