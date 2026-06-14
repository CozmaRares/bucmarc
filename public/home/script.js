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
const pageError = document.querySelector("[data-page-error]");

showPageError();
setupEditMarkDialog();
setupDeleteMarkForms();

function showPageError() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (!error) {
        return;
    }

    pageError.textContent = error;
    pageError.hidden = false;

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

function setupDeleteMarkForms() {
    document.querySelectorAll("[data-delete-mark-form]").forEach(form => {
        form.addEventListener("submit", event => {
            const mark = form.closest("[data-mark]");
            const url = mark.dataset.markUrl;

            if (!confirm(`Delete this Mark?\n\n${url}`)) {
                event.preventDefault();
            }
        });
    });
}
