
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Users,
  FileText,
} from "lucide-react";

export function AssignmentList({
  assignments,
  onOpenDialog,
  onEditAssignment,
  onDeleteAssignment,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActive = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Toets Toewijzingen
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Beheer alle toewijzingen van toetsen
            </CardDescription>
          </div>
          <Button
            onClick={onOpenDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Toewijzing
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Toets</TableHead>
                <TableHead>Toegewezen aan</TableHead>
                <TableHead>Start Datum</TableHead>
                <TableHead>Eind Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const active = isActive(assignment.end_date);

                return (
                  <TableRow key={assignment.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {assignment.test?.title || "-"}
                    </TableCell>
                    <TableCell>
                      {assignment.group?.name || assignment.user?.name || "-"}
                    </TableCell>
                    <TableCell>{formatDate(assignment.start_date)}</TableCell>
                    <TableCell>{formatDate(assignment.end_date)}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {active ? "Actief" : "Verlopen"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditAssignment(assignment)}
                          className="text-gray-500 hover:text-indigo-600"
                          title="Bewerken"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteAssignment(assignment.id)}
                          className="text-gray-500 hover:text-red-600"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Geen toewijzingen gevonden</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenDialog}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nieuwe Toewijzing
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
