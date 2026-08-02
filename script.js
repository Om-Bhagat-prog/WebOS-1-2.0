"use strict";

const openWindowButtons =
    document.querySelectorAll("[data-open-window]");

const closeWindowButtons =
    document.querySelectorAll(".close-window-button");

openWindowButtons.forEach(button => {
    button.addEventListener("click", () => {
        const windowId = button.dataset.openWindow;
        const windowElement = 
        document.getElementById(windowId);

        if (windowElement) {
            windowElement.classList.remove("hidden");
        }
    });
});

closeWindowButtons.forEach(button => {
    button.addEventListener("click", () => {
        const windowElement =
            button.closest(".app-window");

        if (windowElement) {
            windowElement.classList.add("hidden");
        }
    });
});

const saveNoteButton =
    document.getElementById("save-note-button");

const clearNoteButton =
    document.getElementById("clear-note-button");

const noteTitle =
    document.getElementById("note-title");

const noteText =
    document.getElementById("note-text");

const notesMessage =
    document.getElementById("notes-message");

if (saveNoteButton) {
    saveNoteButton.addEventListener("click", () => {
        notesMessage.text = "Note saved.";
    });
}

if (clearNoteButton) {
    clearNoteButton.addEventListener("click", () => {
        noteTitle.value = "";
        noteText.value = "";
        notesMessage.textContent = "Note cleared.";
    });
}