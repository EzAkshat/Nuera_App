import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminders,
} from "./api.js";
import { initWebSocket } from './websocket.js';

export let reminders = [];

async function loadReminders() {
  try {
    reminders = await getReminders();
    renderReminders();
  } catch (error) {
    console.error("Failed to load reminders:", error);
  }
}

function initFlatpickr() {
  const dateInput = document.getElementById('reminder-date');
  const timeInput = document.getElementById('reminder-time');
  let datePicker, timePicker;

  if (dateInput) {
    datePicker = flatpickr(dateInput, {
      enableTime: false,       // date only
      dateFormat: 'Y-m-d',
    });
    // open when the user clicks the calendar icon
    const dateIcon = document.querySelector('.date-group .input-icon');
    if (dateIcon) dateIcon.addEventListener('click', () => datePicker.open());
  }

  if (timeInput) {
    timePicker = flatpickr(timeInput, {
      enableTime: true,        // time only
      noCalendar: true,
      dateFormat: 'H:i',
    });
    // open when the user clicks the clock icon
    const timeIcon = document.querySelector('.time-group .input-icon');
    if (timeIcon) timeIcon.addEventListener('click', () => timePicker.open());
  }
}

export function renderReminders() {
  const reminderList = document.getElementById("reminders-list");
  if (!reminderList) {
    console.error("Reminder list element not found");
    return;
  }
  reminderList.innerHTML = "";
  reminders.forEach((reminder) => {
    const item = document.createElement("div");
    item.classList.add("reminder-item");
    item.innerHTML = `
      <input type="checkbox" ${reminder.completed ? "checked" : ""} data-id="${reminder.id}"/>
      <span class="reminder-text">${reminder.text}</span>
      <span class="reminder-date">${formatDate(reminder.date)}</span>
      ${reminder.completed && reminder.ai_response ? `<span class="ai-response">${reminder.ai_response}</span>` : ""}
      <button data-id="${reminder.id}">Delete</button>
    `;
    reminderList.appendChild(item);
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

async function deleteReminder(id) {
  try {
    await deleteReminders(id);
    reminders = reminders.filter((r) => r.id !== id);
    renderReminders();
  } catch (error) {
    console.error("Failed to delete reminder:", error);
  }
}

async function toggleReminderCompletion(id, completed) {
  try {
    await updateReminder(id, completed);
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) reminder.completed = completed;
    renderReminders();
  } catch (error) {
    console.error("Failed to update reminder:", error);
  }
}

export function initReminders() {
  const addReminderBtn = document.getElementById("add-reminder-btn");
  const reminderInput = document.getElementById("reminder-text");
  const reminderDate = document.getElementById("reminder-date");
  const reminderTime = document.getElementById("reminder-time");
  const reminderListLocal = document.getElementById("reminders-list");

  if (
    !addReminderBtn ||
    !reminderInput ||
    !reminderDate ||
    !reminderTime ||
    !reminderListLocal
  ) {
    console.error("One or more reminder elements not found:", {
      addReminderBtn: !!addReminderBtn,
      reminderInput: !!reminderInput,
      reminderDate: !!reminderDate,
      reminderTime: !!reminderTime,
      reminderList: !!reminderListLocal,
    });
    return;
  }

  loadReminders();
  initFlatpickr();

  addReminderBtn.addEventListener("click", async () => {
    const text = reminderInput.value.trim();
    const dateVal = reminderDate.value;
    const timeVal = reminderTime.value;
    if (text && dateVal && timeVal) {
      const dateTime = `${dateVal} ${timeVal}`;
      try {
        const newReminder = await createReminder(text, dateTime);
        reminders.push(newReminder);
        renderReminders();
        reminderInput.value = "";
        reminderDate.value = "";
        reminderTime.value = "";
      } catch (error) {
        console.error("Failed to add reminder:", error);
      }
    }
  });

  reminderListLocal.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      const id = e.target.dataset.id;
      toggleReminderCompletion(id, e.target.checked);
    }
  });

  reminderListLocal.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.dataset.id;
      deleteReminder(id);
    }
  });
  initWebSocket();

}
