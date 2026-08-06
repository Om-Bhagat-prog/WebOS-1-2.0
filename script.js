"use strict";

/* =========================================================
   Element references
   ========================================================= */

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

const minimizeWindowButtons =
    document.querySelectorAll(
        ".minimize-window-button"
    );

const maximizeWindowButtons =
    document.querySelectorAll(
        ".maximize-window-button"
    );

const applicationWindows =
    document.querySelectorAll(
        ".app-window"
    );

const taskbarApps =
    document.getElementById(
        "taskbar-apps"
    );

/* =========================================================
   Window state
   ========================================================= */

const TASKBAR_HEIGHT = 60;
const WINDOW_EDGE_GAP = 8;

let highestWindowZIndex = 20;

const normalWindowStates =
    new Map();

/* =========================================================
   Window stacking
   ========================================================= */

function bringWindowToFront(
    windowElement
) {
    highestWindowZIndex += 1;

    windowElement.style.zIndex =
        String(highestWindowZIndex);
}

/* =========================================================
   Taskbar buttons
   ========================================================= */

function getTaskbarButton(windowId) {
    return taskbarApps.querySelector(
        `[data-taskbar-window="${windowId}"]`
    );
}

function createTaskbarButton(
    windowElement
) {
    const existingButton =
        getTaskbarButton(
            windowElement.id
        );

    if (existingButton) {
        return existingButton;
    }

    const button =
        document.createElement(
            "button"
        );

    button.type = "button";

    button.className =
        "taskbar-app-button";

    button.dataset.taskbarWindow =
        windowElement.id;

    button.textContent =
        windowElement.dataset.appTitle ||
        "Application";

    button.addEventListener(
        "click",
        () => {
            windowElement.classList.remove(
                "hidden"
            );

            windowElement.dataset.minimized =
                "false";

            bringWindowToFront(
                windowElement
            );
        }
    );

    taskbarApps.appendChild(button);

    return button;
}

/* =========================================================
   Open windows
   ========================================================= */

openWindowButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                const windowId =
                    button.dataset.openWindow;

                const windowElement =
                    document.getElementById(
                        windowId
                    );

                if (!windowElement) {
                    return;
                }

                windowElement.classList.remove(
                    "hidden"
                );

                windowElement.dataset.minimized =
                    "false";

                createTaskbarButton(
                    windowElement
                );

                bringWindowToFront(
                    windowElement
                );
            }
        );
    }
);

/* =========================================================
   Close windows
   ========================================================= */

closeWindowButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                const windowElement =
                    button.closest(
                        ".app-window"
                    );

                if (!windowElement) {
                    return;
                }

                windowElement.classList.add(
                    "hidden"
                );

                windowElement.classList.remove(
                    "maximized",
                    "dragging"
                );

                windowElement.dataset.minimized =
                    "false";

                windowElement.dataset.maximized =
                    "false";

                normalWindowStates.delete(
                    windowElement.id
                );

                updateMaximizeButton(
                    windowElement,
                    false
                );

                const taskbarButton =
                    getTaskbarButton(
                        windowElement.id
                    );

                if (taskbarButton) {
                    taskbarButton.remove();
                }
            }
        );
    }
);

/* =========================================================
   Minimize windows
   ========================================================= */

function minimizeWindow(
    windowElement
) {
    createTaskbarButton(
        windowElement
    );

    windowElement.classList.add(
        "hidden"
    );

    windowElement.dataset.minimized =
        "true";
}

minimizeWindowButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                const windowElement =
                    button.closest(
                        ".app-window"
                    );

                if (!windowElement) {
                    return;
                }

                minimizeWindow(
                    windowElement
                );
            }
        );
    }
);

/* =========================================================
   Safe window position
   ========================================================= */

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
        Math.max(
            minimumLeft,
            desktopWidth -
                windowWidth -
                WINDOW_EDGE_GAP
        );

    const minimumTop =
        WINDOW_EDGE_GAP;

    const maximumTop =
        Math.max(
            minimumTop,
            desktopHeight -
                TASKBAR_HEIGHT -
                windowHeight -
                WINDOW_EDGE_GAP
        );

    return {
        left: Math.min(
            Math.max(
                proposedLeft,
                minimumLeft
            ),
            maximumLeft
        ),

        top: Math.min(
            Math.max(
                proposedTop,
                minimumTop
            ),
            maximumTop
        )
    };
}

/* =========================================================
   Maximize and restore
   ========================================================= */

function saveNormalWindowState(
    windowElement
) {
    normalWindowStates.set(
        windowElement.id,
        {
            left:
                windowElement.offsetLeft,

            top:
                windowElement.offsetTop,

            width:
                windowElement.offsetWidth,

            height:
                windowElement.offsetHeight
        }
    );
}

function updateMaximizeButton(
    windowElement,
    isMaximized
) {
    const button =
        windowElement.querySelector(
            ".maximize-window-button"
        );

    if (!button) {
        return;
    }

    const appTitle =
        windowElement.dataset.appTitle ||
        "Application";

    if (isMaximized) {
        button.textContent = "❐";

        button.setAttribute(
            "aria-label",
            `Restore ${appTitle} window`
        );

        return;
    }

    button.textContent = "□";

    button.setAttribute(
        "aria-label",
        `Maximize ${appTitle} window`
    );
}

function maximizeWindow(
    windowElement
) {
    if (
        windowElement.dataset.maximized ===
        "true"
    ) {
        return;
    }

    saveNormalWindowState(
        windowElement
    );

    windowElement.classList.add(
        "maximized"
    );

    windowElement.dataset.maximized =
        "true";

    updateMaximizeButton(
        windowElement,
        true
    );

    bringWindowToFront(
        windowElement
    );
}

function restoreWindow(
    windowElement
) {
    const savedState =
        normalWindowStates.get(
            windowElement.id
        );

    windowElement.classList.remove(
        "maximized"
    );

    windowElement.dataset.maximized =
        "false";

    if (savedState) {
        windowElement.style.left =
            `${savedState.left}px`;

        windowElement.style.top =
            `${savedState.top}px`;

        windowElement.style.width =
            `${savedState.width}px`;

        windowElement.style.height =
            `${savedState.height}px`;
    }

    normalWindowStates.delete(
        windowElement.id
    );

    updateMaximizeButton(
        windowElement,
        false
    );

    keepWindowInsideDesktop(
        windowElement
    );

    bringWindowToFront(
        windowElement
    );
}

function toggleMaximizeWindow(
    windowElement
) {
    if (
        windowElement.dataset.maximized ===
        "true"
    ) {
        restoreWindow(
            windowElement
        );

        return;
    }

    maximizeWindow(
        windowElement
    );
}

maximizeWindowButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                const windowElement =
                    button.closest(
                        ".app-window"
                    );

                if (!windowElement) {
                    return;
                }

                toggleMaximizeWindow(
                    windowElement
                );
            }
        );
    }
);

/* =========================================================
   Draggable windows
   ========================================================= */

function makeWindowDraggable(
    windowElement
) {
    const dragHandle =
        windowElement.querySelector(
            ".drag-handle"
        );

    if (!dragHandle) {
        return;
    }

    let isDragging = false;

    let pointerStartX = 0;
    let pointerStartY = 0;

    let windowStartLeft = 0;
    let windowStartTop = 0;

    function stopDragging(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;

        windowElement.classList.remove(
            "dragging"
        );

        if (
            dragHandle.hasPointerCapture(
                event.pointerId
            )
        ) {
            dragHandle.releasePointerCapture(
                event.pointerId
            );
        }
    }

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

            if (
                windowElement.dataset.maximized ===
                "true"
            ) {
                return;
            }

            isDragging = true;

            pointerStartX =
                event.clientX;

            pointerStartY =
                event.clientY;

            windowStartLeft =
                windowElement.offsetLeft;

            windowStartTop =
                windowElement.offsetTop;

            bringWindowToFront(
                windowElement
            );

            windowElement.classList.add(
                "dragging"
            );

            dragHandle.setPointerCapture(
                event.pointerId
            );

            event.preventDefault();
        }
    );

    dragHandle.addEventListener(
        "pointermove",
        (event) => {
            if (!isDragging) {
                return;
            }

            const proposedLeft =
                windowStartLeft +
                event.clientX -
                pointerStartX;

            const proposedTop =
                windowStartTop +
                event.clientY -
                pointerStartY;

            const safePosition =
                getSafeWindowPosition(
                    windowElement,
                    proposedLeft,
                    proposedTop
                );

            windowElement.style.left =
                `${safePosition.left}px`;

            windowElement.style.top =
                `${safePosition.top}px`;
        }
    );

    dragHandle.addEventListener(
        "pointerup",
        stopDragging
    );

    dragHandle.addEventListener(
        "pointercancel",
        stopDragging
    );
}

applicationWindows.forEach(
    makeWindowDraggable
);

/* =========================================================
   Browser resize protection
   ========================================================= */

function keepWindowInsideDesktop(
    windowElement
) {
    if (
        windowElement.classList.contains(
            "hidden"
        )
    ) {
        return;
    }

    if (
        windowElement.dataset.maximized ===
        "true"
    ) {
        return;
    }

    const safePosition =
        getSafeWindowPosition(
            windowElement,
            windowElement.offsetLeft,
            windowElement.offsetTop
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

/* =========================================================
   Notes application
   ========================================================= */

const notesTitle =
    document.getElementById(
        "notes-title"
    );

const notesEditor =
    document.getElementById(
        "notes-editor"
    );

const saveNoteButton =
    document.getElementById(
        "save-note-button"
    );

const clearNoteButton =
    document.getElementById(
        "clear-note-button"
    );

const notesStatus =
    document.getElementById(
        "notes-status"
    );

const NOTES_STORAGE_KEY =
    "oms-webos-note";

function saveNote() {
    const note = {
        title:
            notesTitle.value,

        content:
            notesEditor.value
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

/* =========================================================
   Nature application
   ========================================================= */

const natureCheckboxes = 
    document.querySelectorAll(
        ".nature-checkbox"
    );

const natureProgress = 
    document.getElementById(
        "nature-progress"
    );

const resetNatureButton = 
    document.getElementById(
        "reset-nature-button"
    );

const NATURE_STORAGE_KEY = 
    "oms-webos-nature-progress";

function updateNatureProgress() {
    const completedCount = 
        Array.from(natureCheckboxes)
        .filter(
            (checkbox) =>
                checkbox.checked
        )
        .length;

    if (!natureProgress) {
        return;
    }

    natureProgress.textContent = 
        `${completedCount} of ` +
        `${natureCheckboxes.length} ` +
        "challenges completed";
}

function saveNatureProgress() {
    const progress = {};

    natureCheckboxes.forEach(
    (checkbox) => {
        progress[checkbox.id] = 
            checkbox.checked;
        }
    );

    localStorage.setItem(
        NATURE_STORAGE_KEY,
        JSON.stringify(progress)
    );
}

function loadNatureProgress() {
    const savedProgress = 
        localStorage.getItem(
            NATURE_STORAGE_KEY
        );

    if (!savedProgress) {
        updateNatureProgress();
        return;
    }

    try {
        const progress = 
            JSON.parse(savedProgress);

        natureCheckboxes.forEach(
            (checkbox) => {
                checkbox.checked = 
                    progress[checkbox.id] ||
                    false;
                }
            );
        } catch (error) {
            console.error(
            "Could not load Nature progress.",
            error
            );

            localStorage.removeItem(
                NATURE_STORAGE_KEY
            );
        }

        updateNatureProgress();
    }

    function resetNatureProgress() {
        natureCheckboxes.forEach(
            (checkbox) => {
                checkbox.checked = false;
            }
        );

        localStorage.removeItem(
            NATURE_STORAGE_KEY
        );

        updateNatureProgress();
    }

    natureCheckboxes.forEach(
        (checkbox) => {
            checkbox.addEventListener(
                "change",
                () => {
                    updateNatureProgress();
                    saveNatureProgress();
                }
            );
        }
    );

    if (resetNatureButton) {
        resetNatureButton.addEventListener(
            "click",
            resetNatureProgress
        );
    }
loadNatureProgress();