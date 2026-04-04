// Storage service voor localStorage operaties

// Toetsen
export const getToetsen = () => {
  const data = localStorage.getItem("toetsen");
  return data ? JSON.parse(data) : [];
};

export const addToets = (toets) => {
  const toetsen = getToetsen();
  toetsen.push(toets);
  localStorage.setItem("toetsen", JSON.stringify(toetsen));
};

export const updateToets = (id, updatedToets) => {
  const toetsen = getToetsen();
  const index = toetsen.findIndex((t) => t.id === id);
  if (index !== -1) {
    toetsen[index] = { ...toetsen[index], ...updatedToets };
    localStorage.setItem("toetsen", JSON.stringify(toetsen));
  }
};

export const deleteToets = (id) => {
  const toetsen = getToetsen();
  const filtered = toetsen.filter((t) => t.id !== id);
  localStorage.setItem("toetsen", JSON.stringify(filtered));
};

// Groepen
export const getGroepen = () => {
  const data = localStorage.getItem("groepen");
  return data ? JSON.parse(data) : [];
};

export const addGroep = (groep) => {
  const groepen = getGroepen();
  groepen.push(groep);
  localStorage.setItem("groepen", JSON.stringify(groepen));
};

export const updateGroep = (id, updatedGroep) => {
  const groepen = getGroepen();
  const index = groepen.findIndex((g) => g.id === id);
  if (index !== -1) {
    groepen[index] = { ...groepen[index], ...updatedGroep };
    localStorage.setItem("groepen", JSON.stringify(groepen));
  }
};

export const deleteGroep = (id) => {
  const groepen = getGroepen();
  const filtered = groepen.filter((g) => g.id !== id);
  localStorage.setItem("groepen", JSON.stringify(filtered));
};

// Gebruikers
export const getUsers = () => {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
};

// Toewijzingen
export const getToewijzingen = () => {
  const data = localStorage.getItem("toewijzingen");
  return data ? JSON.parse(data) : [];
};

export const addToewijzing = (toewijzing) => {
  const toewijzingen = getToewijzingen();
  toewijzingen.push(toewijzing);
  localStorage.setItem("toewijzingen", JSON.stringify(toewijzingen));
};

// Helper
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
