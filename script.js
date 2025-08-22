import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const notesList = document.getElementById('notesList');

// Save Note
saveBtn.addEventListener('click', async () => {
  const note = noteInput.value.trim();
  if (!note) return alert("Note cannot be empty!");

  try {
    await addDoc(collection(db, "notes"), {
      text: note,
      createdAt: serverTimestamp()
    });
    noteInput.value = '';
  } catch (e) {
    console.error("Error adding note: ", e);
    alert("Failed to save note.");
  }
});

// Real-time listener for notes
const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  notesList.innerHTML = '';
  snapshot.forEach((doc) => {
    const noteData = doc.data();
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.innerHTML = `
      <p>${noteData.text.replace(/\n/g, '<br>')}</p>
      <button class="delete-btn" data-id="${doc.id}">×</button>
    `;
    notesList.appendChild(noteCard);
  });

  // Add delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await deleteDoc(doc(db, "notes", id));
    });
  });
});