// components/docent/ToewijzingenTab.jsx
import { AssignmentList } from "./AssignmentList";
import { AssignmentForm } from "./AssignmentForm";

export function AssignmentsTab({
  assignments,
  tests,
  groups,
  students,
  isDialogOpen,
  setIsDialogOpen,
  formData,
  setFormData,
  onCreateAssignment,
}) {
  return (
    <>
      <AssignmentList
        assignments={assignments}
        onOpenDialog={() => setIsDialogOpen(true)}
      />
      <AssignmentForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tests={tests}
        groups={groups}
        students={students}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onCreateAssignment}
      />
    </>
  );
}
