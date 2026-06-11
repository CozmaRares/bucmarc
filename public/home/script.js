const editMarkDialog = document.querySelector("[data-edit-mark-dialog]");
const urlOutput = editMarkDialog.querySelector("[data-edit-mark-dialog-url]");
const urlInput = editMarkDialog.querySelector(
    "[data-edit-mark-dialog-input-url]",
);
const titleInput = editMarkDialog.querySelector(
    "[data-edit-mark-dialog-input-title]",
);
const categoryInput = editMarkDialog.querySelector(
    "[data-edit-mark-dialog-input-category]",
);
const cancelButton = editMarkDialog.querySelector('button[type="button"]');
const saveMarkError = document.querySelector("[data-save-mark-error]");

showSaveMarkError();
setupEditMarkDialog();
setupDeleteMarkButtons();

function showSaveMarkError() {
    const params = new URLSearchParams(window.location.search);

    const state = params.get("state");
    const url = params.get("url");

    if (!state || !url) {
        return;
    }

    let textContent;

    switch (state) {
        case "exists":
            textContent = `The URL could not be saved because it already exists: ${url}`;
            break;
        case "invalid":
            textContent = `The URL could not be saved because it is invalid: ${url}`;
        case "error":
            textContent = `The URL could not be saved: ${url}`;
        default:
            console.error(`Unknown state: ${state}`);
            break;
    }

    saveMarkError.textContent = textContent;
    saveMarkError.hidden = false;

    const nextUrl = new URL(window.location.href);
    nextUrl.search = new URLSearchParams().toString();
    window.history.replaceState(null, "", nextUrl);
}

function setupEditMarkDialog() {
    document.querySelectorAll("[data-mark] [data-edit]").forEach(button => {
        button.addEventListener("click", () => openEditMarkDialog(button));
    });

    cancelButton.addEventListener("click", () => {
        editMarkDialog.close();
    });

    editMarkDialog.addEventListener("close", () => {
        editMarkDialog.hidden = true;
    });
}

function openEditMarkDialog(button) {
    const mark = button.closest("[data-mark]");
    const url = mark.dataset.markUrl;
    const title = mark.dataset.markTitle;
    const categoryId = mark.dataset.markCategoryId;

    urlOutput.textContent = url;
    urlInput.value = url;
    titleInput.value = title;
    categoryInput.value = categoryId;
    editMarkDialog.hidden = false;
    editMarkDialog.showModal();
    titleInput.focus();
}

function setupDeleteMarkButtons() {
    document.querySelectorAll("[data-mark] [data-delete]").forEach(button => {
        button.addEventListener("click", () => deleteMark(button));
    });
}

async function deleteMark(button) {
    const mark = button.closest("[data-mark]");
    const url = mark.dataset.markUrl;

    if (!confirm(`Delete this Mark?\n\n${url}`)) {
        return;
    }

    button.setAttribute("disabled", "");

    const response = await fetch("/api/mark/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url }),
    });

    if (response.ok) {
        window.location.reload();
        return;
    }

    button.removeAttribute("disabled");
    alert("The Mark could not be deleted.");
}
