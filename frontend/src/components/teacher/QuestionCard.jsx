// components/docent/QuestionCard.jsx
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

export function QuestionCard({ question, index, onDelete }) {
  return (
    <div className="bg-gray-50 p-2 rounded text-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">
            {index + 1}. {question.question_text}
          </p>
          {question.type !== "text" && (
            <div className="mt-1 space-y-1">
              {question.answers?.map((answer) => (
                <div
                  key={answer.id}
                  className={`text-xs ${
                    answer.is_correct
                      ? "text-green-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  • {answer.answer_text}
                  {answer.is_correct && " ✓"}
                </div>
              ))}
            </div>
          )}
          {question.type === "text" && (
            <p className="text-xs text-gray-500 italic mt-1">Open answer</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
