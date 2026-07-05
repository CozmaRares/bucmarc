setupCreateSeriesDialog();
setupEditSeriesDialog();
setupDeleteSeriesForms();

function setupCreateSeriesDialog() {
    const createSeriesDialog = document.querySelector(
        "[data-create-series-dialog]",
    );
    const createSeriesDialogContent =
        createSeriesDialog.querySelector(".dialog-content");
    const createSeriesButton = document.querySelector("[data-create-series]");
    const createSeriesCancelButton = createSeriesDialog.querySelector(
        "[data-create-series-dialog-cancel]",
    );
    createSeriesButton?.addEventListener("click", () => {
        createSeriesDialog.hidden = false;
    });

    createSeriesDialogContent.addEventListener("click", event => {
        event.stopPropagation();
    });

    createSeriesDialog.addEventListener("click", () => {
        createSeriesDialog.hidden = true;
    });

    createSeriesCancelButton.addEventListener("click", () => {
        createSeriesDialog.hidden = true;
    });
}

function setupEditSeriesDialog() {
    const editSeriesDialog = document.querySelector(
        "[data-edit-series-dialog]",
    );
    const editSeriesDialogContent =
        editSeriesDialog.querySelector(".dialog-content");
    const editSeriesCancelButton = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-cancel]",
    );

    document
        .querySelectorAll("[data-series] [data-edit-series]")
        .forEach(button => {
            button.addEventListener("click", () =>
                openEditSeriesDialog(button),
            );
        });

    editSeriesDialogContent.addEventListener("click", event => {
        event.stopPropagation();
    });

    editSeriesDialog.addEventListener("click", () => {
        editSeriesDialog.hidden = true;
    });

    editSeriesCancelButton.addEventListener("click", () => {
        editSeriesDialog.hidden = true;
    });
}

function openEditSeriesDialog(button) {
    const editSeriesDialog = document.querySelector(
        "[data-edit-series-dialog]",
    );
    const idInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-input-id]",
    );
    const deleteIdInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-delete-id]",
    );
    const titleInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-input-title]",
    );
    const titleDisplay = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-title]",
    );
    const patternInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-input-pattern]",
    );
    const series = button.closest("[data-series]");
    const title = series.dataset.seriesTitle;

    idInput.value = series.dataset.seriesId;
    deleteIdInput.value = series.dataset.seriesId;
    titleInput.value = title;
    titleDisplay.textContent = title;
    patternInput.value = series.dataset.seriesPattern;

    editSeriesDialog.dataset.seriesTitle = title;
    editSeriesDialog.hidden = false;
}

function setupDeleteSeriesForms() {
    document.querySelectorAll("[data-delete-series-form]").forEach(form => {
        form.addEventListener("submit", event => {
            const series = form.closest("[data-series]");
            const dialog = form.closest("[data-edit-series-dialog]");
            const title =
                series?.dataset.seriesTitle ?? dialog?.dataset.seriesTitle;

            if (!confirm(`Delete this Series?\n\n${title}`)) {
                event.preventDefault();
            }
        });
    });
}
