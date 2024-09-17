document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("generateBtn")
    .addEventListener("click", generateContent);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // Set the theme to dark mode by default
  if (!document.body.hasAttribute("data-theme")) {
    document.body.setAttribute("data-theme", "dark");
  }
});

let stopTyping = false; // Control flag for stopping the typing effect

function generateContent() {
  const topic = document.getElementById("topic").value;
  const level = document.getElementById("level").value;
  const resultDiv = document.getElementById("result");
  const actionBtn = document.getElementById("generateBtn");
  const loadingIndicator = document.getElementById("loading");

  if (topic.trim() === "") {
    alert("Please enter a topic.");
    return;
  }

  //   // Show the loading indicator
  //   loadingIndicator.style.display = "flex";
  //   resultDiv.innerHTML = ""; // Clear previous results

  // Show the stop button and change the action button icon
  actionBtn.innerHTML = `<span id="buttonIcon" class="icon">&#9632;</span>`; // Square button icon

  // Reset the stopTyping flag in case it was set previously
  stopTyping = false;

  // Make a POST request to the Flask server
  fetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: topic,
      level: level,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        resultDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
      } else {
        // Process response text
        let formattedResponse = data.response
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
          .replace(/\*/g, "") // Remove any remaining stars
          .replace(/##\s*(.*?)(\n|$)/g, "<h2>$1</h2>") // Replace ## with <h2>
          .replace(/###\s*(.*?)(\n|$)/g, "<h3>$1</h3>") // Replace ### with <h3>
          .replace(/\n/g, "<br>") // Convert newlines to <br>
          .trim();

        // Clear previous content and loading spinner
        resultDiv.innerHTML = "";

        // Call the function to type out the content with HTML interpretation
        typeContentWithHTML(resultDiv, formattedResponse);
      }
    })
    .catch((error) => {
      resultDiv.innerHTML = `<strong>Error:</strong> Unable to generate content. Please try again later.`;
      console.error("Error:", error);
    })
    .finally(() => {
      // Hide the loading indicator
      loadingIndicator.style.display = "none";

      // Reset the action button icon to up arrow
      if (!stopTyping) {
        actionBtn.innerHTML = `<span id="buttonIcon" class="icon"><i class="fa-solid fa-arrow-up"></i></span>`; // Up Arrow
      }
    });
}

// Function to stop the content generation
function stopContentGeneration() {
  stopTyping = true; // Set the flag to stop typing
  document.getElementById(
    "generateBtn"
  ).innerHTML = `<span id="buttonIcon" class="icon"><i class="fa-solid fa-arrow-up"></i></span>`; // Up Arrow
}

// Function to generate letter-by-letter typing effect and interpret HTML
function typeContentWithHTML(element, content) {
  let tempDiv = document.createElement("div"); // Create a temporary div to hold the HTML
  tempDiv.innerHTML = content; // Inject the formatted content as HTML
  let chars = Array.from(tempDiv.childNodes); // Convert child nodes to an array for processing

  let index = 0;
  const speed = 50; // Typing speed in milliseconds

  function typeLetter() {
    if (index < chars.length && !stopTyping) {
      // Append the next character or HTML element to the resultDiv
      element.appendChild(chars[index]);
      index++;
      setTimeout(typeLetter, speed);
    } else {
      document.getElementById(
        "generateBtn"
      ).innerHTML = `<span id="buttonIcon" class="icon"><i class="fa-solid fa-arrow-up"></i></span>`; // Up Arrow
    }
  }

  // Clear previous content and start typing out the new content
  element.innerHTML = "";
  typeLetter();
}

// Function to toggle between light and dark themes
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
}
