import { apiFetch, clearSession, getSessionUser } from "./api.js";

const user = getSessionUser();
if (!user || user.role !== "STUDENT") {
  window.location.href = "index.html";
}

const studentName = document.querySelector("#student-name");
const coursesList = document.querySelector("#courses-list");
const progressList = document.querySelector("#progress-list");
const paymentList = document.querySelector("#payment-list");
const levelsList = document.querySelector("#levels-list");
const contentList = document.querySelector("#content-list");
const resultsList = document.querySelector("#results-list");
const quizForm = document.querySelector("#quiz-form");
const quizQuestions = document.querySelector("#quiz-questions");
const quizResult = document.querySelector("#quiz-result");
const logoutBtn = document.querySelector("#logout");

studentName.textContent = user?.name || "Étudiant";

const loadCourses = async () => {
  const data = await apiFetch("/student/courses");
  coursesList.innerHTML = "";
  data.courses.forEach((course) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <strong>${course.title}</strong>
        <p>${course.description}</p>
        <span class="badge ${course.access ? "success" : "warning"}">${
          course.access ? "Débloqué" : "Verrouillé"
        }</span>
      </div>
      <div class="actions">
        ${
          course.access
            ? `<button data-open="${course.id}" class="secondary">Voir niveaux</button>`
            : `<button data-pay="${course.id}">Payer</button>`
        }
      </div>
    `;
    coursesList.appendChild(item);
  });
};

const loadProgress = async () => {
  const data = await apiFetch("/student/progress");
  if (progressList) {
    progressList.innerHTML = data.progress
      .map(
        (progress) => `
        <div class="list-item">
          <div>
            <strong>${progress.course_title}</strong>
            <p>Progression: ${progress.percentage}%</p>
          </div>
          <span class="badge">Mis à jour</span>
        </div>
      `
      )
      .join("");
  }

  if (resultsList) {
    if (!data.results.length) {
      resultsList.innerHTML = "<p class=\"notice\">Aucun quiz complété pour le moment.</p>";
      return;
    }
    resultsList.innerHTML = data.results
      .map(
        (result) => `
        <div class="list-item">
          <div>
            <strong>${result.course_title}</strong>
            <p>${result.level_name} · Score ${result.score}%</p>
          </div>
          <span class="badge ${result.passed ? "success" : "warning"}">${
            result.passed ? "Validé" : "Échec"
          }</span>
        </div>
      `
      )
      .join("");
  }
};

const loadPayments = async () => {
  const data = await apiFetch("/payments/history");
  if (!paymentList) {
    return;
  }
  paymentList.innerHTML = data.payments
    .map(
      (payment) => `
      <div class="list-item">
        <div>
          <strong>${payment.course_title}</strong>
          <p>${payment.amount} ${payment.currency}</p>
        </div>
        <span class="badge ${payment.status === "PAID" ? "success" : "warning"}">${payment.status}</span>
      </div>
    `
    )
    .join("");
};

const showQuiz = async (quizId) => {
  const data = await apiFetch(`/student/quizzes/${quizId}`);
  quizQuestions.innerHTML = data.questions
    .map(
      (question) => `
        <div class="card" style="margin-bottom: 12px;">
          <strong>${question.question_text}</strong>
          ${question.options
            .map(
              (option, index) => `
              <label style="display:block; margin-top:8px;">
                <input type="radio" name="question-${question.id}" value="${index}" required /> ${option}
              </label>
            `
            )
            .join("")}
        </div>
      `
    )
    .join("");
  quizForm.dataset.quizId = data.quiz.id;
  quizForm.style.display = "block";
};

const renderContents = (contents) => {
  if (!contentList) {
    return;
  }
  if (!contents.length) {
    contentList.innerHTML = "<p class=\"notice\">Aucun contenu disponible pour ce niveau.</p>";
    return;
  }
  contentList.innerHTML = contents
    .map(
      (content) => `
      <div class="list-item">
        <div>
          <strong>${content.title}</strong>
          <p>${content.type}</p>
        </div>
        <a href="${content.url}" target="_blank" rel="noopener">Ouvrir</a>
      </div>
    `
    )
    .join("");
};

const loadLevels = async (courseId) => {
  if (!levelsList) {
    return;
  }
  const data = await apiFetch(`/student/courses/${courseId}/levels`);
  levelsList.innerHTML = data.levels
    .map(
      (level) => `
      <div class="list-item">
        <div>
          <strong>${level.name}</strong>
          <p>Niveau ${level.order_index}</p>
          <span class="badge ${level.unlocked ? "success" : "warning"}">${
            level.unlocked ? "Débloqué" : "Verrouillé"
          }</span>
        </div>
        <div class="actions">
          ${
            level.unlocked
              ? `<button data-level="${level.id}" class="secondary">Voir contenus</button>`
              : `<span class="badge warning">${level.blockedReason || "Quiz requis"}</span>`
          }
        </div>
      </div>
    `
    )
    .join("");
};

coursesList?.addEventListener("click", async (event) => {
  const payId = event.target.dataset.pay;
  const openId = event.target.dataset.open;

  if (payId) {
    const currency = prompt("Devise (GNF, XOF, USD)", "GNF") || "GNF";
    const data = await apiFetch("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ courseId: Number(payId), currency })
    });
    alert(`Lien de paiement généré: ${data.paymentUrl}`);
    await loadPayments();
    return;
  }

  if (openId) {
    await loadLevels(openId);
  }
});

levelsList?.addEventListener("click", async (event) => {
  const levelId = event.target.dataset.level;
  if (!levelId) {
    return;
  }
  const contentData = await apiFetch(`/student/levels/${levelId}/contents`);
  renderContents(contentData.contents);
  if (contentData.quiz) {
    await showQuiz(contentData.quiz.id);
  } else if (quizForm) {
    quizForm.style.display = "none";
    quizResult.textContent = "Pas de quiz pour ce niveau.";
  }
});

quizForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const quizId = quizForm.dataset.quizId;
  const answers = Array.from(quizForm.querySelectorAll("input[type='radio']:checked")).map(
    (input) => ({
      questionId: Number(input.name.replace("question-", "")),
      selectedIndex: Number(input.value)
    })
  );
  const data = await apiFetch(`/student/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  quizResult.textContent = `Score: ${data.score}%. ${
    data.passed ? "Niveau validé." : "Niveau non validé."
  }`;
  await loadProgress();
});

logoutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

Promise.all([loadCourses(), loadProgress(), loadPayments()]).catch(() => undefined);
