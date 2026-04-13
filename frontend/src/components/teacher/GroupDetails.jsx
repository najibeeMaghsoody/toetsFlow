// components/docent/GroupDetails.jsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Users, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GroupDetails({ group, students, onToggleStudent }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStates, setLoadingStates] = useState({});

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
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Selecteer een groep aan de linkerkant om studenten toe te voegen
              of te verwijderen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const setLoading = (studentId, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [studentId]: isLoading }));
  };

  const handleToggleStudent = async (studentId, isCurrentlyInGroup) => {
    setLoading(studentId, true);
    try {
      await onToggleStudent(group.id, studentId, isCurrentlyInGroup);
    } catch (error) {
      console.error("Error toggling student:", error);
      toast.error("Er is iets misgegaan");
    } finally {
      setLoading(studentId, false);
    }
  };

  const handleBulkAdd = async () => {
    const studentsToAdd = filteredStudents.filter(
      (s) => !group.users?.some((u) => u.id === s.id),
    );

    if (studentsToAdd.length === 0) {
      toast.info("Alle studenten zitten al in deze groep");
      return;
    }

    for (const student of studentsToAdd) {
      setLoading(student.id, true);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const student of studentsToAdd) {
      try {
        await onToggleStudent(group.id, student.id, false);
        successCount++;
      } catch (error) {
        errorCount++;
      } finally {
        setLoading(student.id, false);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} student(en) toegevoegd aan ${group.name}`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} student(en) konden niet worden toegevoegd`);
    }
  };

  const handleBulkRemove = async () => {
    const studentsToRemove = filteredStudents.filter((s) =>
      group.users?.some((u) => u.id === s.id),
    );

    if (studentsToRemove.length === 0) {
      toast.info("Geen studenten om te verwijderen");
      return;
    }

    for (const student of studentsToRemove) {
      setLoading(student.id, true);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const student of studentsToRemove) {
      try {
        await onToggleStudent(group.id, student.id, true);
        successCount++;
      } catch (error) {
        errorCount++;
      } finally {
        setLoading(student.id, false);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} student(en) verwijderd uit ${group.name}`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} student(en) konden niet worden verwijderd`);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupStudentIds = group.users?.map((u) => u.id) || [];
  const addedCount = groupStudentIds.length;
  const totalCount = students.length;
  const percentage =
    totalCount > 0 ? Math.round((addedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              {group.name}
            </CardTitle>
            <CardDescription>
              {addedCount} van {totalCount} studenten in deze groep (
              {percentage}%)
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">
              {percentage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Voortgangsbalk */}
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Zoekbalk */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Zoek student op naam of e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Bulk acties */}
        {filteredStudents.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkAdd}
              className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Alle zichtbare toevoegen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRemove}
              className="flex-1 text-red-700 border-red-300 hover:bg-red-50"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Alle zichtbare verwijderen
            </Button>
          </div>
        )}

        {/* Studenten lijst */}
        <div className="space-y-2 max-h-125 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {searchTerm
                ? "Geen studenten gevonden voor deze zoekopdracht"
                : "Geen studenten beschikbaar"}
            </p>
          ) : (
            filteredStudents.map((student) => {
              const isInGroup = groupStudentIds.includes(student.id);
              const isLoading = loadingStates[student.id];

              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                    isInGroup
                      ? "bg-indigo-50 border-indigo-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Checkbox
                      checked={isInGroup}
                      onCheckedChange={() =>
                        handleToggleStudent(student.id, isInGroup)
                      }
                      disabled={isLoading}
                      className={isInGroup ? "border-indigo-400" : ""}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isInGroup ? "text-indigo-900" : "text-gray-900"
                        }`}
                      >
                        {student.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isInGroup ? "text-indigo-600" : "text-gray-500"
                        }`}
                      >
                        {student.email}
                      </p>
                    </div>
                  </label>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    ) : isInGroup ? (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        In groep
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                        Niet in groep
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totaal overzicht */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            {addedCount} studenten in groep • {totalCount - addedCount}{" "}
            studenten niet in groep
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Klik op de checkbox om student toe te voegen of te verwijderen
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
