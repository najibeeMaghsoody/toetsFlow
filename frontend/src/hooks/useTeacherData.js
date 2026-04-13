import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getTests,
  getGroups,
  getStudents,
  getAssignments,
  addTest,
  updateTest,
  deleteTest,
  addSection,
  updateSection,
  deleteSection,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  addGroup,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  registerStateUpdaters,
} from "../services/teacherService";

export function useTeacherData() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    registerStateUpdaters({
      updateTests: setTests,
      updateGroups: setGroups,
      updateAssignments: setAssignments,
      updateSelectedTest: setSelectedTest,
      updateSelectedGroup: setSelectedGroup,
      updateStudents: setStudents,
    });
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [testsData, groupsData, studentsData, assignmentsData] =
        await Promise.all([
          getTests(),
          getGroups(),
          getStudents(),
          getAssignments(),
        ]);

      setTests(testsData || []);
      setGroups(groupsData || []);
      setStudents(studentsData || []);
      setAssignments(assignmentsData || []);

      if (testsData?.length > 0 && !selectedTest) {
        setSelectedTest(testsData[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Fout bij laden van gegevens");
    } finally {
      setLoading(false);
    }
  }, [selectedTest]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============ REFRESH FUNCTIES ============
  const refreshTests = useCallback(async () => {
    console.log("Refreshing tests...");
    const data = await getTests();
    setTests(data);

    if (selectedTest) {
      const updatedTest = data.find((t) => t.id === selectedTest.id);
      if (updatedTest) {
        console.log("Updating selected test with fresh data:", updatedTest);
        setSelectedTest(updatedTest);
      }
    }
    return data;
  }, [selectedTest]);

  const refreshGroups = useCallback(async () => {
    console.log("Refreshing groups...");
    const data = await getGroups();
    setGroups(data);

    if (selectedGroup) {
      const updatedGroup = data.find((g) => g.id === selectedGroup.id);
      if (updatedGroup) setSelectedGroup(updatedGroup);
    }
    return data;
  }, [selectedGroup]);

  const refreshAssignments = useCallback(async () => {
    console.log("Refreshing assignments...");
    const data = await getAssignments();
    setAssignments(data);
    return data;
  }, []);

  // ============ TEST CRUD ============
  const createTest = async (testData) => {
    try {
      await addTest(testData);
      await refreshTests();
      toast.success("Toets succesvol aangemaakt");
      return true;
    } catch (error) {
      console.error("Error in createTest:", error);
      toast.error(error.response?.data?.message || "Fout bij aanmaken toets");
      return false;
    }
  };

  const updateTestById = async (id, data) => {
    try {
      const testId = typeof id === "object" ? id.id : id;
      console.log("Updating test with ID:", testId);
      console.log("Update data:", data);

      await updateTest(testId, data);
      await refreshTests();

      console.log("Test updated and data refreshed");
      toast.success("Toets succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateTestById:", error);
      toast.error(error.response?.data?.message || "Fout bij bijwerken toets");
      return false;
    }
  };

  const removeTest = async (testId) => {
    if (!confirm("Weet je zeker dat je deze toets wilt verwijderen?"))
      return false;
    try {
      await deleteTest(testId);
      if (selectedTest?.id === testId) setSelectedTest(null);
      await refreshTests();
      toast.success("Toets succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeTest:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen toets",
      );
      return false;
    }
  };

  // ============ SECTION CRUD ============
  const createSection = async (testId, sectionData) => {
    try {
      await addSection(testId, sectionData);
      await refreshTests();
      toast.success("Sectie succesvol toegevoegd");
      return true;
    } catch (error) {
      console.error("Error in createSection:", error);
      toast.error(error.response?.data?.message || "Fout bij toevoegen sectie");
      return false;
    }
  };

  const updateSectionById = async (sectionId, sectionData) => {
    try {
      await updateSection(sectionId, sectionData);
      await refreshTests();
      toast.success("Sectie succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateSectionById:", error);
      toast.error(error.response?.data?.message || "Fout bij bijwerken sectie");
      return false;
    }
  };

  const removeSection = async (sectionId) => {
    if (!confirm("Weet je zeker dat je deze sectie wilt verwijderen?"))
      return false;
    try {
      await deleteSection(sectionId);
      await refreshTests();
      toast.success("Sectie succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeSection:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen sectie",
      );
      return false;
    }
  };

  // ============ QUESTION CRUD ============
  const createQuestion = async (sectionId, questionData) => {
    try {
      await addQuestion(sectionId, questionData);
      await refreshTests();
      toast.success("Vraag succesvol toegevoegd");
      return true;
    } catch (error) {
      console.error("Error in createQuestion:", error);
      toast.error(error.response?.data?.message || "Fout bij toevoegen vraag");
      return false;
    }
  };

  const updateQuestionById = async (questionId, questionData) => {
    try {
      await updateQuestion(questionId, questionData);
      await refreshTests();
      toast.success("Vraag succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionById:", error);
      toast.error(error.response?.data?.message || "Fout bij bijwerken vraag");
      return false;
    }
  };

  const removeQuestion = async (questionId) => {
    if (!confirm("Weet je zeker dat je deze vraag wilt verwijderen?"))
      return false;
    try {
      await deleteQuestion(questionId);
      await refreshTests();
      toast.success("Vraag succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeQuestion:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen vraag",
      );
      return false;
    }
  };

  // ============ ANSWER CRUD ============
  const createAnswer = async (questionId, answerData) => {
    try {
      await addAnswer(questionId, answerData);
      await refreshTests();
      toast.success("Antwoord succesvol toegevoegd");
      return true;
    } catch (error) {
      console.error("Error in createAnswer:", error);
      toast.error(
        error.response?.data?.message || "Fout bij toevoegen antwoord",
      );
      return false;
    }
  };

  const updateAnswerById = async (answerId, answerData) => {
    try {
      await updateAnswer(answerId, answerData);
      await refreshTests();
      toast.success("Antwoord succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateAnswerById:", error);
      toast.error(
        error.response?.data?.message || "Fout bij bijwerken antwoord",
      );
      return false;
    }
  };

  const removeAnswer = async (answerId) => {
    if (!confirm("Weet je zeker dat je dit antwoord wilt verwijderen?"))
      return false;
    try {
      await deleteAnswer(answerId);
      await refreshTests();
      toast.success("Antwoord succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeAnswer:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen antwoord",
      );
      return false;
    }
  };

  // ============ GROUP CRUD ============
  const createGroup = async (groupData) => {
    try {
      await addGroup(groupData);
      await refreshGroups();
      toast.success("Groep succesvol aangemaakt");
      return true;
    } catch (error) {
      console.error("Error in createGroup:", error);
      toast.error(error.response?.data?.message || "Fout bij aanmaken groep");
      return false;
    }
  };

  const updateGroupById = async (id, groupData) => {
    try {
      await updateGroup(id, groupData);
      await refreshGroups();
      toast.success("Groep succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateGroupById:", error);
      toast.error(error.response?.data?.message || "Fout bij bijwerken groep");
      return false;
    }
  };

  const removeGroup = async (groupId) => {
    if (!confirm("Weet je zeker dat je deze groep wilt verwijderen?"))
      return false;
    try {
      await deleteGroup(groupId);
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
      await refreshGroups();
      toast.success("Groep succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeGroup:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen groep",
      );
      return false;
    }
  };

  // ============ GROUP STUDENTS ============
  const toggleStudentInGroup = async (groupId, studentId, isInGroup) => {
    try {
      if (isInGroup) {
        await removeStudentFromGroup(groupId, studentId);
      } else {
        await addStudentToGroup(groupId, studentId);
      }
      await refreshGroups();
      toast.success(
        isInGroup
          ? "Student verwijderd uit groep"
          : "Student toegevoegd aan groep",
      );
      return true;
    } catch (error) {
      console.error("Error toggling student:", error);
      toast.error(error.response?.data?.message || "Fout bij wijzigen groep");
      return false;
    }
  };

  // ============ ASSIGNMENT CRUD ============
  const createAssignment = async (assignmentData) => {
    try {
      await addAssignment(assignmentData);
      await refreshAssignments();
      toast.success("Toets succesvol toegewezen");
      return true;
    } catch (error) {
      console.error("Error in createAssignment:", error);
      toast.error(error.response?.data?.message || "Fout bij toewijzen toets");
      return false;
    }
  };

  const updateAssignmentById = async (assignmentId, assignmentData) => {
    try {
      await updateAssignment(assignmentId, assignmentData);
      await refreshAssignments();
      toast.success("Toewijzing succesvol bijgewerkt");
      return true;
    } catch (error) {
      console.error("Error in updateAssignmentById:", error);
      toast.error(
        error.response?.data?.message || "Fout bij bijwerken toewijzing",
      );
      return false;
    }
  };

  const removeAssignment = async (assignmentId) => {
    if (!confirm("Weet je zeker dat je deze toewijzing wilt verwijderen?"))
      return false;
    try {
      await deleteAssignment(assignmentId);
      await refreshAssignments();
      toast.success("Toewijzing succesvol verwijderd");
      return true;
    } catch (error) {
      console.error("Error in removeAssignment:", error);
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen toewijzing",
      );
      return false;
    }
  };

  return {
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
    createAnswer,
    updateAnswerById,
    removeAnswer,
    createGroup,
    updateGroupById,
    removeGroup,
    toggleStudentInGroup,
    createAssignment,
    updateAssignmentById,
    removeAssignment,
    refreshData: loadAllData,
    refreshTests,
    refreshGroups,
    refreshAssignments,
  };
}
