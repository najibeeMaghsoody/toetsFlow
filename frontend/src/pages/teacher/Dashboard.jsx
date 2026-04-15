
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { FileText, Users, ClipboardList, LogOut } from "lucide-react";
import { useTeacherData } from "../../hooks/useTeacherData";
import { LoadingSpinner } from "../../components/teacher/LoadingSpinner";
import { TestsTab } from "../../components/teacher/TestsTab";
import { GroupsTab } from "../../components/teacher/GroupsTab";
import { AssignmentsTab } from "../../components/teacher/AssignmentsTab";
import { TestFormDialog } from "../../components/teacher/TestFormDialog";
import { GroupFormDialog } from "../../components/teacher/GroupFormDialog";
import { SectionFormDialog } from "../../components/teacher/SectionFormDialog";
import { QuestionFormDialog } from "../../components/teacher/QuestionFormDialog";

import { Button } from "../../components/ui/button";
import ErrorBoundary from "../../components/ErrorBoundary";
import { toast } from "sonner";
export function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    loading,
    tests,
    groups,
    students,
    assignments,
    selectedTest,
    selectedGroup,
    setSelectedTest,
    setSelectedGroup,
    createTest,
    updateTestById,
    removeTest,
    createSection,
    updateSectionById,
    removeSection,
    createQuestion,
    updateQuestionById,
    removeQuestion,
    createGroup,
    updateGroupById,
    removeGroup,
    toggleStudentInGroup,
    createAssignment,
    updateAssignmentById,
    removeAssignment,
  } = useTeacherData();

  // Dialog states
  const [isTestCreateOpen, setIsTestCreateOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isSectionEditOpen, setIsSectionEditOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isQuestionEditOpen, setIsQuestionEditOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);

  // Form states
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    is_public: false,
    max_attempts: 1,
  });
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    new_page: false,
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    type: "multiple_choice",
    answers: [{ text: "", isCorrect: false }],
  });
  const [assignmentForm, setAssignmentForm] = useState({
    testId: "",
    type: "group",
    groupId: "",
    studentId: "",
    startDate: "",
    endDate: "",
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCreateTest = async (data) => {
    const success = await createTest(data);
    if (success) {
      setIsTestCreateOpen(false);
      setTestForm({
        title: "",
        description: "",
        is_public: false,
        max_attempts: 1,
      });
    }
    return success;
  };

  const handleUpdateTest = async (id, data) => {
    return await updateTestById(id, data);
  };

  const handleAddSection = async (sectionData) => {
    console.log("handleAddSection - sectionData:", sectionData);
    console.log("handleAddSection - selectedTest:", selectedTest);

    if (!selectedTest?.id) {
      console.error("No test selected");
      return false;
    }

    const success = await createSection(selectedTest.id, sectionData);
    console.log("handleAddSection - success:", success);

    if (success) {
      setIsSectionDialogOpen(false);
      setSectionForm({ title: "", description: "", new_page: false });
    }
    return success;
  };



  const handleUpdateSection = async (sectionId, data) => {
    console.log(
      "handleUpdateSection - sectionId:",
      sectionId,
      "type:",
      typeof sectionId,
    );
    console.log("handleUpdateSection - data:", data);


    let id = sectionId;
    if (typeof sectionId === "object" && sectionId !== null) {
      id = sectionId.id;
    }

    if (!id) {
      console.error("Geen geldig sectie ID");
      toast.error("Kan sectie niet bijwerken: ongeldig ID");
      return false;
    }

    console.log("Calling updateSectionById with ID:", id);
    const success = await updateSectionById(id, data);
    console.log("updateSectionById result:", success);

    if (success) {
      setIsSectionEditOpen(false);
      setEditingSection(null);
      toast.success("Sectie succesvol bijgewerkt");
    }
    return success;
  };

  const handleAddQuestion = async (questionData) => {
    if (!currentSection?.id) return false;
    const success = await createQuestion(currentSection.id, questionData);
    if (success) {
      setIsQuestionDialogOpen(false);
      setQuestionForm({
        question_text: "",
        type: "multiple_choice",
        answers: [{ text: "", isCorrect: false }],
      });
      setCurrentSection(null);
    }
    return success;
  };

  const handleUpdateQuestion = async (id, data) => {
    const success = await updateQuestionById(id, data);
    if (success) {
      setIsQuestionEditOpen(false);
      setEditingQuestion(null);
    }
    return success;
  };

  const handleDeleteSection = async (sectionId) => {
    return await removeSection(sectionId);
  };

  const handleDeleteQuestion = async (questionId) => {
    return await removeQuestion(questionId);
  };

  if (loading) return <LoadingSpinner />;

  if (!user || user.role !== "teacher") {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="bg-white shadow-sm border border-gray-200 p-1">
            <TabsTrigger
              value="tests"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Toetsen
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Groepen
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Toewijzingen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <ErrorBoundary>
              <TestsTab
                tests={tests}
                selectedTest={selectedTest}
                onSelectTest={setSelectedTest}
                onDeleteTest={removeTest}
                onCreateTest={handleCreateTest}
                onUpdateTest={handleUpdateTest}
                onCreateSection={handleAddSection}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
                onCreateQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                isSectionCreateOpen={isSectionDialogOpen}
                setIsSectionCreateOpen={setIsSectionDialogOpen}
                isSectionEditOpen={isSectionEditOpen}
                setIsSectionEditOpen={setIsSectionEditOpen}
                editingSection={editingSection}
                setEditingSection={setEditingSection}
                isQuestionCreateOpen={isQuestionDialogOpen}
                setIsQuestionCreateOpen={setIsQuestionDialogOpen}
                isQuestionEditOpen={isQuestionEditOpen}
                setIsQuestionEditOpen={setIsQuestionEditOpen}
                editingQuestion={editingQuestion}
                setEditingQuestion={setEditingQuestion}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="groups">
            <ErrorBoundary>
              <GroupsTab
                groups={groups}
                students={students}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onDeleteGroup={removeGroup}
                onCreateGroup={createGroup}
                onUpdateGroup={updateGroupById}
                onToggleStudent={toggleStudentInGroup}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="assignments">
            <ErrorBoundary>
              <AssignmentsTab
                assignments={assignments}
                tests={tests}
                groups={groups}
                students={students}
                onCreateAssignment={createAssignment}
                onUpdateAssignment={updateAssignmentById}
                onDeleteAssignment={removeAssignment}
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </main>

      {/* Test Create Dialog */}
      <TestFormDialog
        open={isTestCreateOpen}
        onOpenChange={setIsTestCreateOpen}
        formData={testForm}
        setFormData={setTestForm}
        onSubmit={handleCreateTest}
        isEditing={false}
      />

      {/* Group Dialog */}
      <GroupFormDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        formData={groupForm}
        setFormData={setGroupForm}
        onSubmit={createGroup}
      />

      {/* Section Create Dialog */}
      <SectionFormDialog
        open={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        testId={selectedTest?.id}
        onSubmit={handleAddSection}
        isEditing={false}
      />

      {/* Section Edit Dialog */}
      <SectionFormDialog
        open={isSectionEditOpen}
        onOpenChange={setIsSectionEditOpen}
        initialData={editingSection}
        testId={selectedTest?.id}
        onSubmit={handleUpdateSection}
        isEditing={true}
      />

      {/* Question Create Dialog */}
      <QuestionFormDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        sectionId={currentSection?.id}
        sectionTitle={currentSection?.title}
        onSubmit={handleAddQuestion}
        isEditing={false}
      />

      {/* Question Edit Dialog */}
      <QuestionFormDialog
        open={isQuestionEditOpen}
        onOpenChange={setIsQuestionEditOpen}
        initialData={editingQuestion}
        sectionId={currentSection?.id}
        sectionTitle={currentSection?.title}
        onSubmit={handleUpdateQuestion}
        isEditing={true}
      />
    </div>
  );
}

export default TeacherDashboard;
