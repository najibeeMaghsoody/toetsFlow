
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2, Pencil, FileText } from "lucide-react";

export function TestList({
  tests,
  selectedTest,
  onSelectTest,
  onDeleteTest,
  onEditTest,
  onOpenDialog,
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Mijn Toetsen
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Overzicht van al je toetsen
            </CardDescription>
          </div>
          <Button
            onClick={onOpenDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Toets
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {tests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Je hebt nog geen toetsen</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDialog}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Eerste Toets Aanmaken
              </Button>
            </div>
          ) : (
            tests.map((test) => {
              const questionCount =
                test.sections?.reduce(
                  (acc, s) => acc + (s.questions?.length || 0),
                  0,
                ) || 0;

              return (
                <div
                  key={test.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTest?.id === test.id
                      ? "bg-indigo-50 border-indigo-300 shadow-md"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => onSelectTest(test)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {test.title}
                      </h4>
                      {test.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {test.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {test.sections?.length || 0} secties
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {questionCount} vragen
                        </span>
                        {test.is_public && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Openbaar
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTest(test);
                        }}
                        className="text-gray-500 hover:text-indigo-600"
                        title="Bewerken"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Weet je zeker dat je toets "${test.title}" wilt verwijderen?`,
                            )
                          ) {
                            onDeleteTest(test.id);
                          }
                        }}
                        className="text-gray-500 hover:text-red-600"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
