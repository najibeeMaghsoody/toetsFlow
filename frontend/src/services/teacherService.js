// services/teacherService.js
import api from "./api";

// ============ HELPER FUNCTIONS ============
// Deze functies worden gebruikt om de UI automatisch te updaten
let globalStateUpdaters = {
  updateTests: null,
  updateGroups: null,
  updateAssignments: null,
  updateSelectedTest: null,
  updateSelectedGroup: null,
};

// Registreer state updaters vanuit de hook
export const registerStateUpdaters = (updaters) => {
  globalStateUpdaters = { ...globalStateUpdaters, ...updaters };
};

// ============ TESTS ============
export const getTests = async () => {
  try {
    const response = await api.get("/teacher/tests");
    const tests = response.data.data || [];

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      globalStateUpdaters.updateTests(tests);
    }

    return tests;
  } catch (error) {
    console.error("Error fetching tests:", error);
    return [];
  }
};

export const addTest = async (test) => {
  try {
    const response = await api.post("/teacher/tests", {
      title: test.title,
      description: test.description,
      is_public: test.is_public || false,
      max_attempts: test.max_attempts || 1,
    });

    const newTest = response.data.data;

    // Automatisch de tests state updaten met de nieuwe test
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return newTest;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

export const updateTest = async (id, testData) => {
  try {
    const response = await api.put(`/teacher/tests/${id}`, testData);
    const updatedTest = response.data.data;

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return updatedTest;
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

export const deleteTest = async (id) => {
  try {
    await api.delete(`/teacher/tests/${id}`);

    // Automatisch de tests state updaten na verwijderen
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return true;
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

// ============ SECTIONS ============
export const addSection = async (testId, section) => {
  try {
    const response = await api.post(`/teacher/tests/${testId}/sections`, {
      title: section.title,
      description: section.description || "",
      new_page: section.new_page || false,
    });

    const newSection = response.data.data;

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);

      // Update selected test if needed
      if (globalStateUpdaters.updateSelectedTest && testId) {
        const updatedTest = currentTests.find((t) => t.id === testId);
        if (updatedTest) {
          globalStateUpdaters.updateSelectedTest(updatedTest);
        }
      }
    }

    return newSection;
  } catch (error) {
    console.error("Error adding section:", error);
    throw error;
  }
};

export const updateSection = async (sectionId, sectionData) => {
  try {
    const response = await api.put(
      `/teacher/sections/${sectionId}`,
      sectionData,
    );
    const updatedSection = response.data.data;

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return updatedSection;
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const deleteSection = async (sectionId) => {
  try {
    await api.delete(`/teacher/sections/${sectionId}`);

    // Automatisch de tests state updaten na verwijderen
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);

      // Update selected test if needed
      if (globalStateUpdaters.updateSelectedTest) {
        // Zoek de test die deze sectie bevatte
        for (const test of currentTests) {
          if (test.sections?.some((s) => s.id === sectionId)) {
            globalStateUpdaters.updateSelectedTest(test);
            break;
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
};

// ============ QUESTIONS ============
export const addQuestion = async (sectionId, question) => {
  try {
    const questionResponse = await api.post(
      `/teacher/sections/${sectionId}/questions`,
      {
        question_text: question.question_text,
        type: question.type || "single_choice",
      },
    );

    const questionId = questionResponse.data.id;

    if (
      question.type !== "text" &&
      question.answers &&
      question.answers.length > 0
    ) {
      for (let i = 0; i < question.answers.length; i++) {
        await api.post(`/teacher/questions/${questionId}/answers`, {
          answer_text: question.answers[i].text,
          is_correct: question.answers[i].isCorrect,
        });
      }
    }

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return questionResponse.data;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await api.put(
      `/teacher/questions/${questionId}`,
      questionData,
    );
    const updatedQuestion = response.data.data;

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return updatedQuestion;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    await api.delete(`/teacher/questions/${questionId}`);

    // Automatisch de tests state updaten na verwijderen
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// ============ ANSWERS ============
export const addAnswer = async (questionId, answer) => {
  try {
    const response = await api.post(
      `/teacher/questions/${questionId}/answers`,
      {
        answer_text: answer.text,
        is_correct: answer.isCorrect || false,
      },
    );

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error adding answer:", error);
    throw error;
  }
};

export const updateAnswer = async (answerId, answerData) => {
  try {
    const response = await api.put(`/teacher/answers/${answerId}`, answerData);
    const updatedAnswer = response.data.data;

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return updatedAnswer;
  } catch (error) {
    console.error("Error updating answer:", error);
    throw error;
  }
};

export const deleteAnswer = async (answerId) => {
  try {
    await api.delete(`/teacher/answers/${answerId}`);

    // Automatisch de tests state updaten
    if (globalStateUpdaters.updateTests) {
      const currentTests = await getTests();
      globalStateUpdaters.updateTests(currentTests);
    }

    return true;
  } catch (error) {
    console.error("Error deleting answer:", error);
    throw error;
  }
};

// ============ GROUPS ============
export const getGroups = async () => {
  try {
    const response = await api.get("/teacher/groups");
    const groups = response.data.data || [];

    // Automatisch de groups state updaten
    if (globalStateUpdaters.updateGroups) {
      globalStateUpdaters.updateGroups(groups);
    }

    return groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const addGroup = async (group) => {
  try {
    const response = await api.post("/teacher/groups", {
      name: group.name,
      description: group.description || "",
    });

    const newGroup = response.data.data;

    // Automatisch de groups state updaten
    if (globalStateUpdaters.updateGroups) {
      const currentGroups = await getGroups();
      globalStateUpdaters.updateGroups(currentGroups);
    }

    return newGroup;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

export const updateGroup = async (id, groupData) => {
  try {
    const response = await api.put(`/teacher/groups/${id}`, groupData);
    const updatedGroup = response.data.data;

    // Automatisch de groups state updaten
    if (globalStateUpdaters.updateGroups) {
      const currentGroups = await getGroups();
      globalStateUpdaters.updateGroups(currentGroups);
    }

    return updatedGroup;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    await api.delete(`/teacher/groups/${id}`);

    // Automatisch de groups state updaten na verwijderen
    if (globalStateUpdaters.updateGroups) {
      const currentGroups = await getGroups();
      globalStateUpdaters.updateGroups(currentGroups);
    }

    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// ============ STUDENTS IN GROUP ============
export const addStudentToGroup = async (groupId, studentId) => {
  try {
    await api.post(`/teacher/groups/${groupId}/students`, {
      user_id: studentId,
    });

    // Automatisch de groups state updaten
    if (globalStateUpdaters.updateGroups) {
      const currentGroups = await getGroups();
      globalStateUpdaters.updateGroups(currentGroups);
    }

    return true;
  } catch (error) {
    console.error("Error adding student to group:", error);
    throw error;
  }
};

export const removeStudentFromGroup = async (groupId, studentId) => {
  try {
    await api.delete(`/teacher/groups/${groupId}/students/${studentId}`);

    // Automatisch de groups state updaten
    if (globalStateUpdaters.updateGroups) {
      const currentGroups = await getGroups();
      globalStateUpdaters.updateGroups(currentGroups);
    }

    return true;
  } catch (error) {
    console.error("Error removing student from group:", error);
    throw error;
  }
};

// ============ ASSIGNMENTS ============
export const getAssignments = async () => {
  try {
    const response = await api.get("/teacher/assignments");
    const assignments = response.data.data || [];

    // Automatisch de assignments state updaten
    if (globalStateUpdaters.updateAssignments) {
      globalStateUpdaters.updateAssignments(assignments);
    }

    return assignments;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return [];
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
          user_id: assignment.studentId,
          start_date: assignment.startDate,
          end_date: assignment.endDate,
        },
      );
    }

    // Automatisch de assignments state updaten
    if (globalStateUpdaters.updateAssignments) {
      const currentAssignments = await getAssignments();
      globalStateUpdaters.updateAssignments(currentAssignments);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    await api.delete(`/teacher/assignments/${assignmentId}`);

    // Automatisch de assignments state updaten
    if (globalStateUpdaters.updateAssignments) {
      const currentAssignments = await getAssignments();
      globalStateUpdaters.updateAssignments(currentAssignments);
    }

    return true;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};

// ============ STUDENTS ============
export const getStudents = async () => {
  try {
    const response = await api.get("/teacher/students");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    if (error.response?.status === 404) {
      console.warn("Students endpoint not found, returning empty array");
      return [];
    }
    throw error;
  }
};
