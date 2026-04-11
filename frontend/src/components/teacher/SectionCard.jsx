// components/docent/SectionCard.jsx (aangepast)
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { QuestionCard } from "./QuestionCard";

export function SectionCard({
  section,
  onDelete,
  onAddQuestion,
  onDeleteQuestion,
}) {
  const handleDelete = () => {
    if (window.confirm("Weet je zeker dat je deze sectie wilt verwijderen?")) {
      onDelete(section.id);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) {
      onDeleteQuestion(questionId);
    }
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium">{section.title}</h5>
          {section.description && (
            <p className="text-sm text-gray-500">{section.description}</p>
          )}
          {section.new_page && (
            <span className="text-xs text-gray-500">Nieuwe pagina</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddQuestion(section)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {section.questions?.length === 0 ? (
        <p className="text-sm text-gray-500">Geen vragen</p>
      ) : (
        <div className="space-y-2 mt-2">
          {section.questions?.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
