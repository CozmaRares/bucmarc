setupEditMarkDialog();

function setupEditMarkDialog() {
    const editMarkDialog = document.querySelector("[data-edit-mark-dialog]");

    if (!editMarkDialog) {
        return;
    }

    const editMarkCancelButton = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-cancel]",
    );

    document.querySelectorAll("[data-mark] [data-edit]").forEach(button => {
        button.addEventListener("click", () => openEditMarkDialog(button));
    });

    editMarkCancelButton?.addEventListener("click", () => {
        editMarkDialog.close();
    });

    editMarkDialog.addEventListener("close", () => {
        editMarkDialog.hidden = true;
    });
}

function openEditMarkDialog(button) {
    const editMarkDialog = document.querySelector("[data-edit-mark-dialog]");
    const urlOutput = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-url]",
    );
    const urlInput = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-input-url]",
    );
    const titleInput = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-input-title]",
    );
    const categoryInput = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-input-category]",
    );
    const mark = button.closest("[data-mark]");
    const url = mark.dataset.markUrl;
    const title = mark.dataset.markTitle;
    const categoryId = mark.dataset.markCategoryId;

    urlOutput.textContent = url;
    urlInput.value = url;
    titleInput.value = title;

    if (categoryInput) {
        categoryInput.value = categoryId;
    }

    editMarkDialog.hidden = false;
    editMarkDialog.showModal();
    titleInput.focus();
}
