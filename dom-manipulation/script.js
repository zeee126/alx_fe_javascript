// Initialize quote list from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  {
    text: "Code is like humor. When you have to explain it, it’s bad.",
    category: "Programming",
  },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
];

// Show random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add quote from input
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();

    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both quote and category.");
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Failed to import: Invalid JSON.");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

// Load last quote on page load if it exists
window.onload = function () {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById(
      "quoteDisplay"
    ).innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
  }

  document
    .getElementById("newQuote")
    .addEventListener("click", showRandomQuote);
};
