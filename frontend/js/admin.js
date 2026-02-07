import { apiFetch, clearSession, getSessionUser } from "./api.js";

const courseForm = document.querySelector("#course-form");
const levelForm = document.querySelector("#level-form");
const contentForm = document.querySelector("#content-form");
const quizForm = document.querySelector("#quiz-form");
const questionForm = document.querySelector("#question-form");
const courseList = document.querySelector("#course-list");
const studentTable = document.querySelector("#student-table");
const paymentTable = document.querySelector("#payment-table");
const studentProgressForm = document.querySelector("#student-progress-form");
const studentProgressList = document.querySelector("#student-progress-list");
const studentResultsList = document.querySelector("#student-results-list");
const logoutBtn = document.querySelector("#logout");
const adminName = document.querySelector("#admin-name");

const user = getSessionUser();
if (!user || user.role !== "ADMIN") {
  window.location.href = "index.html";
}

adminName.textContent = user?.name || "Admin";

const loadCourses = async () => {
  const data = await apiFetch("/courses");
  courseList.innerHTML = "";
  data.courses.forEach((course) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <strong>${course.title}</strong>
        <span class="badge ${course.is_paid ? "warning" : "success"}">${
          course.is_paid ? `Payant · ${course.price}` : "Gratuit"
        }</span>
      </div>
      <div class="actions">
        <button data-edit="${course.id}" class="secondary">Modifier</button>
        <button data-delete="${course.id}">Supprimer</button>
      </div>
    `;
    courseList.appendChild(item);
  });
};

const loadStudents = async () => {
  const data = await apiFetch("/admin/students");
  studentTable.innerHTML = data.students
    .map(
      (student) => `
      <tr>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${new Date(student.created_at).toLocaleDateString()}</td>
      </tr>
    `
    )
    .join("");
};

const loadPayments = async () => {
  const data = await apiFetch("/admin/payments");
  paymentTable.innerHTML = data.payments
    .map(
      (payment) => `
      <tr>
        <td>${payment.student_name}</td>
        <td>${payment.course_title}</td>
        <td>${payment.amount} ${payment.currency}</td>
        <td>${payment.status}</td>
      </tr>
    `
    )
    .join("");
};

const loadStudentProgress = async (studentId) => {
  const data = await apiFetch(`/admin/students/${studentId}/progress`);
  if (studentProgressList) {
    if (!data.progress.length) {
      studentProgressList.innerHTML = "<p class=\"notice\">Aucune progression trouvée.</p>";
    } else {
      studentProgressList.innerHTML = data.progress
        .map(
          (item) => `
          <div class="list-item">
            <div>
              <strong>${item.course_title}</strong>
              <p>Progression: ${item.percentage}%</p>
            </div>
            <span class="badge">Mis à jour</span>
          </div>
        `
        )
        .join("");
    }
  }

  if (studentResultsList) {
    if (!data.results.length) {
      studentResultsList.innerHTML = "<p class=\"notice\">Aucun quiz enregistré.</p>";
    } else {
      studentResultsList.innerHTML = data.results
        .map(
          (result) => `
          <div class="list-item">
            <div>
              <strong>${result.course_title}</strong>
              <p>${result.level_name || `Quiz ${result.quiz_id}`} · Score: ${result.score}%</p>
            </div>
            <span class="badge ${result.passed ? "success" : "warning"}">${
              result.passed ? "Validé" : "Échec"
            }</span>
          </div>
        `
        )
        .join("");
    }
  }
};

courseForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(courseForm);
  const payload = Object.fromEntries(formData.entries());
  payload.isPaid = payload.isPaid === "on";
  payload.price = payload.price ? Number(payload.price) : 0;
  await apiFetch("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  courseForm.reset();
  await loadCourses();
});

levelForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(levelForm);
  const payload = Object.fromEntries(formData.entries());
  await apiFetch(`/admin/courses/${payload.courseId}/levels`, {
    method: "POST",
    body: JSON.stringify({ name: payload.name, orderIndex: Number(payload.orderIndex) })
  });
  levelForm.reset();
});

contentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(contentForm);
  const payload = Object.fromEntries(formData.entries());
  await apiFetch(`/admin/levels/${payload.levelId}/contents`, {
    method: "POST",
    body: JSON.stringify({
      type: payload.type,
      title: payload.title,
      url: payload.url
    })
  });
  contentForm.reset();
});

quizForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(quizForm);
  const payload = Object.fromEntries(formData.entries());
  await apiFetch(`/admin/levels/${payload.levelId}/quizzes`, {
    method: "POST",
    body: JSON.stringify({ passingScore: Number(payload.passingScore) })
  });
  quizForm.reset();
});

questionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(questionForm);
  const payload = Object.fromEntries(formData.entries());
  const options = payload.options.split(";").map((opt) => opt.trim()).filter(Boolean);
  await apiFetch(`/admin/quizzes/${payload.quizId}/questions`, {
    method: "POST",
    body: JSON.stringify({
      questionText: payload.questionText,
      options,
      correctIndex: Number(payload.correctIndex)
    })
  });
  questionForm.reset();
});

courseList?.addEventListener("click", async (event) => {
  const deleteId = event.target.dataset.delete;
  if (deleteId) {
    await apiFetch(`/admin/courses/${deleteId}`, { method: "DELETE" });
    await loadCourses();
  }
});

studentProgressForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(studentProgressForm);
  const studentId = formData.get("studentId");
  if (!studentId) {
    return;
  }
  await loadStudentProgress(studentId);
});

logoutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

Promise.all([loadCourses(), loadStudents(), loadPayments()]).catch(() => undefined);
