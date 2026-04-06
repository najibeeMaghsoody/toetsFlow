// pages/docent/DocentDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { FileText, Users, ClipboardList } from "lucide-react";
import { useTeacherData } from "../../hooks/useTeacherData";
import { LoadingSpinner } from "../../components/teacher/LoadingSpinner";
import { Header } from "../../components/teacher/Header";
import { TestsTab } from "../../components/teacher/TestsTab";
import { GroupsTab } from "../../components/teacher/GroupsTab";
import { AssignmentsTab } from "../../components/teacher/AssignmentsTab";
import { TestFormDialog } from "../../components/teacher/TestFormDialog";
import { GroupFormDialog } from "../../components/teacher/GroupFormDialog";
import { SectionFormDialog } from "../../components/teacher/SectionFormDialog";
import { QuestionFormDialog } from "../../components/teacher/QuestionFormDialog";

export function DocentDashboard() {
  const { currentUser, logout } = useAuth();
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
    removeTest,
    createSection,
    removeSection,
    createQuestion,
    removeQuestion,
    createGroup,
    removeGroup,
    toggleStudentInGroup,
    createAssignment,
  } = useTeacherData();

  // Dialog states
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

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
    type: "single_choice",
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

  if (loading) return <LoadingSpinner />;

  if (!currentUser || currentUser.role !== "teacher") {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-cyan-50 pattern-grid">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-purple-200">
            <TabsTrigger
              value="tests"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <TestsTab
              tests={tests}
              selectedTest={selectedTest}
              onSelectTest={setSelectedTest}
              onDeleteTest={removeTest}
              onOpenTestDialog={() => setIsTestDialogOpen(true)}
              onAddSection={() => setIsSectionDialogOpen(true)}
              onDeleteSection={removeSection}
              onAddQuestion={() => setIsQuestionDialogOpen(true)}
              onDeleteQuestion={removeQuestion}
              isSectionDialogOpen={isSectionDialogOpen}
              setIsSectionDialogOpen={setIsSectionDialogOpen}
              isQuestionDialogOpen={isQuestionDialogOpen}
              setIsQuestionDialogOpen={setIsQuestionDialogOpen}
              editingSection={editingSection}
              setEditingSection={setEditingSection}
            />
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <GroupsTab
              groups={groups}
              students={students}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              onDeleteGroup={removeGroup}
              onOpenGroupDialog={() => setIsGroupDialogOpen(true)}
              onToggleStudent={toggleStudentInGroup}
            />
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <AssignmentsTab
              assignments={assignments}
              tests={tests}
              groups={groups}
              students={students}
              isDialogOpen={isAssignmentDialogOpen}
              setIsDialogOpen={setIsAssignmentDialogOpen}
              formData={assignmentForm}
              setFormData={setAssignmentForm}
              onCreateAssignment={createAssignment}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <TestFormDialog
        open={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
        formData={testForm}
        setFormData={setTestForm}
        onSubmit={createTest}
      />

      <GroupFormDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        formData={groupForm}
        setFormData={setGroupForm}
        onSubmit={createGroup}
      />

      <SectionFormDialog
        open={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        formData={sectionForm}
        setFormData={setSectionForm}
        onSubmit={(data) => createSection(selectedTest?.id, data)}
      />

      <QuestionFormDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        formData={questionForm}
        setFormData={setQuestionForm}
        onSubmit={(data) => createQuestion(editingSection?.id, data)}
      />
    </div>
  );
}

export default DocentDashboard;
