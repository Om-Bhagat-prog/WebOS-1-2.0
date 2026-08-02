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