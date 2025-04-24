export function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDark) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
}

export function setTheme(theme) {
  const themeIcon = document.getElementById("theme-icon");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.src = "./assets/moon.svg";
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    if (themeIcon) themeIcon.src = "./assets/sun.svg";
    localStorage.setItem("theme", "light");
  }
}

export function toggleTheme() {
  if (document.body.classList.contains("dark-mode")) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}