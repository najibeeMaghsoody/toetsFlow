// components/docent/ToetsenTab.jsx
import { TestList } from './TestList';
import { TestDetails } from './TestDetails';

export function TestsTab({
  tests,
  selectedTest,
  onSelectTest,
  onDeleteTest,
  onOpenTestDialog,
  onAddSection,
  onDeleteSection,
  onAddQuestion,
  onDeleteQuestion,
  isSectionDialogOpen,
  setIsSectionDialogOpen,
  isQuestionDialogOpen,
  setIsQuestionDialogOpen,
  editingSection,
  setEditingSection,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TestList
        tests={tests}
        selectedTest={selectedTest}
        onSelectTest={onSelectTest}
        onDeleteTest={onDeleteTest}
        onOpenDialog={onOpenTestDialog}
      />
      <TestDetails
        test={selectedTest}
        onAddSection={onAddSection}
        onDeleteSection={onDeleteSection}
        onAddQuestion={onAddQuestion}
        onDeleteQuestion={onDeleteQuestion}
        isSectionDialogOpen={isSectionDialogOpen}
        setIsSectionDialogOpen={setIsSectionDialogOpen}
        isQuestionDialogOpen={isQuestionDialogOpen}
        setIsQuestionDialogOpen={setIsQuestionDialogOpen}
        editingSection={editingSection}
        setEditingSection={setEditingSection}
      />
    </div>
  );
}