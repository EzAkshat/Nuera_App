import { loadPage, initLoginPage } from '../../scripts/modules/pageManager.js';
import { initUI } from '../../scripts/modules/uiManager.js';
import { initChat } from '../../scripts/modules/chatManager.js';
import { initReminders } from '../../scripts/modules/reminderManager.js';
import { initTheme } from '../../scripts/modules/themeManager.js';
initTheme();
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmQ0MDE2ZTEyOWQ2NGI5NDJhMzBmNSIsImVtYWlsIjoiYWtzaGF0bmFpazA5MDRAZ21haWwuY29tIiwiaWF0IjoxNzQ1MzIxNTYwLCJleHAiOjE3NDU2ODE1NjB9.I0VurShWz4uX9vZjaRLZTNwYEAFE63NMubct6SAbtiA');

// On load, decide whether to show login or homepage
window.onload = async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    await loadPage('homepage');
  } else {
    await loadPage('login');
  }
};

// Handle successful authentication
window.electronAPI.onAuthSuccess(async (token) => {
  console.log('Authentication successful, token:', token);
  // Store token for future use
  localStorage.setItem('authToken', token);
  // Redirect to homepage
  await loadPage('homepage');
});

// Handle authentication errors
window.electronAPI.onAuthError((error) => {
  console.error('Authentication error:', error);
  const errorDiv = document.getElementById('error');
  if (errorDiv) {
    errorDiv.textContent = error;
    errorDiv.classList.remove('d-none');
  }
});

// Sign-out logic
function signOut() {
  localStorage.removeItem('authToken');
  loadPage('login');
}

// Initialize UI modules after each page load
window.addEventListener('pageLoaded', () => {
  // If homepage loaded
  if (document.querySelector('.nav-bar')) {
    initUI();
    initChat();
    initReminders();

    // Account popup toggle
    const accountContainer = document.querySelector('.account-container');
    const accountPopup = document.getElementById('account-popup');
    if (accountContainer && accountPopup) {
      accountContainer.addEventListener('click', () => {
        accountPopup.classList.toggle('active');
      });
    }

    // Sign Out
    const signOutItem = document.querySelector('.signout-item');
    if (signOutItem) {
      signOutItem.addEventListener('click', () => {
        signOut();
        if (accountPopup) accountPopup.classList.remove('active');
      });
    }
  }
  // If login page loaded
  else if (document.querySelector('.login-wrapper')) {
    initLoginPage();
  }
});
