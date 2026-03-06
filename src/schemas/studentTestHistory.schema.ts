// Format function to ensure consistent response structure
export const formatStudentTestHistoryResponse = (data: any): any[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => {
    const testId = item.testId || {};
    return {
      _id: String(item._id || ""),
      testId: testId._id,
      testName: testId.name,
      difficultyLevel: testId.difficultyLevel,
      questionCount: testId.questionCount,
      status: item.status || "Pending",
      score: item.score ?? null,
      correctAnswers: item.correctAnswers ?? null,
    };
  });
};
