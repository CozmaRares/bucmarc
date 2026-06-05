const reloadPage = () => {
    window.location.reload();
};

const params = new URLSearchParams(window.location.search);
const state = params.get("state");
const url = params.get("url");

const statusMessage = document.querySelector("[data-status-message]");
const markList = document.querySelector("[data-mark-list]");

const editMark = () => {
    reloadPage();
};

const deleteMark = async url => {
    await fetch("/api/mark/delete/" + encodeURIComponent(url), {
        method: "DELETE",
    });

    reloadPage();
};

const renderCaptureState = () => {
    if (!(statusMessage instanceof HTMLElement)) {
        return;
    }

    if (state === "exists" && url) {
        statusMessage.textContent = `Mark already exists: ${url}`;
        return;
    }

    if (state === "invalid" && url) {
        statusMessage.textContent = `Invalid URL: ${url}`;
        return;
    }

    if (state === "error") {
        statusMessage.textContent = "Could not save mark.";
        return;
    }

    statusMessage.remove();
};

const highlightExistingMark = () => {
    if (!url || !(markList instanceof HTMLElement)) {
        return;
    }

    const markItem = markList.querySelector(
        `[data-mark-item="${CSS.escape(url)}"]`,
    );

    if (!(markItem instanceof HTMLElement)) {
        return;
    }

    const existingLabel = markItem.querySelector("[data-existing-mark]");

    if (existingLabel instanceof HTMLElement) {
        existingLabel.hidden = false;
    }

    markList.prepend(markItem);
};

renderCaptureState();
highlightExistingMark();

document.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
        editMark();
    });
});

document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
        const url = button.getAttribute("data-delete");

        if (!url) {
            return;
        }

        void deleteMark(url);
    });
});
