import { renderReminders ,reminders } from './reminderManager.js';

let ws;
export function initWebSocket() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No auth token found');
    return;
  }
  ws = new WebSocket(`ws://localhost:5000/ws/reminders?token=${token}`);
  ws.onopen = () => console.log('Reminders WebSocket connected');
  ws.onmessage = (event) => {
    const reminderData = JSON.parse(event.data);
    if (Array.isArray(reminderData)) {
      reminders = reminderData;
    } else {
      if (reminderData.completed && reminderData.ai_response) {
        // Send to main process for notification
        window.electronAPI.sendNotification({
          title: reminderData.text,
          body: reminderData.ai_response,
        });        
      }
      const existingIndex = reminders.findIndex(r => r.id === reminderData.id);
      if (existingIndex !== -1) {
        reminders[existingIndex] = reminderData;
      } else {
        reminders.push(reminderData);
      }
    }
    renderReminders();
  };
  ws.onclose = () => console.log('Reminders WebSocket disconnected');
  ws.onerror = (error) => console.error('Reminders WebSocket error:', error);
}