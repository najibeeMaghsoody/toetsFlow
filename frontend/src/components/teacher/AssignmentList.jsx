// components/docent/AssignmentList.jsx
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
import { Plus } from "lucide-react";

export function AssignmentList({ assignments, onOpenDialog }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test Assignments</CardTitle>
            <CardDescription>
              Assign tests to groups or individual students
            </CardDescription>
          </div>
          <Button onClick={onOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.test?.title || "-"}
                </TableCell>
                <TableCell>
                  {assignment.group
                    ? `Group: ${assignment.group.name}`
                    : assignment.user
                      ? assignment.user.name
                      : "-"}
                </TableCell>
                <TableCell>
                  {new Date(assignment.start_date).toLocaleString("en-US")}
                </TableCell>
                <TableCell>
                  {new Date(assignment.end_date).toLocaleString("en-US")}
                </TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No assignments yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
