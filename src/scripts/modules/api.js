function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getChatHistory() {
  const response = await fetch("http://localhost:5000/chat", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch chat history");
  return response.json();
}

export async function sendMessage(message) {
  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

export async function clearChat() {
  const response = await fetch("http://localhost:5000/chat", {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to clear chat");
  return response.json();
}

export async function getReminders() {
  const response = await fetch("http://localhost:5000/reminders", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch reminders");
  return response.json();
}

export async function createReminder(text, date) {
  const response = await fetch("http://localhost:5000/reminders", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, date }),
  });
  if (!response.ok) throw new Error("Failed to create reminder");
  return response.json();
}

export async function updateReminder(id, completed) {
  const response = await fetch(`http://localhost:5000/reminders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) throw new Error("Failed to update reminder");
  return response.json();
}

export async function deleteReminders(id) { // Renamed for consistency
  const response = await fetch(`http://localhost:5000/reminders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete reminder");
  return response.json();
}