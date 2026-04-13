import { useState } from "react";
import { AssignmentList } from "./AssignmentList";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentEditDialog } from "./AssignmentEditDialog";
import { toast } from "sonner";

export function AssignmentsTab({
  assignments = [],
  tests = [],
  groups = [],
  students = [],
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsEditOpen(true);
  };

  const handleCreate = async (data) => {
    try {
      return await onCreateAssignment(data);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Fout bij aanmaken toewijzing");
      return false;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      if (!id) {
        toast.error("Geen toewijzing geselecteerd");
        return false;
      }
      return await onUpdateAssignment(id, data);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Fout bij bijwerken toewijzing");
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Weet je zeker dat je deze toewijzing wilt verwijderen?")) {
      try {
        return await onDeleteAssignment(id);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Fout bij verwijderen toewijzing");
        return false;
      }
    }
    return false;
  };

  return (
    <>
      <AssignmentList
        assignments={assignments}
        onOpenDialog={() => setIsCreateOpen(true)}
        onEditAssignment={handleEdit}
        onDeleteAssignment={handleDelete}
      />

      <AssignmentForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tests={tests}
        groups={groups}
        students={students}
        onSubmit={handleCreate}
        isEditing={false}
      />

      <AssignmentEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        assignment={editingAssignment}
        tests={tests}
        groups={groups}
        students={students}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
