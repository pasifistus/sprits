const STORAGE_KEY = "sprits-tonight";

function tonightKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: tonightKey(), people: [] };

    const state = JSON.parse(raw);
    if (!state || typeof state !== "object") return { date: tonightKey(), people: [] };
    if (state.date !== tonightKey()) return { date: tonightKey(), people: [] };
    if (!Array.isArray(state.people)) return { date: tonightKey(), people: [] };

    return state;
  } catch {
    return { date: tonightKey(), people: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();
const list = document.getElementById("people-list");
const form = document.getElementById("add-name-form");
const input = document.getElementById("name-input");
const resetButton = document.getElementById("reset-tonight");

function render() {
  list.innerHTML = "";

  state.people
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((person) => {
      const item = document.createElement("li");
      item.className = "person";

      const name = document.createElement("span");
      name.textContent = person.name;

      const count = document.createElement("span");
      count.className = "count";
      count.textContent = person.count;

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.textContent = "+1";
      addButton.addEventListener("click", () => {
        person.count += 1;
        saveState(state);
        render();
      });

      item.append(name, count, addButton);
      list.append(item);
    });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = input.value.trim();
  if (!name) return;

  const existing = state.people.find(
    (person) => person.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    existing.count += 1;
  } else {
    state.people.push({ name, count: 1 });
  }

  saveState(state);
  input.value = "";
  render();
});

resetButton.addEventListener("click", () => {
  state.date = tonightKey();
  state.people = [];
  saveState(state);
  render();
});

render();
