// hooks/useTeacherData.js - Eenvoudige versie (werkt prima!)
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getTests,
  getGroups,
  getStudents,
  getAssignments,
  addTest,
  deleteTest,
  addSection,
  deleteSection,
  addQuestion,
  deleteQuestion,
  addGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup,
  addAssignment,
} from "../services/teacherService";

export function useTeacherData() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadAllData = useCallback(async () => {
    console.log(" Loading data...");
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

  // Refresh functies
  const refreshTests = async () => {
    const data = await getTests();
    setTests(data);
    if (selectedTest) {
      const updated = data.find((t) => t.id === selectedTest.id);
      if (updated) setSelectedTest(updated);
    }
    return data;
  };

  const refreshGroups = async () => {
    const data = await getGroups();
    setGroups(data);
    return data;
  };

  const refreshAssignments = async () => {
    const data = await getAssignments();
    setAssignments(data);
    return data;
  };

  // CRUD operaties
  const createTest = async (testData) => {
    try {
      await addTest(testData);
      toast.success("Toets succesvol aangemaakt");
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij aanmaken toets");
      return false;
    }
  };

  const removeTest = async (testId) => {
    if (!confirm("Weet je zeker dat je deze toets wilt verwijderen?"))
      return false;
    try {
      await deleteTest(testId);
      toast.success("Toets verwijderd");
      if (selectedTest?.id === testId) setSelectedTest(null);
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen toets",
      );
      return false;
    }
  };

  const createSection = async (testId, sectionData) => {
    try {
      await addSection(testId, sectionData);
      toast.success("Sectie toegevoegd");
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij toevoegen sectie");
      return false;
    }
  };

  const removeSection = async (sectionId) => {
    if (!confirm("Weet je zeker dat je deze sectie wilt verwijderen?"))
      return false;
    try {
      await deleteSection(sectionId);
      toast.success("Sectie verwijderd");
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen sectie",
      );
      return false;
    }
  };

  const createQuestion = async (sectionId, questionData) => {
    try {
      await addQuestion(sectionId, questionData);
      toast.success("Vraag toegevoegd");
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij toevoegen vraag");
      return false;
    }
  };

  const removeQuestion = async (questionId) => {
    if (!confirm("Weet je zeker dat je deze vraag wilt verwijderen?"))
      return false;
    try {
      await deleteQuestion(questionId);
      toast.success("Vraag verwijderd");
      await refreshTests();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen vraag",
      );
      return false;
    }
  };

  const createGroup = async (groupData) => {
    try {
      await addGroup(groupData);
      toast.success("Groep aangemaakt");
      await refreshGroups();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij aanmaken groep");
      return false;
    }
  };

  const removeGroup = async (groupId) => {
    if (!confirm("Weet je zeker dat je deze groep wilt verwijderen?"))
      return false;
    try {
      await deleteGroup(groupId);
      toast.success("Groep verwijderd");
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
      await refreshGroups();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fout bij verwijderen groep",
      );
      return false;
    }
  };

  const toggleStudentInGroup = async (groupId, studentId, isInGroup) => {
    try {
      if (isInGroup) {
        await removeStudentFromGroup(groupId, studentId);
        toast.success("Student verwijderd uit groep");
      } else {
        await addStudentToGroup(groupId, studentId);
        toast.success("Student toegevoegd aan groep");
      }
      await refreshGroups();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij wijzigen groep");
      return false;
    }
  };

  const createAssignment = async (assignmentData) => {
    try {
      await addAssignment(assignmentData);
      toast.success("Toets toegewezen");
      await refreshAssignments();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Fout bij toewijzen toets");
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
    removeTest,
    createSection,
    removeSection,
    createQuestion,
    removeQuestion,
    createGroup,
    removeGroup,
    toggleStudentInGroup,
    createAssignment,
    refreshData: loadAllData,
  };
}
