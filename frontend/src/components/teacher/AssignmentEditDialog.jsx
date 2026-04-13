// components/docent/AssignmentEditDialog.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export function AssignmentEditDialog({
  open,
  onOpenChange,
  assignment,
  tests = [],
  groups = [],
  students = [],
  onUpdate,
  onDelete,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [testId, setTestId] = useState("");
  const [assignmentType, setAssignmentType] = useState("group");
  const [groupId, setGroupId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assignment) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };
      setStartDate(formatDate(assignment.start_date));
      setEndDate(formatDate(assignment.end_date));

      // Set test ID
      setTestId(
        assignment.test_id?.toString() || assignment.test?.id?.toString() || "",
      );

      // Bepaal het type op basis van de beschikbare data
      if (assignment.group_id || assignment.group) {
        setAssignmentType("group");
        setGroupId(
          assignment.group_id?.toString() ||
            assignment.group?.id?.toString() ||
            "",
        );
        setStudentId("");
      } else if (assignment.user_id || assignment.user) {
        setAssignmentType("student");
        setStudentId(
          assignment.user_id?.toString() ||
            assignment.user?.id?.toString() ||
            "",
        );
        setGroupId("");
      }
    }
  }, [assignment]);

  if (!assignment) return null;

  const handleUpdate = async () => {
    if (!startDate || !endDate) {
      toast.error("Start datum en eind datum zijn verplicht");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error("Eind datum moet na start datum zijn");
      return;
    }

    if (!testId) {
      toast.error("Selecteer een toets");
      return;
    }

    if (assignmentType === "group" && !groupId) {
      toast.error("Selecteer een groep");
      return;
    }

    if (assignmentType === "student" && !studentId) {
      toast.error("Selecteer een student");
      return;
    }

    setIsLoading(true);

    // Bereid de update data voor - Gebruik de juiste veldnamen voor de backend
    const updateData = {
      start_date: startDate,
      end_date: endDate,
      test_id: parseInt(testId),
      type: assignmentType,
    };

    if (assignmentType === "group") {
      updateData.group_id = parseInt(groupId);
    } else {
      updateData.user_id = parseInt(studentId);
    }

    console.log(" Sending update data:", updateData);

    const success = await onUpdate(assignment.id, updateData);
    setIsLoading(false);

    if (success) {
      toast.success("Toewijzing succesvol bijgewerkt");
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Weet je zeker dat je deze toewijzing wilt verwijderen?")) {
      setIsLoading(true);
      const success = await onDelete(assignment.id);
      setIsLoading(false);
      if (success) {
        toast.success("Toewijzing succesvol verwijderd");
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Toewijzing Bewerken
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Wijzig de gegevens van deze toewijzing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Toets Selectie */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-indigo-500" />
              Toets
            </Label>
            <Select value={testId} onValueChange={setTestId}>
              <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                <SelectValue placeholder="Selecteer een toets" />
              </SelectTrigger>
              <SelectContent>
                {tests && tests.length > 0 ? (
                  tests.map((test) => (
                    <SelectItem key={test.id} value={String(test.id)}>
                      {test.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Geen toetsen beschikbaar
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Type Selectie */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-indigo-500" />
              Toewijzen aan
            </Label>
            <Select
              value={assignmentType}
              onValueChange={(value) => {
                setAssignmentType(value);
                setGroupId("");
                setStudentId("");
              }}
            >
              <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Groep</SelectItem>
                <SelectItem value="student">Individuele Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Groep of Student Selectie */}
          {assignmentType === "group" ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Groep</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                  <SelectValue placeholder="Selecteer een groep" />
                </SelectTrigger>
                <SelectContent>
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.name} ({group.users?.length || 0} studenten)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Geen groepen beschikbaar
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                  <SelectValue placeholder="Selecteer een student" />
                </SelectTrigger>
                <SelectContent>
                  {students && students.length > 0 ? (
                    students.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.name} - {student.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Geen studenten beschikbaar
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Datum */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Start Datum
            </Label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Eind Datum */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-indigo-500" />
              Eind Datum
            </Label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Opslaan
            </Button>
           
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
