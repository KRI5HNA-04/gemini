document.addEventListener("DOMContentLoaded", function () {
  // Load sessions from local storage on page load
  loadSessions();

  document
    .getElementById("generateBtn")
    .addEventListener("click", generateContent);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document
    .getElementById("deleteAllBtnInPanel")
    .addEventListener("click", deleteAllSessions);

  // Set the theme to dark mode by default if no theme is set
  if (!document.body.hasAttribute("data-theme")) {
    document.body.setAttribute("data-theme", "dark");
  }
});

function generateContent() {
  const topic = document.getElementById("topic").value;
  const levelSlider = document.getElementById("levelSlider");
  const level = levelSlider.checked ? "advanced" : "beginner"; // Adjusted logic for checkbox
  const resultDiv = document.getElementById("result");
  const actionBtn = document.getElementById("generateBtn");

  if (topic.trim() === "") {
    alert("Please enter a topic.");
    return;
  }

  actionBtn.innerHTML = `<span id="buttonIcon" class="icon">&#9632;</span>`; // Stop icon
  stopTyping = false;

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
        let formattedResponse = data.response
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*/g, "")
          .replace(/##\s*(.*?)(\n|$)/g, "<h2>$1</h2>")
          .replace(/###\s*(.*?)(\n|$)/g, "<h3>$1</h3>")
          .replace(/\n/g, "<br>")
          .trim();

        resultDiv.innerHTML = "";
        typeContentWithHTML(resultDiv, formattedResponse);

        // Auto-generate and save session
        saveSession(topic, formattedResponse);
      }
    })
    .catch((error) => {
      resultDiv.innerHTML = `<strong>Error:</strong> Unable to generate content. Please try again later.`;
      console.error("Error:", error);
    })
    .finally(() => {
      actionBtn.innerHTML = `<span id="buttonIcon" class="icon"><i class="fa-solid fa-arrow-up"></i></span>`; // Up Arrow
    });
}

// Function to simulate typing effect
function typeContentWithHTML(element, content) {
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  let chars = Array.from(tempDiv.childNodes);

  let index = 0;
  const speed = 50;

  function typeLetter() {
    if (index < chars.length && !stopTyping) {
      element.appendChild(chars[index]);
      index++;
      setTimeout(typeLetter, speed);
    } else {
      document.getElementById(
        "generateBtn"
      ).innerHTML = `<span id="buttonIcon" class="icon"><i class="fa-solid fa-arrow-up"></i></span>`; // Up Arrow
    }
  }

  element.innerHTML = "";
  typeLetter();
}

// Save session to localStorage
function saveSession(topic, content) {
  const sessionData = {
    topic: topic,
    content: content,
    timestamp: new Date().toLocaleString(),
  };

  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  sessions.push(sessionData);
  localStorage.setItem("sessions", JSON.stringify(sessions));

  // Update session panel
  loadSessions();
}

// Load sessions from localStorage and display in the session panel
function loadSessions() {
  const sessionsPanel = document.getElementById("sessionsPanel");
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  sessionsPanel.innerHTML = ""; // Clear existing sessions

  if (sessions.length === 0) {
    sessionsPanel.innerHTML = `<p>No sessions available.</p>`;
    return;
  }

  sessions.forEach((session, index) => {
    const sessionElement = document.createElement("div");
    sessionElement.classList.add("session");
    sessionElement.innerHTML = `
      <strong>Topic:</strong> ${session.topic}<br>
      <strong>Date:</strong> ${session.timestamp}<br>
      <button class="loadSessionBtn" data-index="${index}">Load</button>
      <button class="deleteSessionBtn" data-index="${index}">Delete</button>
    `;
    sessionsPanel.appendChild(sessionElement);
  });

  // Add event listeners for load and delete buttons
  document
    .querySelectorAll(".loadSessionBtn")
    .forEach((btn) => btn.addEventListener("click", loadSession));
  document
    .querySelectorAll(".deleteSessionBtn")
    .forEach((btn) => btn.addEventListener("click", deleteSession));
}

// Load a session from localStorage
function loadSession(event) {
  const index = event.target.getAttribute("data-index");
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  const session = sessions[index];

  if (session) {
    document.getElementById("topic").value = session.topic;
    document.getElementById("result").innerHTML = session.content;
  }
}

// Delete a single session from localStorage
function deleteSession(event) {
  const index = event.target.getAttribute("data-index");
  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  sessions.splice(index, 1);
  localStorage.setItem("sessions", JSON.stringify(sessions));

  // Reload sessions
  loadSessions();
}

// Delete all sessions from localStorage
function deleteAllSessions() {
  if (confirm("Are you sure you want to delete all sessions?")) {
    localStorage.removeItem("sessions");
    loadSessions();
  }
}

// Toggle theme between dark and light mode
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  console.log(`Theme changed to: ${newTheme}`); // Debugging output
}
