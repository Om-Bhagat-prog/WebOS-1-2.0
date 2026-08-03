"use strict";

/* Window Controls */

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

/* Notes Application */

const notesTitle = 
    document.getElementById("notes-title");

const notesEditor = 
    document.getElementById("notes-editor");

const saveNoteButton =
    document.getElementById("save-note-button");

const clearNoteButton =
    document.getElementById("clear-note-button");

const notesStatus =
    document.getElementById("notes-status");

const NOTES_STORAGE_KEY = 
    "oms-webos-note";


function saveNote() {
    const note = {
        title: notesTitle.value,
        content: notesEditor.value
    };

    localStorage.setItem(
        NOTES_STORAGE_KEY,
        JSON.stringify(note)
    );

    notesStatus.textContent = 
    "Note saved";
}

function clearNote() {
    notesTitle.value = "";
    notesEditor.value = "";

    localStorage.removeItem(
        NOTES_STORAGE_KEY
    );

    notesStatus.textContent = 
        "Note cleared";
}

function loadSavedNote() {
    const savedNote =
        localStorage.getItem(
            NOTES_STORAGE_KEY
        );

        if (!savedNote) {
            return;
        }

        try {
            const note = 
                JSON.parse(savedNote);

            notesTitle.value =
                note.title || "";

            notesEditor.value =
                note.content || "";
        } catch (error) {
            console.error(
                "Could not load saved note.",
                error
            );

            localStorage.removeItem(
                NOTES_STORAGE_KEY
            );
        }
}

if (
    notesTitle &&
    notesEditor &&
    saveNoteButton &&
    clearNoteButton &&
    notesStatus
) {
    saveNoteButton.addEventListener(
        "click",
        saveNote
    );

    clearNoteButton.addEventListener(
        "click",
        clearNote
    );

    loadSavedNote();
}

