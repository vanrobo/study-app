let allCards = [];
const views = ["dashboard", "add", "library", "settings"];

// --- INITIALIZATION ---
async function init() {
  // Load Settings
  const settings = await window.api.getSettings();
  document.documentElement.style.setProperty("--accent", settings.theme);

  // Load Data
  allCards = await window.api.getCards();
  renderDashboard();
  populateSubjects();
}

// --- NAVIGATION ---
window.nav = (viewId) => {
  // Update UI Sidebar
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  // This is a rough way to highlight sidebar, better to use IDs
  if (viewId === "dashboard")
    document.querySelectorAll(".nav-item")[0].classList.add("active");
  if (viewId === "add")
    document.querySelectorAll(".nav-item")[1].classList.add("active");
  if (viewId === "library")
    document.querySelectorAll(".nav-item")[2].classList.add("active");
  if (viewId === "settings")
    document.querySelectorAll(".nav-item")[3].classList.add("active");

  // Switch View
  views.forEach((v) =>
    document.getElementById(`view-${v}`).classList.add("hidden"),
  );
  document.getElementById(`view-${viewId}`).classList.remove("hidden");

  // Trigger Renders
  if (viewId === "dashboard") renderDashboard();
  if (viewId === "library") renderLibrary();
};

// --- CORE LOGIC: DASHBOARD ---
function renderDashboard() {
  const container = document.getElementById("due-container");
  container.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  const due = allCards.filter((c) => c.nextReview <= today);

  if (due.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px; color:var(--text-med)">
        <h2>🎉 All Caught Up!</h2>
        <p>No cards due today. Go <a href="#" style="color:var(--accent)" onclick="nav('add')">add some more</a>.</p>
      </div>`;
    return;
  }

  due.forEach((card) => {
    const div = document.createElement("div");
    div.className = "task-card";
    div.innerHTML = `
      <div class="task-info">
        <h3>${card.topic}</h3>
        <p>${card.subject}</p>
      </div>
      <div class="rating-container">
        <div class="rate-box" onclick="rate('${card.id}', 1)">1</div>
        <div class="rate-box" onclick="rate('${card.id}', 2)">2</div>
        <div class="rate-box" onclick="rate('${card.id}', 3)">3</div>
        <div class="rate-box" onclick="rate('${card.id}', 4)">4</div>
        <div class="rate-box" onclick="rate('${card.id}', 5)">5</div>
      </div>
    `;
    container.appendChild(div);
  });
}

window.rate = async (id, rating) => {
  const card = allCards.find((c) => c.id === id);
  if (!card) return;

  // --- 1. CALCULATE EASE FACTOR (The "Difficulty" Speed) ---
  // Default starts at 2.5.
  // If you rate 5, Ease increases (Intervals grow faster).
  // If you rate 1-3, Ease drops (Intervals grow slower).
  let oldEase = card.easeFactor || 2.5;
  let newEase = oldEase + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

  // Prevent Ease from dropping below 1.3 (Review Hell Prevention #1)
  // If it gets too low, you'll see the card every day forever. 1.3 ensures at least 30% growth.
  if (newEase < 1.3) newEase = 1.3;

  // --- 2. CALCULATE INTERVAL (Days until next review) ---
  let newInterval = 1;
  let previousInterval = card.interval || 0;

  if (rating < 3) {
    // Rating 1-2: FAILURE.
    // Reset progress, but keep Ease Factor somewhat intact so you don't start from zero speed.
    newInterval = 1;
  } else {
    // Rating 3-5: PASS.
    if (previousInterval === 0) {
      newInterval = 1;
    } else if (previousInterval === 1) {
      // Second successful review:
      // If 3 (Hard), give 2 days (breathing room).
      // If 4 (Good), give 3 days.
      // If 5 (Easy), give 6 days.
      if (rating === 3) newInterval = 2;
      else if (rating === 4) newInterval = 3;
      else newInterval = 6;
    } else {
      // Third+ review: EXPONENTIAL GROWTH
      // Interval = Previous * EaseFactor
      // Example: 6 days * 2.5 = 15 days.
      // Example: 15 days * 2.5 = 38 days.
      let multiplier = newEase;

      // Review Hell Prevention #2: "Hard" Penalty
      // If you rated it "Hard" (3), we lower the multiplier specifically for this turn
      // so it doesn't fly away too fast, but it DOES move forward (e.g. 1.2x instead of 2.5x).
      if (rating === 3) multiplier = 1.2;

      newInterval = Math.ceil(previousInterval * multiplier);
    }
  }

  // --- 3. APPLY UPDATE ---
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  // Update Card Data
  card.interval = newInterval;
  card.easeFactor = newEase;
  card.nextReview = nextDate.toISOString().split("T")[0];

  // Update Visual Status
  if (rating <= 3)
    card.status = "learning"; // Yellow
  else if (rating === 4)
    card.status = "reviewing"; // Blue-ish
  else card.status = "mastered"; // Green

  await window.api.updateCard(card);
  renderDashboard();
};

// --- CORE LOGIC: ADDING ---
window.saveCard = async () => {
  const subject = document.getElementById("inp-subject").value;
  const topic = document.getElementById("inp-topic").value;

  if (!subject || !topic) return;

  const newCard = {
    id: crypto.randomUUID(),
    subject,
    topic,
    status: "new",
    interval: 0,
    nextReview: new Date().toISOString().split("T")[0], // Due Today
  };

  await window.api.addCard(newCard);
  allCards.push(newCard);

  // Clear inputs
  document.getElementById("inp-topic").value = "";
  document.getElementById("inp-subject").focus();

  // Notification (Simple alert for now)
  // alert('Added to library!');
  populateSubjects();
};

function populateSubjects() {
  const subjects = [...new Set(allCards.map((c) => c.subject))];
  const dl = document.getElementById("subject-list");
  dl.innerHTML = subjects.map((s) => `<option value="${s}">`).join("");
}

// --- UI: LIBRARY RENDER ---
function renderLibrary() {
  const tbody = document.getElementById("lib-body");
  const filter = document.getElementById("search-bar").value.toLowerCase();

  tbody.innerHTML = "";

  const filtered = allCards.filter(
    (c) =>
      c.topic.toLowerCase().includes(filter) ||
      c.subject.toLowerCase().includes(filter),
  );

  filtered.forEach((card) => {
    const tr = document.createElement("tr");

    // Status Color Logic
    let statusColor = "#a1a1aa"; // default gray
    if (card.status === "mastered") statusColor = "#22c55e";
    if (card.status === "learning") statusColor = "#eab308";

    tr.innerHTML = `
      <td><span class="subject-tag">${card.subject}</span></td>
      <td style="font-weight:600; font-size:15px;">${card.topic}</td>
      <td style="color:${statusColor}; text-transform:capitalize;">${card.status}</td>
      <td style="color:var(--text-med); font-variant-numeric: tabular-nums;">${card.nextReview}</td>
      <td>
        <button class="btn-icon-danger" onclick="deleteItem('${card.id}')" title="Delete Card">
          <!-- SVG TRASH ICON -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- MODAL & DELETE LOGIC ---
let itemToDelete = null; // Store ID temporarily

window.deleteItem = (id) => {
  itemToDelete = id;
  // Show the modal
  document.getElementById("modal-overlay").classList.remove("hidden");
};

window.closeModal = () => {
  itemToDelete = null;
  document.getElementById("modal-overlay").classList.add("hidden");
};

window.confirmDelete = async () => {
  if (itemToDelete) {
    await window.api.deleteCard(itemToDelete);

    // Remove from local array
    allCards = allCards.filter((c) => c.id !== itemToDelete);

    // Refresh UI
    renderLibrary();
    closeModal();
  }
};

// --- SETTINGS (THEME FIX) ---

// Helper: Convert Hex (#8b5cf6) to RGB (139, 92, 246)
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

window.setTheme = async (colorHex) => {
  const root = document.documentElement;
  const colorRgb = hexToRgb(colorHex);

  // Set BOTH variables: The solid color and the RGB numbers for transparency
  root.style.setProperty("--accent", colorHex);
  root.style.setProperty("--accent-rgb", colorRgb);

  await window.api.saveSettings({ theme: colorHex });
};

// Update Init to load themes correctly
async function init() {
  const settings = await window.api.getSettings();

  if (settings.theme) {
    // Apply saved theme immediately
    setTheme(settings.theme);
  }

  allCards = await window.api.getCards();
  renderDashboard();
  populateSubjects();
}

// Start
init();
