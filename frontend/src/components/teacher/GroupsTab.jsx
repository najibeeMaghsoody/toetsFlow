// components/docent/GroupsTab.jsx
import { useState } from "react";
import { GroupList } from "./GroupList";
import { GroupDetails } from "./GroupDetails";
import { GroupFormDialog } from "./GroupFormDialog";

export function GroupsTab({
  groups,
  students,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  onCreateGroup,
  onUpdateGroup,
  onToggleStudent,
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsEditOpen(true);
  };

  const handleCreate = async (data) => {
    return await onCreateGroup(data);
  };

  const handleUpdate = async (data) => {
    return await onUpdateGroup(editingGroup.id, data);
  };

  const handleDelete = async (id) => {
    if (confirm("Weet je zeker dat je deze groep wilt verwijderen?")) {
      return await onDeleteGroup(id);
    }
    return false;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupList
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={onSelectGroup}
          onDeleteGroup={handleDelete}
          onEditGroup={handleEdit}
          onOpenDialog={() => setIsCreateOpen(true)}
        />
        <GroupDetails
          group={selectedGroup}
          students={students}
          onToggleStudent={onToggleStudent}
        />
      </div>

      <GroupFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isEditing={false}
      />

      <GroupFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={editingGroup}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </>
  );
}
