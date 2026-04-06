// services/teacherService.js
import api from "./api";

// ============ TESTS ============
export const getTests = async () => {
  try {
    const response = await api.get("/teacher/tests");
    return response.data.data || [];
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
    return response.data.data;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

export const deleteTest = async (id) => {
  try {
    await api.delete(`/teacher/tests/${id}`);
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
    return response.data.data;
  } catch (error) {
    console.error("Error adding section:", error);
    throw error;
  }
};

export const deleteSection = async (sectionId) => {
  try {
    await api.delete(`/teacher/sections/${sectionId}`);
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

    return questionResponse.data;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    await api.delete(`/teacher/questions/${questionId}`);
    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// ============ GROUPS ============
export const getGroups = async () => {
  try {
    const response = await api.get("/teacher/groups");
    return response.data.data || [];
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
    return response.data.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    await api.delete(`/teacher/groups/${id}`);
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
    return true;
  } catch (error) {
    console.error("Error adding student to group:", error);
    throw error;
  }
};

export const removeStudentFromGroup = async (groupId, studentId) => {
  try {
    await api.delete(`/teacher/groups/${groupId}/students/${studentId}`);
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
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
};

export const addAssignment = async (assignment) => {
  try {
    if (assignment.type === "group") {
      const response = await api.post(
        `/teacher/groups/${assignment.groupId}/tests/${assignment.testId}`,
        {
          start_date: assignment.startDate,
          end_date: assignment.endDate,
        },
      );
      return response.data;
    } else {
      const response = await api.post(
        `/teacher/tests/${assignment.testId}/assign-student`,
        {
          user_id: assignment.studentId,
          start_date: assignment.startDate,
          end_date: assignment.endDate,
        },
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

// ============ STUDENTS ============
export const getStudents = async () => {
  try {
    const response = await api.get("/admin/users?role=student");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};
