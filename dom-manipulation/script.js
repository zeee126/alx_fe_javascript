const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

const quotes = [
  {
    text: "That which does not kill us makes us stronger.",
    category: "Motivational",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Inspirational",
  },
  {
    text: "Be the change that you wish to see in the world.",
    category: "Resilience",
  },
  {
    text: "The purpose of our lives is to be happy.",
    category: "Inspirational",
  },
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" - ${quote.category}`;
}

newQuoteBtn.addEventListener("click", showRandomQuote);

function createAddQuoteForm() {
  const form = document.createElement("form");
  form.id = "addQuoteForm";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter quote text";
  textInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const newQuote = {
      text: textInput.value,
      category: categoryInput.value,
    };
    quotes.push(newQuote);
    textInput.value = "";
    categoryInput.value = "";
    showRandomQuote();
  });

  document.body.appendChild(form);
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();
  if (newQuoteText && newQuoteCategory) {
    quotes.push({
      text: newQuoteText,
      category: newQuoteCategory,
    });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    // showRandomQuote();
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

const savedQuotes = JSON.parse(localStorage.getItem("quotes"));
if (savedQuotes) {
  quotes.push(...savedQuotes);
}

showRandomQuote();

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function populateCategories() {
  const categories = [...new Set(quotes.map((quote) => quote.category))];
  categories.forEach((category) => {
    const option = new Option(category, category);
    categoryFilter.add(option);
  });
  categoryFilter.value = selectedCategory;
}

// Function to filter quotes based on selected category
// window.filterQuotes = function() {
//     selectedCategory = categoryFilter.value;
//     localStorage.setItem('filteredCategory', selectedCategory);
//     showRandomQuote();
// }

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((quote) => quote.category === selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";
  filteredQuotes.forEach((quote) => {
    const quoteElement = document.createElement("div");
    quoteElement.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
    quoteDisplay.appendChild(quoteElement);
  });
  localStorage.setItem("selectedCategory", selectedCategory); // Save selected category
}

// Function to load the last viewed quote from session storage
function loadLastViewedQuote() {
  const lastViewedQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastViewedQuote) {
    const quote = JSON.parse(lastViewedQuote);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
  }
}

// Function to restore the last selected category from local storage
function restoreLastSelectedCategory() {
  const lastSelectedCategory = localStorage.getItem("selectedCategory");
  if (lastSelectedCategory) {
    document.getElementById("categoryFilter").value = lastSelectedCategory;
  }
}

// Function to fetch quotes from a server using a mock API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts"); // Replace with actual API URL
    const data = await response.json();
    quotes = data.map((item) => ({
      text: item.title,
      category: item.body.substring(0, 10),
    })); // Adapt mapping as necessary
    saveQuotes();
    populateCategoryFilter();
    filterQuotes();
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

// Function to post a new quote to a server using a mock API
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      // Replace with actual API URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// Function to sync quotes with the server and handle conflicts
async function syncQuotes() {
  try {
    await fetchQuotesFromServer();
    const serverQuotes = quotes;
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    // Simple conflict resolution: Server data overwrites local data
    if (serverQuotes.length > 0) {
      localStorage.setItem("quotes", JSON.stringify(serverQuotes));
      quotes = serverQuotes;
      alert("Quotes synced with server!");
      populateCategoryFilter();
      filterQuotes();
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Periodically sync quotes with the server
setInterval(syncQuotes, 60000); // Sync every minute

// Load quotes, setup category filter, restore last selected category, and display last viewed quote when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  restoreLastSelectedCategory();
  loadLastViewedQuote();
  document
    .getElementById("newQuote")
    .addEventListener("click", showRandomQuote);
});
