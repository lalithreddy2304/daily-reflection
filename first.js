const form = document.getElementById("reflectionForm");
const entriesContainer = document.getElementById("entries");
const overallSummary = document.getElementById("overallSummary");
const exportBtn = document.getElementById("exportBtn");

const studyInput = document.getElementById("studyInput");
const distractionInput = document.getElementById("distractionInput");
const feelingInput = document.getElementById("feelingInput");

const studyCount = document.getElementById("studyCount");
const distractionCount = document.getElementById("distractionCount");

const themeToggle = document.getElementById("themeToggle");

let entries = JSON.parse(localStorage.getItem("reflections")) || [];
let editIndex = null;

/* counters */
studyInput.addEventListener("input", () => {
  studyCount.textContent = `${studyInput.value.length} characters`;
});

distractionInput.addEventListener("input", () => {
  distractionCount.textContent = `${distractionInput.value.length} characters`;
});

/* theme */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.add("light");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

/* submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    study: studyInput.value.trim(),
    distraction: distractionInput.value.trim(),
    feeling: feelingInput.value.trim(),
    date: new Date().toLocaleDateString()
  };

  if (!entry.study && !entry.distraction && !entry.feeling) return;

  if (editIndex !== null) {
    entries[editIndex] = entry;
    editIndex = null;
  } else {
    entries.unshift(entry);
  }

  localStorage.setItem("reflections", JSON.stringify(entries));
  form.reset();
  studyCount.textContent = "0 characters";
  distractionCount.textContent = "0 characters";

  render();
});

/* render */
function render() {
  entriesContainer.innerHTML = "";

  if (entries.length === 0) {
    entriesContainer.textContent = "No entries yet.";
    overallSummary.textContent = "No entries yet.";
    return;
  }

  entries.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    div.innerHTML = `
      <strong>${entry.date}</strong><br><br>
      <strong>Studied:</strong> ${entry.study || "—"}<br>
      <strong>Distractions:</strong> ${entry.distraction || "—"}<br>
      <strong>Day felt:</strong> ${entry.feeling || "—"}

      <div class="entry-actions">
        <button onclick="editEntry(${index})">Edit</button>
        <button class="delete" onclick="deleteEntry(${index})">Delete</button>
      </div>
    `;

    entriesContainer.appendChild(div);
  });

  renderSummary();
}

/* edit */
window.editEntry = function (index) {
  const entry = entries[index];
  studyInput.value = entry.study;
  distractionInput.value = entry.distraction;
  feelingInput.value = entry.feeling;
  editIndex = index;
};

/* delete */
window.deleteEntry = function (index) {
  entries.splice(index, 1);
  localStorage.setItem("reflections", JSON.stringify(entries));
  render();
};

/* summary */
function renderSummary() {
  const dates = entries.map(e => new Date(e.date));
  const first = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  overallSummary.textContent =
    `Entries: ${entries.length}. ` +
    `First entry: ${first.toLocaleDateString()}. ` +
    `Latest entry: ${latest.toLocaleDateString()}.`;
}

/* export */
exportBtn.addEventListener("click", () => {
  if (entries.length === 0) return;

  const text = entries.map(e =>
    `${e.date}
Studied: ${e.study}
Distractions: ${e.distraction}
Day felt: ${e.feeling}
-------------------`
  ).join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reflections.txt";
  a.click();

  URL.revokeObjectURL(url);
});

/* initial */
render();
