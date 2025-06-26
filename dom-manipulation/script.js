const SERVER_URL = "https://jsonplaceholder.typicode.com/posts/1";

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit is your mind.", category: "Motivation" },
  { text: "Work hard in silence.", category: "Work" },
  { text: "Creativity is intelligence having fun.", category: "Creativity" },
];

let lastFilter = localStorage.getItem("selectedCategory") || "all";

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

async function fetchFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.quotes || [];
  } catch (e) {
    console.error("Fetch failed:", e);
    return [];
  }
}

async function postToServer() {
  try {
    await fetch(SERVER_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotes }),
    });
  } catch (e) {
    console.error("Post failed:", e);
  }
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered =
    category === "all" ? quotes : quotes.filter((q) => q.category === category);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML =
      "<p>No quotes available in this category.</p>";
    return;
  }

  const q = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `<p>${q.text}</p><em>${q.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
  awaitServerPost();
}

function populateCategories() {
  const cats = Array.from(new Set(quotes.map((q) => q.category)));
  const sel = document.getElementById("categoryFilter");
  sel.innerHTML = "<option value='all'>All Categories</option>";
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  sel.value = lastFilter;
}

function filterQuotes() {
  lastFilter = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", lastFilter);
  showRandomQuote();
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(e) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw new Error();
      quotes.push(...arr);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      awaitServerPost();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(e.target.files[0]);
}

function resolveConflict(serverQuotes) {
  document.getElementById("conflictBanner").style.display = "block";
  document.getElementById("resolveBtn").onclick = () => {
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();
    document.getElementById("conflictBanner").style.display = "none";
  };
}

async function syncWithServer() {
  const serverQ = await fetchFromServer();
  if (JSON.stringify(serverQ) !== JSON.stringify(quotes)) {
    resolveConflict(serverQ);
  }
}

async function awaitServerPost() {
  await postToServer();
}

// Init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();
filterQuotes();
showRandomQuote();
setInterval(syncWithServer, 30000);
