showPageError();
setupEditMarkDialog();
setupCreateCategoryDialog();
setupEditCategoryDialog();
setupDeleteMarkForms();
setupDeleteCategoryForms();

function showPageError() {
    const pageError = document.querySelector("[data-page-error]");
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
    const editMarkDialog = document.querySelector("[data-edit-mark-dialog]");
    const editMarkCancelButton = editMarkDialog.querySelector(
        'button[type="button"]',
    );

    document.querySelectorAll("[data-mark] [data-edit]").forEach(button => {
        button.addEventListener("click", () => openEditMarkDialog(button));
    });

    editMarkCancelButton.addEventListener("click", () => {
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
    categoryInput.value = categoryId;
    editMarkDialog.hidden = false;
    editMarkDialog.showModal();
    titleInput.focus();
}

function setupCreateCategoryDialog() {
    const createCategoryDialog = document.querySelector(
        "[data-create-category-dialog]",
    );
    const createCategoryNameInput = createCategoryDialog.querySelector(
        "[data-create-category-dialog-input-name]",
    );
    const createCategoryCancelButton = createCategoryDialog.querySelector(
        "[data-create-category-dialog-cancel]",
    );

    document
        .querySelector("[data-create-category]")
        .addEventListener("click", () => {
            createCategoryNameInput.value = "";
            createCategoryDialog.hidden = false;
            createCategoryDialog.showModal();
            createCategoryNameInput.focus();
        });

    createCategoryCancelButton.addEventListener("click", () => {
        createCategoryDialog.close();
    });

    createCategoryDialog.addEventListener("close", () => {
        createCategoryDialog.hidden = true;
    });
}

function setupEditCategoryDialog() {
    const editCategoryDialog = document.querySelector(
        "[data-edit-category-dialog]",
    );
    const editCategoryCancelButton = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-cancel]",
    );

    document
        .querySelectorAll("[data-category] [data-edit-category]")
        .forEach(button => {
            button.addEventListener("click", () =>
                openEditCategoryDialog(button),
            );
        });

    editCategoryCancelButton.addEventListener("click", () => {
        editCategoryDialog.close();
    });

    editCategoryDialog.addEventListener("close", () => {
        editCategoryDialog.hidden = true;
    });
}

function openEditCategoryDialog(button) {
    const editCategoryDialog = document.querySelector(
        "[data-edit-category-dialog]",
    );
    const editCategoryNameOutput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-name]",
    );
    const editCategoryNameInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-input-name]",
    );
    const editCategoryRenameIdInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-rename-id]",
    );
    const editCategoryDeleteIdInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-delete-id]",
    );
    const category = button.closest("[data-category]");
    const id = category.dataset.categoryId;
    const name = category.dataset.categoryName;

    editCategoryNameOutput.textContent = name;
    editCategoryNameInput.value = name;
    editCategoryRenameIdInput.value = id;
    editCategoryDeleteIdInput.value = id;
    editCategoryDialog.dataset.categoryName = name;
    editCategoryDialog.hidden = false;
    editCategoryDialog.showModal();
    editCategoryNameInput.focus();
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

function setupDeleteCategoryForms() {
    document.querySelectorAll("[data-delete-category-form]").forEach(form => {
        form.addEventListener("submit", event => {
            const category = form.closest("[data-category]");
            const dialog = form.closest("[data-edit-category-dialog]");
            const name =
                category?.dataset.categoryName ?? dialog?.dataset.categoryName;

            if (
                !confirm(
                    `Delete this Category?\n\n${name}\n\nIts Marks will move to Uncategorized Marks.`,
                )
            ) {
                event.preventDefault();
            }
        });
    });
}
