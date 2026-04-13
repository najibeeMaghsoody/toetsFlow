import api from "./api";
import { toast } from "sonner";

// ============ HELPER ============
const showNotification = (message, type = "success") => {
  if (type === "success") toast.success(message);
  else if (type === "error") toast.error(message);
  else if (type === "info") toast.info(message);
  else if (type === "warning") toast.warning(message);
  console.log(`[${type}] ${message}`);
};

// State updaters
let globalStateUpdaters = {
  updateTests: null,
  updateGroups: null,
  updateAssignments: null,
  updateSelectedTest: null,
  updateSelectedGroup: null,
  updateStudents: null,
};

export const registerStateUpdaters = (updaters) => {
  globalStateUpdaters = { ...globalStateUpdaters, ...updaters };
};

// ============ TESTS ============
export const getTests = async () => {
  try {
    const response = await api.get("/teacher/tests");
    const tests = response.data.data || [];
    if (globalStateUpdaters.updateTests) globalStateUpdaters.updateTests(tests);
    return tests;
  } catch (error) {
    showNotification("Fout bij laden toetsen", "error");
    return [];
  }
};

export const getTest = async (id) => {
  try {
    const response = await api.get(`/teacher/tests/${id}`);
    return response.data.data;
  } catch (error) {
    showNotification("Fout bij laden toets", "error");
    throw error;
  }
};

export const addTest = async (test) => {
  try {
    const response = await api.post("/teacher/tests", test);
    showNotification(
      response.data.message || "Toets succesvol aangemaakt",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij aanmaken toets",
      "error",
    );
    throw error;
  }
};

export const updateTest = async (id, testData) => {
  try {
    let testId = id;
    if (typeof id === "object" && id !== null) {
      testId = id.id;
    }

    if (!testId) {
      throw new Error("Geen geldig test ID");
    }

    console.log("Updating test with ID:", testId);
    console.log("Update data:", testData);

    const response = await api.put(`/teacher/tests/${testId}`, testData);
    showNotification(
      response.data.message || "Toets succesvol bijgewerkt",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    console.error("Error updating test:", error);
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken toets",
      "error",
    );
    throw error;
  }
};

export const deleteTest = async (id) => {
  try {
    const response = await api.delete(`/teacher/tests/${id}`);
    showNotification(
      response.data.message || "Toets succesvol verwijderd",
      "success",
    );
    await getTests();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen toets",
      "error",
    );
    throw error;
  }
};

// ============ SECTIONS ============
export const addSection = async (testId, section) => {
  try {
    const response = await api.post(
      `/teacher/tests/${testId}/sections`,
      section,
    );
    showNotification(
      response.data.message || "Sectie succesvol toegevoegd",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij toevoegen sectie",
      "error",
    );
    throw error;
  }
};

export const getSection = async (id) => {
  try {
    const response = await api.get(`/teacher/sections/${id}`);
    return response.data.data;
  } catch (error) {
    showNotification("Fout bij laden sectie", "error");
    throw error;
  }
};

export const updateSection = async (id, sectionData) => {
  try {
    const response = await api.put(`/teacher/sections/${id}`, sectionData);
    showNotification(
      response.data.message || "Sectie succesvol bijgewerkt",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken sectie",
      "error",
    );
    throw error;
  }
};

export const deleteSection = async (id) => {
  try {
    const response = await api.delete(`/teacher/sections/${id}`);
    showNotification(
      response.data.message || "Sectie succesvol verwijderd",
      "success",
    );
    await getTests();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen sectie",
      "error",
    );
    throw error;
  }
};

export const addQuestion = async (sectionId, question) => {
  try {
    if (!sectionId) {
      throw new Error("Geen sectie ID");
    }

    const response = await api.post(
      `/teacher/sections/${sectionId}/questions`,
      {
        question_text: question.question_text,
        type: question.type,
      },
    );

    const questionId = response.data?.data?.id || response.data?.id;

    if (!questionId) {
      throw new Error("Geen vraag ID ontvangen van API");
    }

    console.log("Vraag aangemaakt met ID:", questionId);

    if (
      question.type !== "text" &&
      question.answers &&
      question.answers.length > 0
    ) {
      for (const answer of question.answers) {
        if (answer.text && answer.text.trim()) {
          await api.post(`/teacher/questions/${questionId}/answers`, {
            answer_text: answer.text,
            is_correct: answer.isCorrect === true,
          });
          console.log(
            `Antwoord toegevoegd: "${answer.text}" (correct: ${answer.isCorrect})`,
          );
        }
      }
    }

    showNotification(
      response.data.message || "Vraag succesvol toegevoegd",
      "success",
    );
    await getTests();
    return response.data;
  } catch (error) {
    console.error("Error in addQuestion:", error);
    console.error("Error response:", error.response?.data);
    showNotification(
      error.response?.data?.message ||
        error.message ||
        "Fout bij toevoegen vraag",
      "error",
    );
    throw error;
  }
};

export const getQuestion = async (id) => {
  try {
    const response = await api.get(`/teacher/questions/${id}`);
    return response.data.data;
  } catch (error) {
    showNotification("Fout bij laden vraag", "error");
    throw error;
  }
};

export const updateQuestion = async (id, questionData) => {
  try {
    const response = await api.put(`/teacher/questions/${id}`, {
      question_text: questionData.question_text,
      type: questionData.type,
    });
    showNotification(
      response.data.message || "Vraag succesvol bijgewerkt",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken vraag",
      "error",
    );
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await api.delete(`/teacher/questions/${id}`);
    showNotification(
      response.data.message || "Vraag succesvol verwijderd",
      "success",
    );
    await getTests();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen vraag",
      "error",
    );
    throw error;
  }
};

// ============ ANSWERS ============
export const addAnswer = async (questionId, answer) => {
  try {
    const response = await api.post(
      `/teacher/questions/${questionId}/answers`,
      answer,
    );
    showNotification(
      response.data.message || "Antwoord succesvol toegevoegd",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij toevoegen antwoord",
      "error",
    );
    throw error;
  }
};

export const updateAnswer = async (id, answerData) => {
  try {
    const response = await api.put(`/teacher/answers/${id}`, answerData);
    showNotification(
      response.data.message || "Antwoord succesvol bijgewerkt",
      "success",
    );
    await getTests();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken antwoord",
      "error",
    );
    throw error;
  }
};

export const deleteAnswer = async (id) => {
  try {
    const response = await api.delete(`/teacher/answers/${id}`);
    showNotification(
      response.data.message || "Antwoord succesvol verwijderd",
      "success",
    );
    await getTests();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen antwoord",
      "error",
    );
    throw error;
  }
};

// ============ GROUPS ============
export const getGroups = async () => {
  try {
    const response = await api.get("/teacher/groups");
    const groups = response.data.data || [];
    if (globalStateUpdaters.updateGroups)
      globalStateUpdaters.updateGroups(groups);
    return groups;
  } catch (error) {
    showNotification("Fout bij laden groepen", "error");
    return [];
  }
};

export const getGroup = async (id) => {
  try {
    const response = await api.get(`/teacher/groups/${id}`);
    return response.data.data;
  } catch (error) {
    showNotification("Fout bij laden groep", "error");
    throw error;
  }
};

export const addGroup = async (group) => {
  try {
    const response = await api.post("/teacher/groups", group);
    showNotification(
      response.data.message || "Groep succesvol aangemaakt",
      "success",
    );
    await getGroups();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij aanmaken groep",
      "error",
    );
    throw error;
  }
};

export const updateGroup = async (id, groupData) => {
  try {
    const response = await api.put(`/teacher/groups/${id}`, groupData);
    showNotification(
      response.data.message || "Groep succesvol bijgewerkt",
      "success",
    );
    await getGroups();
    return response.data.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken groep",
      "error",
    );
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await api.delete(`/teacher/groups/${id}`);
    showNotification(
      response.data.message || "Groep succesvol verwijderd",
      "success",
    );
    await getGroups();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen groep",
      "error",
    );
    throw error;
  }
};

// ============ GROUP STUDENTS ============
export const addStudentToGroup = async (groupId, userId) => {
  try {
    const response = await api.post(`/teacher/groups/${groupId}/students`, {
      user_id: userId,
    });
    showNotification(response.data.message, "success");
    await getGroups();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij toevoegen student",
      "error",
    );
    throw error;
  }
};

export const removeStudentFromGroup = async (groupId, userId) => {
  try {
    const response = await api.delete(
      `/teacher/groups/${groupId}/students/${userId}`,
    );
    showNotification(response.data.message, "success");
    await getGroups();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen student",
      "error",
    );
    throw error;
  }
};

// ============ ASSIGNMENTS ============
export const getAssignments = async () => {
  try {
    const response = await api.get("/teacher/assignments");
    const assignments = response.data.data || [];
    if (globalStateUpdaters.updateAssignments)
      globalStateUpdaters.updateAssignments(assignments);
    return assignments;
  } catch (error) {
    showNotification("Fout bij laden toewijzingen", "error");
    return [];
  }
};

export const getAssignment = async (id) => {
  try {
    const response = await api.get(`/teacher/assignments/${id}`);
    return response.data.data;
  } catch (error) {
    showNotification("Fout bij laden toewijzing", "error");
    throw error;
  }
};

export const addAssignment = async (assignment) => {
  try {
    let response;
    if (assignment.type === "group") {
      response = await api.post(
        `/teacher/groups/${assignment.groupId}/tests/${assignment.testId}`,
        {
          start_date: assignment.startDate,
          end_date: assignment.endDate,
        },
      );
    } else {
      response = await api.post(
        `/teacher/tests/${assignment.testId}/assign-student`,
        {
          user_id: parseInt(assignment.studentId),
          start_date: assignment.startDate,
          end_date: assignment.endDate,
        },
      );
    }
    showNotification(response.data.message, "success");
    await getAssignments();
    return response.data;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij toewijzen toets",
      "error",
    );
    throw error;
  }
};

export const updateAssignment = async (id, assignmentData) => {
  try {
    console.log("🔄 Updating assignment via PUT:", id, assignmentData);

    const payload = {
      start_date: assignmentData.start_date,
      end_date: assignmentData.end_date,
    };

    if (assignmentData.test_id) {
      payload.test_id = assignmentData.test_id;
    }

    if (assignmentData.group_id) {
      payload.group_id = assignmentData.group_id;
    }

    if (assignmentData.user_id) {
      payload.user_id = assignmentData.user_id;
    }

    console.log("📦 PUT payload:", payload);

    const response = await api.put(`/teacher/assignments/${id}`, payload);

    showNotification(
      response.data.message || "Toewijzing succesvol bijgewerkt",
      "success",
    );
    await getAssignments();
    return true;
  } catch (error) {
    console.error(" Error updating assignment:", error);
    showNotification(
      error.response?.data?.message || "Fout bij bijwerken toewijzing",
      "error",
    );
    return false;
  }
};

export const deleteAssignment = async (id) => {
  try {
    const response = await api.delete(`/teacher/assignments/${id}`);
    showNotification(
      response.data.message || "Toewijzing succesvol verwijderd",
      "success",
    );
    await getAssignments();
    return true;
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Fout bij verwijderen toewijzing",
      "error",
    );
    throw error;
  }
};

// ============ STUDENTS ============
export const getStudents = async () => {
  try {
    console.log("getStudents wordt aangeroepen...");
    const response = await api.get("/teacher/students");
    console.log(" API Response /teacher/students:", response.data);
    const students = response.data.data || [];
    console.log("Aantal studenten ontvangen:", students.length);
    if (globalStateUpdaters.updateStudents)
      globalStateUpdaters.updateStudents(students);
    return students;
  } catch (error) {
    console.error("Fout bij laden studenten:", error);
    showNotification("Fout bij laden studenten", "error");
    return [];
  }
};
