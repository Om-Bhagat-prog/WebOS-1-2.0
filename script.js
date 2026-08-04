"use strict";

/* Window Controls */

const desktop =
    document.getElementById("desktop");

const openWindowButtons =
    document.querySelectorAll(
        "[data-open-window]"
    );

const closeWindowButtons =
    document.querySelectorAll(
        ".close-window-button"
    );

openWindowButtons.forEach(button => {
    button.addEventListener("click", () => {
        const windowId = button.dataset.openWindow;
        const windowElement = 
        document.getElementById(windowId);

        if (windowElement) {
            windowElement.classList.remove("hidden");
            windowElement.dataset.minimized = "false";

            createTaskbarButton(windowElement);
            bringWindowToFront(windowElement);
        }}
    );
});

closeWindowButtons.forEach(button => {
    button.addEventListener("click", () => {
        const windowElement =
            button.closest(".app-window");

        if (windowElement) {
            windowElement.classList.add("hidden");
            windowElement.dataset.minimized = "false";

        const taskbarButton = 
            getTaskbarButton(windowElement.id);

        if (taskbarButton) {
            taskbarButton.remove();
        }
    }
    });
});

const minimizeWindowButtons =
    document.querySelectorAll(
        ".minimize-window-button"
    );

const taskbarApps =
    document.getElementById("taskbar-apps");

function getTaskbarButton(windowId) {
    return taskbarApps.querySelector(
        `[data-taskbar-window="${windowId}"]`
    );
}

function createTaskbarButton(windowElement) {
    const existingButton =
        getTaskbarButton(windowElement.id);

    if (existingButton) {
        return existingButton;
    }

    const button = 
        document.createElement("button");

    button.type = "button";
    button.className = "taskbar-app-button";

    button.dataset.taskbarWindow =
        windowElement.id;

    button.textContent =
        windowElement.dataset.appTitle ||
        "Application";

    button.addEventListener("click", () => {
        windowElement.classList.remove("hidden");
        windowElement.dataset.minimized = "false";

        bringWindowToFront(windowElement);
    });

    taskbarApps.appendChild(button);

    return button;
}

function  minimizeWindow(windowElement) {
    createTaskbarButton(windowElement);

    windowElement.classList.add("hidden");
    windowElement.dataset.minimized = "true";
}

minimizeWindowButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const windowElement =
            button.closest(".app-window");

        if (windowElement) {
            minimizeWindow(windowElement);
        }
    });
});



/* Draggable Windows */

const applicationWindows =
    document.querySelectorAll(".app-window");

const TASKBAR_HEIGHT = 60;
const WINDOW_EDGE_GAP = 8; 

let highestWindowZIndex = 20;

function bringWindowToFront(windowElement) {
    highestWindowZIndex += 1;

    windowElement.style.zIndex =
        highestWindowZIndex;
}

function getSafeWindowPosition(
    windowElement,
    proposedLeft,
    proposedTop
) {
    const desktopWidth =
        desktop.clientWidth;

    const desktopHeight =
        desktop.clientHeight;

    const windowWidth =
        windowElement.offsetWidth;

    const windowHeight =
        windowElement.offsetHeight;

    const minimumLeft =
        WINDOW_EDGE_GAP;

    const maximumLeft =
        desktopWidth -
        windowWidth -
        WINDOW_EDGE_GAP;

    const minimumTop =
        WINDOW_EDGE_GAP;

    const maximumTop =
        desktopHeight -
        TASKBAR_HEIGHT -
        windowHeight -
        WINDOW_EDGE_GAP;

    return {
        left: Math.min(
            Math.max(
                proposedLeft,
                minimumLeft
            ),
            Math.max(
                minimumLeft,
                maximumLeft
            )
        ),

        top: Math.min(
            Math.max(
                proposedTop,
                minimumTop
            ),
            Math.max(
                minimumTop,
                maximumTop
            )
        )
    };
}

function makeWindowDraggable(windowElement) {
    const dragHandle = 
        windowElement.querySelector(".drag-handle");

    if (!dragHandle) {
        return;
    }

    let isDragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let windowStartLeft = 0;
    let windowStartTop = 0;

    dragHandle.addEventListener(
        "pointerdown",
        (event) => {
            if (
                event.target.closest(
                    ".window-controls"
                )
            ) {
                return;
            }

            isDragging = true;

            pointerStartX = event.clientX;
            pointerStartY = event.clientY;

            windowStartLeft = 
                windowElement.offsetLeft;

            windowStartTop =
                windowElement.offsetTop;

            bringWindowToFront(windowElement);

            windowElement.classList.add(
                "dragging"
            );

            dragHandle.setPointerCapture(
                event.pointerId
            );
        }
    );

    dragHandle.addEventListener(
        "pointermove",
        (event) => {
            if (!isDragging) {
                return;
            }

            const distanceX =
                event.clientX - pointerStartX;

            const distanceY =
                event.clientY - pointerStartY;

            const newLeft = 
                windowStartLeft + distanceX;

            const newTop = 
                windowStartTop + distanceY;

            const safePosition =
                getSafeWindowPosition(
                    windowElement,
                    newLeft,
                    newTop
                );

            windowElement.style.left =
                `${safePosition.left}px`;

            windowElement.style.top =
                `${safePosition.top}px`;
        }
    );

        dragHandle.addEventListener(
            "pointerup",
            (event) => {
                if (!isDragging) {
                    return;
            }

            isDragging = false;

            windowElement.classList.remove(
                "dragging"
            );

            dragHandle.releasePointerCapture(
                event.pointerId
            );
        }
    );
}

applicationWindows.forEach(
    makeWindowDraggable
);

function keepWindowInsideDesktop(windowElement) {
    if (
        windowElement.classList.contains("hidden")
    ) {
        return;
    }

    const currentLeft =
        windowElement.offsetLeft;

    const currentTop =
        windowElement.offsetTop;

    const safePosition =
        getSafeWindowPosition(
            windowElement,
            currentLeft,
            currentTop
        );

    windowElement.style.left =
        `${safePosition.left}px`;

    windowElement.style.top =
        `${safePosition.top}px`;
}

function keepAllWindowsInsideDesktop() {
    applicationWindows.forEach(
        keepWindowInsideDesktop
    );
}

window.addEventListener(
    "resize",
    keepAllWindowsInsideDesktop
);

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

