// components/docent/TestList.jsx
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2 } from "lucide-react";

export function TestList({
  tests,
  selectedTest,
  onSelectTest,
  onDeleteTest,
  onOpenDialog,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mijn Toetsen</CardTitle>
            <CardDescription>Overzicht van al je toetsen</CardDescription>
          </div>
          <Button size="sm" onClick={onOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nieuw Toets
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Je hebt nog geen toetsen. Klik op "Nieuw Toets" om te beginnen.
            </p>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTest?.id === test.id
                    ? "bg-indigo-50 border-indigo-300"
                    : ""
                }`}
                onClick={() => onSelectTest(test)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{test.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {test.description || "No description"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {test.sections?.length || 0} secties
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {test.sections?.reduce(
                          (acc, s) => acc + (s.questions?.length || 0),
                          0,
                        )}{" "}
                        vragen
                      </span>
                      {test.is_public && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTest(test.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
