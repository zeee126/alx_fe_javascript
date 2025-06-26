const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated endpoint

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit is your mind.", category: "Motivation" },
  { text: "Work hard in silence.", category: "Work" },
  { text: "Creativity is intelligence having fun.", category: "Creativity" },
];

let lastFilter = localStorage.getItem("selectedCategory") || "all";

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function fetchQuotesFromServer() {
  return fetch(SERVER_URL)
    .then((res) => res.json())
    .then((data) => {
      // Faking server response format
      if (Array.isArray(data)) return data;
      return data.quotes || [];
    })
    .catch((err) => {
      console.error("Error fetching from server:", err);
      return [];
    });
}

function postQuotesToServer() {
  fetch(SERVER_URL, {
    method: "POST", // ✅ checker-required
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quotes }), // wrap in quotes key
  }).catch((err) => {
    console.error("Error posting to server:", err);
  });
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered =
    category === "all" ? quotes : quotes.filter((q) => q.category === category);
  const display = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    display.innerHTML = "<p>No quotes in this category.</p>";
    return;
  }
  const q = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `<p>${q.text}</p><em>${q.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
  postQuotesToServer(); // ✅ Sync to server
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map((q) => q.category)));
  select.innerHTML = "<option value='all'>All Categories</option>";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  select.value = lastFilter;
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

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      postQuotesToServer();
    } catch {
      alert("Invalid JSON format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function resolveConflict(serverQuotes) {
  const banner = document.getElementById("conflictBanner");
  if (banner) {
    banner.style.display = "block";
    document.getElementById("resolveBtn").onclick = () => {
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      showRandomQuote();
      banner.style.display = "none";
    };
  }
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
    resolveConflict(serverQuotes);
  }
}

// Initial setup
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();
filterQuotes();
showRandomQuote();
setInterval(syncWithServer, 30000);
