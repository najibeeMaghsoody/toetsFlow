
import { useState } from "react";
import { TestList } from "./TestList";
import { TestDetails } from "./TestDetails";
import { TestFormDialog } from "./TestFormDialog";
import { SectionFormDialog } from "./SectionFormDialog";
import { QuestionFormDialog } from "./QuestionFormDialog";
import { toast } from "sonner";
export function TestsTab({
  tests,
  selectedTest,
  onSelectTest,
  onDeleteTest,
  onCreateTest,
  onUpdateTest,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  isSectionCreateOpen,
  setIsSectionCreateOpen,
  isSectionEditOpen,
  setIsSectionEditOpen,
  editingSection,
  setEditingSection,
  isQuestionCreateOpen,
  setIsQuestionCreateOpen,
  isQuestionEditOpen,
  setIsQuestionEditOpen,
  editingQuestion,
  setEditingQuestion,
  currentSection,
  setCurrentSection,
}) {
  const [isTestCreateOpen, setIsTestCreateOpen] = useState(false);
  const [isTestEditOpen, setIsTestEditOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const handleEditTest = (test) => {
    console.log("Editing test:", test);
    setEditingTest(test);
    setIsTestEditOpen(true);
  };

  const handleEditSection = (section) => {
    if (!section || !section.id) {
      toast.error("Kan sectie niet bewerken");
      return;
    }

    setEditingSection(section);
    setIsSectionEditOpen(true);
  };

  const handleEditQuestion = (question, section) => {
    setEditingQuestion(question);
    setCurrentSection(section);
    setIsQuestionEditOpen(true);
  };

  const handleAddQuestion = (section) => {
    setCurrentSection(section);
    setEditingQuestion(null);
    setIsQuestionCreateOpen(true);
  };

  const handleCreateSection = async (data) => {
    console.log("handleCreateSection - data:", data);
    console.log("handleCreateSection - selectedTest:", selectedTest);

    if (!selectedTest?.id) {
      console.error("No test selected");
      return false;
    }
    return await onCreateSection(selectedTest.id, data);
  };

  const handleUpdateSectionSubmit = async (data) => {
    if (!editingSection?.id) return false;
    return await onUpdateSection(editingSection.id, data);
  };

  const handleCreateQuestionSubmit = async (data) => {
    if (!currentSection?.id) return false;
    return await onCreateQuestion(currentSection.id, data);
  };

  const handleUpdateQuestionSubmit = async (data) => {
    if (!editingQuestion?.id) return false;
    return await onUpdateQuestion(editingQuestion.id, data);
  };

  const handleUpdateTestSubmit = async (data) => {
    if (!editingTest || !editingTest.id) {
      console.error("No test selected for editing");
      return false;
    }
    const result = await onUpdateTest(editingTest.id, data);
    if (result) {
      setIsTestEditOpen(false);
      setEditingTest(null);
    }
    return result;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TestList
        tests={tests}
        selectedTest={selectedTest}
        onSelectTest={onSelectTest}
        onDeleteTest={onDeleteTest}
        onEditTest={handleEditTest}
        onOpenDialog={() => setIsTestCreateOpen(true)}
      />

      <TestDetails
        test={selectedTest}
        onAddSection={() => {
          setEditingSection(null);
          setIsSectionCreateOpen(true);
        }}
        onEditSection={handleEditSection}
        onDeleteSection={onDeleteSection}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={onDeleteQuestion}
      />

      {/* Test Create Dialog */}
      <TestFormDialog
        open={isTestCreateOpen}
        onOpenChange={setIsTestCreateOpen}
        onSubmit={onCreateTest}
        isEditing={false}
      />

      {/* Test Edit Dialog */}
      <TestFormDialog
        open={isTestEditOpen}
        onOpenChange={setIsTestEditOpen}
        initialData={editingTest}
        onSubmit={handleUpdateTestSubmit}
        isEditing={true}
      />

      {/* Section Create Dialog */}
      <SectionFormDialog
        open={isSectionCreateOpen}
        onOpenChange={setIsSectionCreateOpen}
        testId={selectedTest?.id}
        onSubmit={handleCreateSection}
        isEditing={false}
      />

      {/* Section Edit Dialog */}
      <SectionFormDialog
        open={isSectionEditOpen}
        onOpenChange={setIsSectionEditOpen}
        initialData={editingSection}
        testId={selectedTest?.id}
        onSubmit={handleUpdateSectionSubmit}
        isEditing={true}
      />

      {/* Question Create Dialog */}
      <QuestionFormDialog
        open={isQuestionCreateOpen}
        onOpenChange={setIsQuestionCreateOpen}
        sectionId={currentSection?.id}
        sectionTitle={currentSection?.title}
        onSubmit={handleCreateQuestionSubmit}
        isEditing={false}
      />

      {/* Question Edit Dialog */}
      <QuestionFormDialog
        open={isQuestionEditOpen}
        onOpenChange={setIsQuestionEditOpen}
        initialData={editingQuestion}
        sectionId={currentSection?.id}
        sectionTitle={currentSection?.title}
        onSubmit={handleUpdateQuestionSubmit}
        isEditing={true}
      />
    </div>
  );
}
