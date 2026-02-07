const tabs = document.querySelectorAll(".tab");
const dashboards = document.querySelectorAll(".dashboard");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    dashboards.forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== tab.dataset.tab);
    });
  });
});
