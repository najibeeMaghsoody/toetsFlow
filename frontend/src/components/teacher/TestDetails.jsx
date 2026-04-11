// components/docent/TestDetails.jsx (aangepast)
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
}) {
  if (!test) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Toets Details</CardTitle>
          <CardDescription>Select een toets om te bewerken</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Selecteer een toets om te bewerken.
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
              {test.description || "Geen beschrijving"}
            </CardDescription>
          </div>
          <Button size="sm" onClick={onAddSection}>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Sectie
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!test.sections || test.sections.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Geen secties. Voeg een sectie toe om te beginnen.
          </p>
        ) : (
          <div className="space-y-3">
            {test.sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onDelete={onDeleteSection}
                onAddQuestion={onAddQuestion}
                onDeleteQuestion={onDeleteQuestion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
