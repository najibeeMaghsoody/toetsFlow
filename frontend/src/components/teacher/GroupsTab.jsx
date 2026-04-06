// components/docent/GroepenTab.jsx
import { GroupList } from "./GroupList";
import { GroupDetails } from "./GroupDetails";

export function GroupsTab({
  groups,
  students,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  onOpenGroupDialog,
  onToggleStudent,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GroupList
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelectGroup}
        onDeleteGroup={onDeleteGroup}
        onOpenDialog={onOpenGroupDialog}
      />
      <GroupDetails
        group={selectedGroup}
        students={students}
        onToggleStudent={onToggleStudent}
      />
    </div>
  );
}
