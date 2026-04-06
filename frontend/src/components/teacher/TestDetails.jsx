// components/docent/TestDetails.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { SectionCard } from "./SectionCard";

export function TestDetails({
  test,
  onAddSection,
  onDeleteSection,
  onAddQuestion,
  onDeleteQuestion,
  isSectionDialogOpen,
  setIsSectionDialogOpen,
  isQuestionDialogOpen,
  setIsQuestionDialogOpen,
  editingSection,
  setEditingSection,
}) {
  if (!test) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
          <CardDescription>Select a test to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Select a test to edit
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{test.title}</CardTitle>
            <CardDescription>
              {test.description || "No description"}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsSectionDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {test.sections?.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No sections added yet
          </p>
        ) : (
          <div className="space-y-3">
            {test.sections?.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onDelete={() => onDeleteSection(section.id)}
                onAddQuestion={() => onAddQuestion(section.id)}
                onDeleteQuestion={onDeleteQuestion}
                isQuestionDialogOpen={isQuestionDialogOpen}
                setIsQuestionDialogOpen={setIsQuestionDialogOpen}
                editingSection={editingSection}
                setEditingSection={setEditingSection}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
