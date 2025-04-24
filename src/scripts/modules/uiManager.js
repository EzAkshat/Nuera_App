import { toggleTheme } from "./themeManager.js";
import { renderChatHistory, renderHistory } from "./chatManager.js";
import { renderReminders } from "./reminderManager.js";

export function initUI() {
  const accountIcon = document.querySelector(".account-container");
  const accountPopup = document.getElementById("account-popup");
  const remindersIcon = document.querySelector(".reminders-container");
  const remindersPopup = document.getElementById("reminders-popup");
  const historyIcon = document.querySelector(".history-container");
  const historyPopup = document.getElementById("history-popup");
  const addChatButton = document.querySelector(".chat-container");
  const themeToggle = document.querySelector(".theme-toggle");

  if (accountIcon && accountPopup) {
    accountIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(accountPopup, accountIcon);
    });
  }

  if (remindersIcon && remindersPopup) {
    remindersIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(remindersPopup, remindersIcon);
      renderReminders();
      const reminderText = document.getElementById("reminder-text");
      if (reminderText) reminderText.focus();
    });
  }

  if (historyIcon && historyPopup) {
    historyIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(historyPopup, historyIcon);
      renderHistory();
    });
  }

  if (addChatButton) {
    addChatButton.addEventListener("click", () => {
      window.currentChatID = null;
      renderChatHistory();
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".popup.show").forEach((popup) => {
      const popupContent = popup.querySelector(".popup-content");
      if (
        popupContent &&
        !popupContent.contains(e.target) &&
        popup.contains(e.target)
      ) {
        popup.classList.remove("show");
      }
    });
  });

  const closeButtons = document.querySelectorAll(".close-popup");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const popup = button.closest(".popup");
      if (popup) popup.classList.remove("show");
    });
  });
}

function showPopup(popup, icon) {
  document
    .querySelectorAll(".popup")
    .forEach((p) => p.classList.remove("show"));
  const popupContent = popup.querySelector(".popup-content");
  if (!popupContent) return;

  popup.classList.add("show");
  if (popupContent.classList.contains("centered")) return;

  const iconRect = icon.getBoundingClientRect();
  const popupWidth = popupContent.offsetWidth;
  const popupHeight = popupContent.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = iconRect.bottom + 10;
  let left = iconRect.right - popupWidth;

  if (left + popupWidth > viewportWidth) left = viewportWidth - popupWidth - 10;
  if (left < 0) left = 10;
  if (top + popupHeight > viewportHeight) {
    top = iconRect.top - popupHeight - 10;
    if (top < 0) top = 10;
  }

  popupContent.style.top = `${top}px`;
  popupContent.style.left = `${left}px`;
}