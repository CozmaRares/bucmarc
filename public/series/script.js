setupCreateSeriesDialog();
setupEditSeriesDialog();

function setupCreateSeriesDialog() {
    const createSeriesDialog = document.querySelector("[data-create-series-dialog]");
    const createSeriesDialogContent = createSeriesDialog.querySelector(
        ".dialog-content",
    );
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
    const editSeriesDialog = document.querySelector("[data-edit-series-dialog]");
    const editSeriesDialogContent = editSeriesDialog.querySelector(
        ".dialog-content",
    );
    const editSeriesCancelButton = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-cancel]",
    );

    document.querySelectorAll("[data-series] [data-edit-series]").forEach(button => {
        button.addEventListener("click", () => openEditSeriesDialog(button));
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
    const editSeriesDialog = document.querySelector("[data-edit-series-dialog]");
    const idInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-input-id]",
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

    idInput.value = series.dataset.seriesId;
    titleInput.value = series.dataset.seriesTitle;
    if (titleDisplay) {
        titleDisplay.textContent = series.dataset.seriesTitle;
    }
    patternInput.value = series.dataset.seriesPattern;

    editSeriesDialog.hidden = false;
}
