const calculateProgress = (student, courses) => {
  if (!student) {
    return { percentage: 0, completedCourses: 0 };
  }
  const paidCourseIds = new Set(student.Payments ? student.Payments.map((payment) => payment.courseId) : []);
  const completedCourses = courses.filter((course) => paidCourseIds.has(course.id));
  const percentage = courses.length ? Math.round((completedCourses.length / courses.length) * 100) : 0;

  return {
    percentage,
    completedCourses: completedCourses.length
  };
};

module.exports = { calculateProgress };
