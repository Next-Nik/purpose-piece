// PURPOSE PIECE — APP LOGIC
// Session management, API communication, event handling.
// Depends on ui.js (loaded first via index.html).

const App = {
  sessionId: null,
  currentPhase: null,
  currentOptions: null,  // current button options if in button mode
  isWaiting: false,      // prevent double-sends

  // ─── Init ──────────────────────────────────────────────────────────────────
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const sendBtn = document.getElementById("send-btn");
    const input   = document.getElementById("user-input");
    const startBtn = document.getElementById("start-btn");

    if (startBtn) {
      startBtn.addEventListener("click", () => this.startConversation());
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendUserInput());
    }

    if (input) {
      // Auto-grow textarea
      input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 120) + "px";
      });

      // Enter to send (shift+enter for newline)
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendUserInput();
        }
      });
    }
  },

  // ─── Start ─────────────────────────────────────────────────────────────────
  async startConversation() {
    UI.hideWelcome();
    UI.showChat();

    const chatContainer = document.getElementById("chat-container");
    const typingEl = UI.createTypingIndicator();
    chatContainer.appendChild(typingEl);
    UI.showTyping();
    UI.scrollToBottom();

    try {
      const data = await this.callAPI([]);

      UI.hideTyping();
      this.handleAPIResponse(data, true);
    } catch (err) {
      UI.hideTyping();
      this.addAssistantMessage("Something went wrong getting started. Please refresh and try again.");
    }
  },

  // ─── Send user input ────────────────────────────────────────────────────────
  sendUserInput() {
    if (this.isWaiting) return;

    const input = document.getElementById("user-input");
    const text  = input ? input.value.trim() : "";
    if (!text) return;

    this.sendMessage(text);
  },

  // Called by option button clicks and by direct text input
  sendMessage(text) {
    if (this.isWaiting) return;
    this.isWaiting = true;

    UI.clearInput();
    UI.disableInput();

    // Show user bubble
    const chatContainer = document.getElementById("chat-container");
    const userBubble    = UI.createUserMessage(text);
    chatContainer.appendChild(userBubble);

    // Show typing
    const typingEl = UI.createTypingIndicator();
    chatContainer.appendChild(typingEl);
    UI.showTyping();
    UI.scrollToMessage(userBubble);

    // Build messages array (simple — just the latest user message)
    const messages = [{ role: "user", content: text }];

    this.callAPI(messages)
      .then(data => {
        UI.hideTyping();
        this.handleAPIResponse(data);
        this.isWaiting = false;
      })
      .catch(() => {
        UI.hideTyping();
        this.addAssistantMessage("Something went wrong. Please try again.");
        UI.enableInput();
        this.isWaiting = false;
      });
  },

  // ─── API call ───────────────────────────────────────────────────────────────
  async callAPI(messages) {
    const body = { messages, sessionId: this.sessionId };

    const response = await fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  // ─── Handle API response ────────────────────────────────────────────────────
  handleAPIResponse(data, isFirst = false) {
    if (data.sessionId) this.sessionId = data.sessionId;

    const chatContainer = document.getElementById("chat-container");

    // Phase transition divider (when phase changes)
    if (data.phase && data.phase !== this.currentPhase) {
      if (this.currentPhase !== null && data.phaseLabel) {
        const divider = UI.createPhaseDivider(data.phaseLabel);
        chatContainer.appendChild(divider);
      }
      this.currentPhase = data.phase;
    }

    // Update progress bar
    if (data.phase !== undefined) {
      UI.updateProgress(data.phase, data.phaseLabel);
    }

    // Assistant message
    if (data.message) {
      const msgEl = UI.createAssistantMessage(data.message);
      chatContainer.appendChild(msgEl);
      UI.scrollToMessage(msgEl);
    }

    // Option buttons (if inputMode is "buttons" and options provided)
    if (data.inputMode === "buttons" && data.options && data.options.length > 0) {
      this.currentOptions = data.options;
      const buttonsEl = UI.createOptionButtons(data.options, (id, text) => {
        const displayText = `${id.toUpperCase()}) ${text}`;
        this.sendMessage(displayText);
      });
      chatContainer.appendChild(buttonsEl);
      UI.scrollToMessage(buttonsEl);
    }

    // Set input mode
    if (data.complete) {
      UI.setInputMode("none");
    } else {
      UI.setInputMode(data.inputMode || "text");
    }
  },

  // ─── Helpers ────────────────────────────────────────────────────────────────
  addAssistantMessage(text) {
    const chatContainer = document.getElementById("chat-container");
    const el = UI.createAssistantMessage(text);
    chatContainer.appendChild(el);
    UI.scrollToMessage(el);
    UI.enableInput();
  }
};

// Boot
document.addEventListener("DOMContentLoaded", () => App.init());
window.App = App;

// Legacy global for inline onclick (start button)
function startConversation() {
  App.startConversation();
}
