import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";

export function TestDetails({
  test,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  if (!test) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Toets Details</CardTitle>
          <CardDescription>Selecteer een toets om te bewerken</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Selecteer een toets aan de linkerkant
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {test.title}
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {test.description || "Geen beschrijving"}
            </CardDescription>
          </div>
          <Button
            onClick={onAddSection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Sectie
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!test.sections || test.sections.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Geen secties. Voeg een sectie toe om te beginnen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {test.sections.map((section) => (
              <div
                key={section.id}
                className="border rounded-xl overflow-hidden"
              >
                <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {section.description}
                      </p>
                    )}
                    {section.new_page && (
                      <span className="text-xs text-gray-400 mt-1 inline-block">
                        Nieuwe pagina
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSection(section)}
                      className="text-gray-500 hover:text-indigo-600"
                      title="Sectie bewerken"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSection(section.id)}
                      className="text-gray-500 hover:text-red-600"
                      title="Sectie verwijderen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddQuestion(section)}
                      className="text-gray-500 hover:text-green-600"
                      title="Vraag toevoegen"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {section.questions?.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Geen vragen. Klik op + om een vraag toe te voegen.
                    </p>
                  ) : (
                    section.questions.map((question, idx) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {idx + 1}. {question.question_text}
                            </p>
                            {question.type !== "text" && question.answers && (
                              <div className="mt-2 space-y-1">
                                {question.answers.map((answer) => (
                                  <div
                                    key={answer.id}
                                    className="text-xs flex items-center gap-2"
                                  >
                                    <input
                                      type={
                                        question.type === "single_choice"
                                          ? "radio"
                                          : "checkbox"
                                      }
                                      checked={answer.is_correct === true}
                                      readOnly
                                      disabled
                                      className="w-3 h-3 text-indigo-600"
                                    />
                                    <span
                                      className={
                                        answer.is_correct
                                          ? "text-green-600 font-medium"
                                          : "text-gray-500"
                                      }
                                    >
                                      {answer.answer_text}
                                    </span>
                                    {answer.is_correct && (
                                      <span className="text-green-500 text-xs">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.type === "text" && (
                              <p className="text-xs text-gray-400 italic mt-1">
                                Open vraag - student geeft tekst antwoord
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditQuestion(question, section)}
                              className="text-gray-400 hover:text-indigo-600"
                              title="Vraag bewerken"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteQuestion(question.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Vraag verwijderen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
