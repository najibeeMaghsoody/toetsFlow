// components/docent/GroupDetails.jsx (aangepast)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";

export function GroupDetails({ group, students, onToggleStudent }) {
  if (!group) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Studenten in Groep</CardTitle>
          <CardDescription>
            Selecteer een groep om studenten te beheren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Selecteer een groep aan de linkerkant om studenten toe te voegen of
            te verwijderen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggleStudent = async (studentId, isCurrentlyInGroup) => {
    const confirmed = window.confirm(
      isCurrentlyInGroup
        ? `Weet je zeker dat je deze student uit de groep wilt verwijderen?`
        : `Weet je zeker dat je deze student aan de groep wilt toevoegen?`,
    );

    if (confirmed) {
      await onToggleStudent(group.id, studentId, isCurrentlyInGroup);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Studenten in Groep</CardTitle>
        <CardDescription>{group.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Geen studenten gevonden
            </p>
          ) : (
            students.map((student) => {
              const isInGroup = group.users?.some((u) => u.id === student.id);
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isInGroup}
                      onCheckedChange={() =>
                        handleToggleStudent(student.id, isInGroup)
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
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
