// PURPOSE PIECE — APP LOGIC
// Session management, API communication, event handling.
// Depends on ui.js (loaded first via index.html).

const App = {
  session: null,
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
    // Carousel — arrow advances slides, dots show position, last slide swaps arrow for Begin
    let currentSlide = 0;
    const totalSlides = 3;
    const track  = document.getElementById("carousel-track");
    const arrow  = document.getElementById("carousel-arrow");
    const dots   = document.querySelectorAll(".carousel-dot");

    const advanceCarousel = () => {
      currentSlide++;
      track.style.transform = `translateX(-${currentSlide * 33.333}%)`;

      // Update dots
      dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));

      // On last slide: swap arrow for Begin text button
      if (currentSlide === totalSlides - 1) {
        arrow.outerHTML = `<button class="carousel-begin" id="carousel-arrow">Begin</button>`;
        document.getElementById("carousel-arrow").addEventListener("click", () => this.startConversation());
      }
    };

    if (arrow) {
      arrow.addEventListener("click", advanceCarousel);
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
  // suppressBubble: true when caller has already rendered the user message (e.g. button handler)
  sendMessage(text, suppressBubble = false) {
    if (this.isWaiting) return;
    this.isWaiting = true;

    UI.clearInput();
    UI.disableInput();

    const chatContainer = document.getElementById("chat-container");

    // Show user bubble (skip if caller already rendered it)
    if (!suppressBubble) {
      const userBubble = UI.createUserMessage(text);
      chatContainer.appendChild(userBubble);
      UI.scrollToMessage(userBubble);
    }

    // Show typing
    const typingEl = UI.createTypingIndicator();
    chatContainer.appendChild(typingEl);
    UI.showTyping();

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
    const body = { messages, session: this.session };

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
    if (data.session) this.session = data.session;

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
      // Ritual threshold: section break + question header before Phase 1 questions
      if (data.questionLabel) {
        const hr = document.createElement("hr");
        hr.className = "section-break";
        chatContainer.appendChild(hr);

        const header = document.createElement("div");
        header.className = "question-header";
        header.textContent = data.questionLabel;
        chatContainer.appendChild(header);
      }

      const isSynthesis = data.phase === "synthesis";
      const msgEl = UI.createAssistantMessage(data.message, isSynthesis);
      chatContainer.appendChild(msgEl);
      setTimeout(() => msgEl.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }

    // Option buttons (if inputMode is "buttons" and options provided)
    if (data.inputMode === "buttons" && data.options && data.options.length > 0) {
      this.currentOptions = data.options;
      const buttonsEl = UI.createOptionButtons(data.options, (id, text) => {
        // Show full option text in the chat bubble for context.
        // Send only the letter to the engine — prevents false multi-letter detection.
        const displayText = `${id.toUpperCase()}) ${text}`;
        const chatContainer = document.getElementById("chat-container");
        const userBubble = UI.createUserMessage(displayText);
        chatContainer.appendChild(userBubble);
        UI.scrollToMessage(userBubble);
        this.sendMessage(id.toUpperCase(), true); // suppressBubble — display bubble already rendered above
      });
      chatContainer.appendChild(buttonsEl);
      UI.scrollToMessage(buttonsEl);
    }

    // Welcome phase: show "I'm ready" button instead of text input
    if (data.phase === "welcome") {
      UI.setInputMode("none");
      const readyBtn = document.createElement("button");
      readyBtn.className = "btn-ready";
      readyBtn.textContent = "I'm ready";
      readyBtn.addEventListener("click", () => {
        readyBtn.remove();
        this.sendMessage("I'm ready", false);
      });
      chatContainer.appendChild(readyBtn);
      setTimeout(() => readyBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
      return;
    }

    // Set input mode
    if (data.complete) {
      UI.setInputMode("none");
    } else {
      UI.setInputMode(data.inputMode || "text");
    }

    // Auto-advance: synthesis delivered → fire Phase 4 after a pause
    if (data.autoAdvance) {
      const delay = data.advanceDelay || 6000;
      UI.setInputMode("none");
      setTimeout(async () => {
        try {
          const p4data = await this.callAPI([]);
          this.handleAPIResponse(p4data);
        } catch (e) {
          console.error("Phase 4 auto-advance error:", e);
        }
      }, delay);
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
