import { getChatHistory } from "./api.js";

let chatHistory = [];
let ws;
let audioContext;
let audioQueue = [];
let isPlaying = false;
let username;
let currentAudio = null;
let stopSpeechDetection = null;

let source, processor;

function pauseSpeechDetection() {
  if (source && processor) {
    source.disconnect();
  }
}

function resumeSpeechDetection() {
  if (source && processor) {
    source.connect(processor);
  }
}

export async function initChat() {
  await loadAllChats();
  window.currentChatID = null;

  try {
    const userInfo = await getUserInfo();
    username = userInfo.username;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    username = "User";
  }

  updateChatHistory();
  renderChatHistory();

  const historySearch = document.getElementById("history-search");
  if (historySearch) {
    historySearch.addEventListener("input", renderHistory);
  }

  const sendButton = document.getElementById("send-button");
  const chatInput = document.getElementById("chat-input");
  const buttonIcon = document.getElementById("button-icon");
  const stopVoiceBtn = document.getElementById("stop-voice-btn");

  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", () => {
      if (stopSpeechDetection) {
        stopSpeechDetection();
        stopSpeechDetection = null;
      }
    });
  }

  if (sendButton && chatInput && buttonIcon) {
    chatInput.addEventListener("input", () => {
      buttonIcon.src = chatInput.value.trim()
        ? "./assets/send.svg"
        : "./assets/microphone.svg";
      buttonIcon.alt = chatInput.value.trim() ? "Send" : "Mic";
    });

    sendButton.addEventListener("click", async () => {
      if (chatInput.value.trim()) {
        await sendChatMessage(chatInput.value.trim());
        chatInput.value = "";
        buttonIcon.src = "assets/microphone.svg";
        buttonIcon.alt = "Mic";
      } else if (!sendButton.classList.contains("listening")) {
        speechDetection();
        sendButton.classList.add("listening");
      }
    });

    chatInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
          await sendChatMessage(message);
          chatInput.value = "";
          buttonIcon.src = "assets/microphone.svg";
          buttonIcon.alt = "Mic";
        }
      }
    });
  } else {
    console.error("Chat input elements not found");
  }

  connectWebSocket();

  const chatGroups = document.querySelector(".chat-groups");
  if (chatGroups) {
    chatGroups.addEventListener("click", async (e) => {
      const chatItem = e.target.closest(".chat-item");
      if (!chatItem) return;
      const chatId = chatItem.dataset.chatId;
      const actionIcon = e.target.closest(".action-icon");

      if (actionIcon) {
        if (actionIcon.classList.contains("rename-icon")) {
          chatItem.classList.add("renaming");
          const renameInput = chatItem.querySelector(".rename-input");
          if (renameInput) {
            renameInput.value =
              chatItem.querySelector(".chat-title").textContent;
            renameInput.classList.remove("hidden");
            renameInput.focus();
            renameInput.setSelectionRange(
              renameInput.value.length,
              renameInput.value.length
            );
          }
        } else if (actionIcon.classList.contains("save-icon")) {
          const renameInput = chatItem.querySelector(".rename-input");
          const newTitle = renameInput.value.trim();
          if (newTitle) {
            chatItem.querySelector(".chat-title").textContent = newTitle;
            const chat = window.chats.find((c) => c.id === chatId);
            if (chat) chat.title = newTitle;
          }
          chatItem.classList.remove("renaming");
          renameInput.classList.add("hidden");
        } else if (actionIcon.classList.contains("cancel-icon")) {
          chatItem.classList.remove("renaming");
          const renameInput = chatItem.querySelector(".rename-input");
          if (renameInput) renameInput.classList.add("hidden");
        } else if (actionIcon.classList.contains("delete-icon")) {
          if (chatId !== window.currentChatID) {
            chatItem.classList.add("deleting");
            const deleteConf = chatItem.querySelector(".delete-confirmation");
            if (deleteConf) deleteConf.classList.remove("hidden");
          }
        } else if (actionIcon.classList.contains("confirm-delete-icon")) {
          try {
            await deleteChat(chatId);
            window.chats = window.chats.filter((c) => c.id !== chatId);
            renderHistory();
          } catch (err) {
            console.error("Failed to delete chat:", err);
          }
        } else if (actionIcon.classList.contains("cancel-delete-icon")) {
          chatItem.classList.remove("deleting");
          const deleteConf = chatItem.querySelector(".delete-confirmation");
          if (deleteConf) deleteConf.classList.add("hidden");
        } else if (actionIcon.classList.contains("new-window-icon")) {
          const chat = window.chats.find((c) => c.id === chatId);
          if (chat) {
            const dataStr = JSON.stringify(chat.messages, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${chat.title.replace(/\s+/g, "_") || "chat"}_${chatId}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      } else {
        window.currentChatID = chatId;
        renderChatHistory();
        document.getElementById("history-popup")?.classList.remove("show");
      }
    });
  } else {
    console.error("Could not find .chat-groups container for click handling");
  }
}

async function getUserInfo() {
  const response = await fetch("http://localhost:5000/user", {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch user info");
  return response.json();
}

async function loadAllChats() {
  try {
    window.chats = await getChatHistory();
    window.chats = window.chats.map((chat) => {
      const firstMsg = chat.messages?.[0]?.parts?.[0]?.text;
      return {
        ...chat,
        title: chat.title || firstMsg || "Untitled Chat",
        timestamp: new Date(chat.timestamp).toISOString(),
      };
    });
    window.chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    renderHistory();
  } catch (error) {
    console.error("Failed to load chats:", error);
    window.chats = [];
  }
}

function updateChatHistory() {
  if (window.currentChatID !== null) {
    const currentChat = window.chats.find((c) => c.id === window.currentChatID);
    chatHistory = currentChat ? currentChat.messages : [];
  } else {
    chatHistory = [];
  }
}

function updateNewChatButton() {
  const newChatButton = document.querySelector(".chat-container");
  if (window.currentChatID !== null) {
    newChatButton.classList.remove("hidden");
  } else {
    newChatButton.classList.add("hidden");
  }
}

export function renderChatHistory() {
  updateChatHistory();
  const messagesDiv = document.querySelector(".messages");
  if (!messagesDiv) return console.error("Messages div not found");

  messagesDiv.innerHTML = "";
  if (chatHistory.length === 0) {
    messagesDiv.innerHTML = `
      <div class="ai-message greeting">
        <span class="greeting-title">Hey there, ${username}!</span><br />
        <span class="greeting-subtitle">How can I help you today?</span>
      </div>
    `;
  } else {
    chatHistory.forEach((msg, index) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `${msg.role}-message`;
      if (msg.role === "assistant") {
        const markdown = msg.parts[0].text;
        const html = marked.parse(markdown);
        const sanitizedHtml = DOMPurify.sanitize(html);

        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizedHtml, "text/html");
        const codeBlocks = doc.querySelectorAll("pre code");

        codeBlocks.forEach((codeBlock) => {
          const pre = codeBlock.parentElement;
          const languageClass = Array.from(codeBlock.classList).find((cls) =>
            cls.startsWith("language-")
          );
          const language = languageClass
            ? languageClass.replace("language-", "").toUpperCase()
            : "CODE";

          const container = document.createElement("div");
          container.className = "code-block-container";

          const header = document.createElement("div");
          header.className = "code-block-header";
          header.innerHTML = `
            <span class="language-label">${language}</span>
            <button class="copy-code-btn">Copy</button>
          `;

          pre.parentNode.insertBefore(container, pre);
          container.appendChild(header);
          container.appendChild(pre);

          const copyButton = header.querySelector(".copy-code-btn");
          copyButton.addEventListener("click", () => {
            const text = codeBlock.textContent;
            if (window.electronAPI && window.electronAPI.clipboardWriteText) {
              window.electronAPI.clipboardWriteText(text);
              copyButton.textContent = "Copied!";
              setTimeout(() => (copyButton.textContent = "Copy"), 2000);
            } else {
              navigator.clipboard
                .writeText(text)
                .then(() => {
                  copyButton.textContent = "Copied!";
                  setTimeout(() => (copyButton.textContent = "Copy"), 2000);
                })
                .catch(() => {
                  copyButton.textContent = "Failed";
                  setTimeout(() => (copyButton.textContent = "Copy"), 2000);
                });
            }
          });
        });

        msgDiv.innerHTML = `
          <div class="message-content">
            <div class="ai-response">${doc.body.innerHTML}</div>
            <div class="message-actions">
              <button class="play-audio-container play-audio" data-message-id="${
                msg.message_id || ""
              }" data-tooltip="Play Audio">
                <img src="assets/play.svg" alt="Play" />
              </button>
              <button class="like-container like" aria-label="Like" data-tooltip="Like">
                <img src="assets/like.svg" alt="Like" />
              </button>
              <button class="dislike-container dislike" aria-label="Dislike" data-tooltip="Dislike">
                <img src="assets/dis-like.svg" alt="Dislike" />
              </button>
            </div>
          </div>
        `;
      } else {
        msgDiv.textContent = msg.parts[0].text;
      }
      messagesDiv.appendChild(msgDiv);

      if (index < chatHistory.length - 1) {
        const separator = document.createElement("div");
        separator.className = "message-separator";
        messagesDiv.appendChild(separator);
      }
    });

    Prism.highlightAll();

    document.querySelectorAll(".play-audio").forEach((button) => {
      button.addEventListener("click", async () => {
        const messageId = button.dataset.messageId;
        if (!messageId) return;
        const message = chatHistory.find((m) => m.message_id === messageId);
        if (!message) return;
        const voicePopup = document.getElementById("voice-popup");
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          button.innerHTML = `<img src="assets/play.svg" alt="Play" />`;
          currentAudio = null;
          if (stopSpeechDetection) {
            resumeSpeechDetection();
            const voicePopup = document.getElementById("voice-popup");
            document.getElementById("voice-status").textContent = "Listening...";
            document.querySelector(".mic-icon").classList.remove("hidden");
            document.querySelectorAll(".mic-wave").forEach(el => el.classList.remove("hidden"));
            voicePopup.querySelector(".voice-interface").classList.remove("speaking");
          }
        } else {
          let audioUrl = message.audio_url;
          if (!audioUrl) {
            try {
              const response = await fetch(
                `http://localhost:5000/audio/${messageId}`,
                {
                  method: "GET",
                  headers: getAuthHeaders(),
                }
              );
              if (!response.ok) throw new Error("Failed to fetch audio");
              const data = await response.json();
              audioUrl = `http://localhost:5000${data.audio_url}`;
              message.audio_url = audioUrl;
            } catch (error) {
              console.error("Error fetching audio:", error);
              return;
            }
          }

          try {
            if (stopSpeechDetection) {
              pauseSpeechDetection();
              const voicePopup = document.getElementById("voice-popup");
              document.getElementById("voice-status").textContent = "Speaking...";
              document.querySelector(".mic-icon").classList.add("hidden");
              document.querySelectorAll(".mic-wave").forEach(el => el.classList.add("hidden"));
              voicePopup.querySelector(".voice-interface").classList.add("speaking");
            }
            currentAudio = new Audio(audioUrl);
            currentAudio.play().catch((error) => {
              console.error("Audio playback failed:", error);
            });
            button.innerHTML = `<img src="assets/stop.svg" alt="Stop" data-tooltip="Pause Audio" />`;
            currentAudio.onended = () => {
              button.innerHTML = `<img src="assets/play.svg" alt="Play" />`;
              currentAudio = null;
              if (stopSpeechDetection) {
                resumeSpeechDetection();
                const voicePopup = document.getElementById("voice-popup");
                document.getElementById("voice-status").textContent = "Listening...";
                document.querySelector(".mic-icon").classList.remove("hidden");
                document.querySelectorAll(".mic-wave").forEach(el => el.classList.remove("hidden"));
                voicePopup.querySelector(".voice-interface").classList.remove("speaking");
              }
            };
          } catch (error) {
            console.error("Error creating audio element:", error);
          }
        }
      });
    });

    document.querySelectorAll(".message-actions").forEach((actions) => {
      const likeBtn = actions.querySelector(".like-container");
      const dislikeBtn = actions.querySelector(".dislike-container");

      likeBtn.addEventListener("click", () => {
        const nowLiked = likeBtn.classList.toggle("liked");
        if (nowLiked) {
          dislikeBtn.classList.remove("disliked");
          dislikeBtn.disabled = true;
          dislikeBtn.style.pointerEvents = "none";
        } else {
          dislikeBtn.disabled = false;
          dislikeBtn.style.pointerEvents = "";
        }
      });

      dislikeBtn.addEventListener("click", () => {
        const nowDisliked = dislikeBtn.classList.toggle("disliked");
        if (nowDisliked) {
          likeBtn.classList.remove("liked");
          likeBtn.disabled = true;
          likeBtn.style.pointerEvents = "none";
        } else {
          likeBtn.disabled = false;
          likeBtn.style.pointerEvents = "";
        }
      });
    });
  }
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  updateNewChatButton();
}

export function renderHistory() {
  const historySearch = document.getElementById("history-search");
  const searchQuery = historySearch ? historySearch.value.toLowerCase() : "";
  const filteredChats = window.chats.filter((chat) =>
    (chat.title || "").toLowerCase().includes(searchQuery)
  );
  const chatGroupsDiv = document.querySelector(".chat-groups");
  if (!chatGroupsDiv) {
    console.error("Chat groups div not found");
    return;
  }
  chatGroupsDiv.innerHTML = "";
  if (filteredChats.length === 0) {
    chatGroupsDiv.innerHTML = "<p>No chat history found.</p>";
    return;
  }
  const { groups, older } = groupChats(filteredChats);
  ["Today", "Yesterday", "Past 7 Days", "This Month", "This Year"].forEach(
    (groupName) => {
      if (groups[groupName].length > 0) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "chat-group";
        groupDiv.innerHTML = `<h3>${groupName}</h3>`;
        groups[groupName].forEach((chat) => {
          groupDiv.appendChild(createChatItem(chat));
        });
        chatGroupsDiv.appendChild(groupDiv);
      }
    }
  );
  older.forEach((group) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "chat-group";
    groupDiv.innerHTML = `<h3>${group.year}</h3>`;
    group.chats.forEach((chat) => {
      groupDiv.appendChild(createChatItem(chat));
    });
    chatGroupsDiv.appendChild(groupDiv);
  });
}

function groupChats(chats) {
  const now = new Date();
  const groups = {
    Today: [],
    Yesterday: [],
    "Past 7 Days": [],
    "This Month": [],
    "This Year": [],
  };
  const older = [];

  chats.forEach((chat) => {
    const chatDate = new Date(chat.timestamp);
    const diffMs = now - chatDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      groups["Today"].push(chat);
    } else if (diffDays < 2) {
      groups["Yesterday"].push(chat);
    } else if (diffDays < 7) {
      groups["Past 7 Days"].push(chat);
    } else if (
      chatDate.getFullYear() === now.getFullYear() &&
      chatDate.getMonth() === now.getMonth()
    ) {
      groups["This Month"].push(chat);
    } else if (chatDate.getFullYear() === now.getFullYear()) {
      groups["This Year"].push(chat);
    } else {
      const year = chatDate.getFullYear();
      let yearGroup = older.find((g) => g.year === year);
      if (!yearGroup) {
        yearGroup = { year, chats: [] };
        older.push(yearGroup);
      }
      yearGroup.chats.push(chat);
    }
  });

  older.sort((a, b) => b.year - a.year);
  older.forEach((group) =>
    group.chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  );
  return { groups, older };
}

function createChatItem(chat) {
  const isCurrent = chat.id === window.currentChatID;
  const timeText = isCurrent
    ? "Current Chat - Active Now"
    : getRelativeTime(chat.timestamp);
  const deleteClass = isCurrent ? "disabled" : "";
  const chatItem = document.createElement("div");
  chatItem.className = `chat-item ${isCurrent ? "active" : ""}`;
  chatItem.dataset.chatId = chat.id;
  chatItem.innerHTML = `
    <div class="chat-content">
      <span class="chat-title">${chat.title}</span>
      <input type="text" class="rename-input hidden" value="${chat.title}" />
      <div class="rename-actions hidden">
        <img src="./assets/x.svg" alt="Cancel" class="action-icon cancel-icon" />
        <img src="./assets/check.svg" alt="Save" class="action-icon save-icon" />
      </div>
      <div class="delete-confirmation hidden">
        <div class="delete-actions">
          <img src="./assets/x.svg" alt="Cancel Delete" class="action-icon cancel-delete-icon" />
          <img src="./assets/trash.svg" alt="Confirm Delete" class="action-icon confirm-delete-icon" />
        </div>
      </div>
    </div>
    <span class="chat-time">${timeText}</span>
    <div class="chat-actions">
      <img src="assets/export.svg" alt="Open in New Tab" class="action-icon new-window-icon" />
      <img src="assets/note-pencil.svg" alt="Rename Chat" class="action-icon rename-icon" />
      <img src="assets/trash.svg" alt="Delete Chat" class="action-icon delete-icon ${deleteClass}" />
    </div>
  `;
  return chatItem;
}

function getRelativeTime(timestamp) {
  const istOptions = { timeZone: "Asia/Kolkata" };

  const now = new Date(
    new Intl.DateTimeFormat("en-US", {
      ...istOptions,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())
  );

  const date = new Date(
    new Intl.DateTimeFormat("en-US", {
      ...istOptions,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp))
  );

  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60)
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  return new Date(timestamp).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}

function connectWebSocket() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found");
    return;
  }
  ws = new WebSocket(`ws://localhost:5000/ws/chat?token=${token}`);
  ws.onopen = () => console.log("Chat WebSocket connected");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "text_response") {
      let chat;
      if (data.tempId) {
        chat = window.chats.find((c) => c.id === data.tempId);
        if (chat) {
          const oldId = chat.id;
          chat.id = data.chat_id;
          const chatItem = document.querySelector(
            `.chat-item[data-chat-id="${oldId}"]`
          );
          if (chatItem) {
            chatItem.dataset.chatId = data.chat_id;
          }
          chat.messages.push({
            role: "assistant",
            parts: [{ text: data.content }],
            message_id: data.message_id,
            audio_url: null,
          });
          window.currentChatID = data.chat_id;
        }
      } else {
        chat = window.chats.find((c) => c.id === data.chat_id);
        if (chat) {
          chat.messages.push({
            role: "assistant",
            parts: [{ text: data.content }],
            message_id: data.message_id,
            audio_url: null,
          });
        }
      }
      if (chat) {
        chat.timestamp = new Date().toISOString();
        window.chats.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        updateChatHistory();
        renderChatHistory();
        renderHistory();

        if (stopSpeechDetection && chatHistory.length > 0) {
          const lastMsg = chatHistory[chatHistory.length - 1];
          if (lastMsg.role === "assistant") {
            const playButton = document.querySelector(
              `.play-audio[data-message-id="${lastMsg.message_id}"]`
            );
            if (playButton) {
              playButton.click();
            }
          }
        }
      }
    } else if (data.type === "error") {
      console.error("Server error:", data.content);
    }
  };
  ws.onclose = () => {
    console.log("Chat WebSocket disconnected, attempting to reconnect");
    setTimeout(connectWebSocket, 5000);
  };
  ws.onerror = (error) => console.error("Chat WebSocket error:", error);
}

async function sendChatMessage(message) {
  if (window.currentChatID === null) {
    const tempId = `temp-${Date.now()}`;
    const newChat = {
      id: tempId,
      messages: [{ role: "user", parts: [{ text: message }] }],
      title: message,
      timestamp: new Date().toISOString(),
    };
    window.chats.push(newChat);
    window.chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    window.currentChatID = tempId;
    renderChatHistory();
    renderHistory();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message, chat_id: null, tempId }));
    }
  } else {
    const currentChat = window.chats.find((c) => c.id === window.currentChatID);
    if (currentChat) {
      currentChat.messages.push({ role: "user", parts: [{ text: message }] });
      currentChat.timestamp = new Date().toISOString();
      renderChatHistory();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message, chat_id: window.currentChatID }));
      }
    }
  }
}

async function processAudioQueue() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (isPlaying || audioQueue.length === 0) return;

  isPlaying = true;
  const buffer = audioQueue.shift();
  try {
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      isPlaying = false;
      processAudioQueue();
    };
    source.start();
  } catch (error) {
    console.error("Audio playback failed:", error);
    isPlaying = false;
    processAudioQueue();
  }
}

async function deleteChat(chatId) {
  const response = await fetch(`http://localhost:5000/chat/${chatId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete chat");
  return response.json();
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document
  .getElementById("history-search")
  ?.addEventListener("input", renderHistory);

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function speechDetection() {
  let audioContext, sendInterval, silenceInterval;
  const buffer = [];
  const silenceThreshold = 0.01;
  const silenceDuration = 800;
  let lastSpeechTime = Date.now();

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(async (stream) => {
      const voicePopup = document.getElementById("voice-popup");
      voicePopup.classList.add("show");
      document.getElementById("voice-status").textContent = "Listening...";
      document.querySelector(".mic-icon").classList.remove("hidden");
      document.querySelectorAll(".mic-wave").forEach(el => el.classList.remove("hidden"));
      voicePopup.querySelector(".voice-interface").classList.remove("speaking");
      audioContext = new AudioContext({ sampleRate: 16000 });
      const moduleURL = "./src/scripts/modules/audio-processor.js";
      const ws = new WebSocket(
        `ws://localhost:5000/ws/transcription?token=${localStorage.getItem(
          "authToken"
        )}`
      );

      await audioContext.audioWorklet.addModule(moduleURL);

      source = audioContext.createMediaStreamSource(stream);
      processor = new AudioWorkletNode(audioContext, "audio-processor");
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.port.onmessage = (event) => {
        const audioData = event.data.buffer;
        if (audioData.length > 0) {
          const rms = Math.sqrt(
            audioData.reduce((sum, val) => sum + val * val, 0) /
              audioData.length
          );
          if (rms > silenceThreshold) {
            lastSpeechTime = Date.now();
          }
          buffer.push(...audioData);
        }
      };

      sendInterval = setInterval(() => {
        if (buffer.length > 0 && ws.readyState === WebSocket.OPEN) {
          const audioData = new Float32Array(buffer);
          buffer.length = 0;
          const int16Data = audioData.map((sample) => sample * 32767);
          const byteArray = new Int16Array(int16Data).buffer;
          ws.send(byteArray);
        }
      }, 250);

      silenceInterval = setInterval(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTime;
        if (
          timeSinceLastSpeech > silenceDuration &&
          ws.readyState === WebSocket.OPEN
        ) {
          ws.send("EOS");
          lastSpeechTime = Date.now();
        }
      }, 100);

      stopSpeechDetection = () => {
        clearInterval(sendInterval);
        clearInterval(silenceInterval);
        if (source) source.disconnect();
        if (processor) processor.disconnect();
        stream.getTracks().forEach((track) => track.stop());
        ws.close();
        voicePopup.classList.remove("show");
        const sendButton = document.getElementById("send-button");
        const buttonIcon = document.getElementById("button-icon");
        sendButton.classList.remove("listening");
        buttonIcon.src = "assets/microphone.svg";
        buttonIcon.alt = "Mic";
        stopSpeechDetection = null;
      };

      ws.onopen = () => console.log("Transcription WebSocket connected");

      ws.onmessage = (event) => {
        console.log("Received message from server:", event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            sendChatMessage(data.transcript);
          } else if (data.error) {
            showError(data.error);
          }
        } catch (e) {
          showError(`Failed to parse server message: ${e.message}`);
        }
      };

      ws.onerror = (err) => {
        showError("WebSocket error occurred. Check the server connection.");
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => console.log("Transcription WebSocket closed");
    })
    .catch((err) => {
      if (err.name === "NotAllowedError") {
        showError("Microphone access denied. Please allow microphone access.");
      } else if (err.name === "NotFoundError") {
        showError("No microphone found. Please connect a microphone.");
      } else {
        showError(`Audio setup error: ${err.message}`);
      }
    });
}

function showError(message) {
  console.error(message);
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.querySelector(".chat-window")?.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 2000);
}