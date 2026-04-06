// components/docent/GroupDetails.jsx
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
          <CardTitle>Students in Group</CardTitle>
          <CardDescription>Select a group</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Select a group to manage students
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students in Group</CardTitle>
        <CardDescription>{group.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.map((student) => {
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
                      onToggleStudent(group.id, student.id, isInGroup)
                    }
                  />
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {students.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No students found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
