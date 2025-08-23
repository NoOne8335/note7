// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Smooth cursor effect with optimized performance
    const cursor = document.getElementById('cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let speed = 0.15;
    
    // Update cursor position with smooth animation
    function animateCursor() {
        // Calculate new position with easing
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * speed;
        cursorY += dy * speed;
        
        // Apply new position
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        // Continue animation
        requestAnimationFrame(animateCursor);
    }
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Start animation
    animateCursor();
    
    // Cursor interactions
    const interactiveElements = document.querySelectorAll('button, textarea, .note-card, .mode-toggle');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
        
        element.addEventListener('mousedown', () => {
            cursor.classList.add('click');
        });
        
        element.addEventListener('mouseup', () => {
            cursor.classList.remove('click');
        });
    });
    
    // Character counter
    const noteInput = document.getElementById('noteInput');
    const charCount = document.getElementById('charCount');
    
    noteInput.addEventListener('input', () => {
        const count = noteInput.value.length;
        charCount.textContent = `${count} characters`;
        
        if (count > 1000) {
            charCount.style.color = '#ff6b6b';
        } else {
            charCount.style.color = '';
        }
    });
    
    // Light/Dark mode toggle
    const modeToggle = document.getElementById('modeToggle');
    
    modeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        document.body.classList.toggle('dark');
        document.body.classList.toggle('light');
        modeToggle.textContent = isDark ? '◑' : '◐';
        modeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => (modeToggle.style.transform = ''), 100);
        
        // Save theme preference to localStorage
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        modeToggle.textContent = '◑';
    }
    
    // Toast notification function
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Note saving functionality
    document.getElementById('saveBtn').addEventListener('click', saveNote);
    
    // Function to save note to Firebase
    function saveNote() {
        const note = noteInput.value.trim();
        if (!note) {
            showToast("Note cannot be empty!");
            return;
        }
        
        // Add note to Firebase
        db.collection("notes").add({
            text: note,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: getUserId()
        })
        .then((docRef) => {
            showToast("Note saved successfully!");
            noteInput.value = '';
            charCount.textContent = '0 characters';
            
            // Load notes to refresh the list
            loadNotes();
        })
        .catch((error) => {
            console.error("Error adding note: ", error);
            showToast("Error saving note. Please try again.");
        });
    }
    
    // Function to load notes from Firebase
    function loadNotes() {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = ''; // Clear current notes
        
        db.collection("notes")
            .where("userId", "==", getUserId())
            .orderBy("timestamp", "desc")
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    // Show welcome message if no notes
                    notesList.innerHTML = `
                        <div class="note-card">
                            <p>Welcome to your new notepad! Start typing your thoughts above.</p>
                            <div class="note-date">Just now</div>
                            <button class="delete-btn" aria-label="Delete note">×</button>
                        </div>
                    `;
                    addDeleteListener(notesList.querySelector('.delete-btn'));
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const noteData = doc.data();
                    const noteCard = createNoteCard(doc.id, noteData.text, noteData.timestamp);
                    notesList.appendChild(noteCard);
                });
            })
            .catch((error) => {
                console.error("Error getting notes: ", error);
                showToast("Error loading notes.");
            });
    }
    
    // Function to create a note card element
    function createNoteCard(id, text, timestamp) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.setAttribute('data-id', id);
        
        // Format the date
        const date = timestamp ? timestamp.toDate() : new Date();
        const formattedDate = formatDate(date);
        
        noteCard.innerHTML = `
            <p>${text.replace(/\n/g, '<br>')}</p>
            <div class="note-date">${formattedDate}</div>
            <button class="delete-btn" aria-label="Delete note">×</button>
        `;
        
        // Add event listener to the delete button
        const deleteBtn = noteCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deleteNote(id, noteCard);
        });
        
        return noteCard;
    }
    
    // Function to format date
    function formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    // Function to delete a note
    function deleteNote(id, noteCard) {
        db.collection("notes").doc(id).delete()
            .then(() => {
                noteCard.style.opacity = '0';
                noteCard.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    noteCard.remove();
                    showToast("Note deleted!");
                }, 300);
            })
            .catch((error) => {
                console.error("Error removing note: ", error);
                showToast("Error deleting note. Please try again.");
            });
    }
    
    // Function to add delete listener to a button
    function addDeleteListener(button) {
        button.addEventListener('click', function() {
            const noteCard = this.parentElement;
            noteCard.style.opacity = '0';
            noteCard.style.transform = 'translateY(20px)';
            setTimeout(() => {
                noteCard.remove();
                showToast("Note deleted!");
            }, 300);
        });
    }
    
    // Initialize with dark mode if not set
    if (!document.body.classList.contains('light')) {
        document.body.classList.add('dark');
    }
    
    // Load notes when the app starts
    loadNotes();
}
