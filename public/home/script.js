setupCreateCategoryDialog();
setupEditCategoryDialog();
setupEditMarkDialog();
setupDeleteMarkForms();
setupDeleteCategoryForms();

function setupCreateCategoryDialog() {
    const createCategoryDialog = document.querySelector(
        "[data-create-category-dialog]",
    );
    const createCategoryDialogContent = createCategoryDialog.querySelector(
        "[data-create-category-dialog-content]",
    );
    const createCategoryCancelButton = createCategoryDialog.querySelector(
        "[data-create-category-dialog-cancel]",
    );
    const createCategoryButton = document.querySelector(
        "[data-create-category]",
    );
    createCategoryButton.addEventListener("click", () => {
        createCategoryDialog.hidden = false;
    });

    createCategoryDialogContent.addEventListener("click", event => {
        event.stopPropagation();
    });

    createCategoryDialog.addEventListener("click", () => {
        createCategoryDialog.hidden = true;
    });

    createCategoryCancelButton.addEventListener("click", () => {
        createCategoryDialog.hidden = true;
    });
}

function setupEditCategoryDialog() {
    const editCategoryDialog = document.querySelector(
        "[data-edit-category-dialog]",
    );
    const editCategoryDialogContent = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-content]",
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

    editCategoryDialogContent.addEventListener("click", event => {
        event.stopPropagation();
    });

    editCategoryDialog.addEventListener("click", () => {
        editCategoryDialog.hidden = true;
    });

    editCategoryCancelButton.addEventListener("click", () => {
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
    const editCategoryUpdateIdInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-update-id]",
    );
    const editCategoryDeleteIdInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-delete-id]",
    );
    const editCategorySortOrderInput = editCategoryDialog.querySelector(
        "[data-edit-category-dialog-input-sort-order]",
    );
    const category = button.closest("[data-category]");
    const id = category.dataset.categoryId;
    const name = category.dataset.categoryName;
    const sortOrder = category.dataset.categorySortOrder;

    editCategoryNameOutput.textContent = name;
    editCategoryNameInput.value = name;
    editCategoryUpdateIdInput.value = id;
    editCategoryDeleteIdInput.value = id;
    editCategorySortOrderInput.value = sortOrder;
    editCategoryDialog.dataset.categoryName = name;
    editCategoryDialog.hidden = false;
}

function setupEditMarkDialog() {
    const editMarkDialog = document.querySelector("[data-edit-mark-dialog]");
    const editMarkDialogContent = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-content]",
    );
    const editMarkCancelButton = editMarkDialog.querySelector(
        "[data-edit-mark-dialog-cancel]",
    );

    document.querySelectorAll("[data-mark] [data-edit]").forEach(button => {
        button.addEventListener("click", () => openEditMarkDialog(button));
    });

    editMarkDialogContent.addEventListener("click", event => {
        event.stopPropagation();
    });

    editMarkDialog.addEventListener("close", () => {
        editMarkDialog.hidden = true;
    });

    editMarkCancelButton.addEventListener("click", () => {
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
                    `Delete this Category?\n\n${name}\n\nIts Marks will move to Marks.`,
                )
            ) {
                event.preventDefault();
            }
        });
    });
}
