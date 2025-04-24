export async function loadPage(page) {
  try {
    const html = await window.electronAPI.loadPage(page);
    const container = document.getElementById("container");
    if (container) container.innerHTML = html;
    window.dispatchEvent(new Event("pageLoaded"));
  } catch (error) {
    console.error(`Failed to load page ${page}:`, error);
    const container = document.getElementById("container");
    if (container) container.innerHTML = "<p>Error loading page</p>";
  }
}

export function initLoginPage() {
  const signInBtn = document.getElementById("sign-in-btn");
  const createAccountBtn = document.getElementById("create-account-btn");

  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      window.electronAPI.openExternal(
        "http://localhost:3000/login?redirect_uri=nuera%3A%2F%2Fauth-complete"
      );
    });
  }

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      window.electronAPI.openExternal(
        "http://localhost:3000/register?redirect_uri=nuera%3A%2F%2Fauth-complete"
      );
    });
  }
}