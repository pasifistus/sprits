const STORAGE_KEY = "sprits-tonight";

const today = new Date().toISOString().slice(0, 10);

const addPersonForm = document.getElementById("add-person-form");
const nameInput = document.getElementById("name-input");
const peopleList = document.getElementById("people-list");
const status = document.getElementById("status");

let state = loadState();

render();

addPersonForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  if (!name) {
    setStatus("Please enter a name.");
    return;
  }

  const duplicate = state.people.find(
    (person) => person.name.toLowerCase() === name.toLowerCase(),
  );

  if (duplicate) {
    setStatus(`${duplicate.name} is already on the list.`);
    nameInput.value = "";
    nameInput.focus();
    return;
  }

  state.people.push({ name, drinks: 0 });
  saveState();
  render();
  setStatus(`Added ${name}.`);
  nameInput.value = "";
  nameInput.focus();
});

peopleList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const person = state.people[index];
  if (!person) {
    return;
  }

  person.drinks += 1;
  saveState();
  render();
  setStatus(`${person.name} now has ${person.drinks} drink${person.drinks === 1 ? "" : "s"}.`);
});

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createEmptyState();
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.date === today &&
      Array.isArray(parsed.people)
    ) {
      return {
        date: parsed.date,
        people: parsed.people
          .filter((person) => person && typeof person.name === "string")
          .map((person) => ({
            name: person.name.trim(),
            drinks: Number.isInteger(person.drinks) && person.drinks > 0 ? person.drinks : 0,
          }))
          .filter((person) => person.name.length > 0),
      };
    }
  } catch (_error) {
    // Fall through to reset invalid data.
  }

  return createEmptyState();
}

function createEmptyState() {
  return {
    date: today,
    people: [],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  peopleList.innerHTML = "";

  if (state.people.length === 0) {
    const empty = document.createElement("li");
    empty.className = "person";
    empty.innerHTML = `
      <span class="name">No names yet</span>
      <span class="count">0</span>
      <button type="button" disabled>Add drink</button>
    `;
    peopleList.appendChild(empty);
    return;
  }

  state.people.forEach((person, index) => {
    const item = document.createElement("li");
    item.className = "person";
    item.innerHTML = `
      <span class="name">${escapeHtml(person.name)}</span>
      <span class="count">${person.drinks}</span>
      <button type="button" data-index="${index}">+1 drink</button>
    `;
    peopleList.appendChild(item);
  });
}

function setStatus(message) {
  status.textContent = message;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
