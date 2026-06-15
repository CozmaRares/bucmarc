showPageBanner();
setupCreateCategoryDialog();
setupEditCategoryDialog();
setupDeleteMarkForms();
setupDeleteCategoryForms();

function showPageBanner() {
    const pageBanner = document.querySelector("[data-page-banner]");
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    const status = params.get("status");

    if (!message || !status) {
        return;
    }

    pageBanner.textContent = message;
    pageBanner.dataset.pageStatus = status;
    pageBanner.hidden = false;

    const nextUrl = new URL(window.location.href);
    nextUrl.search = "";
    window.history.replaceState(null, "", nextUrl);
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
