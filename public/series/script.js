setupEditSeriesDialog();

function setupEditSeriesDialog() {
    const editSeriesDialog = document.querySelector("[data-edit-series-dialog]");

    if (!editSeriesDialog) {
        return;
    }

    const editSeriesCancelButton = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-cancel]",
    );

    document.querySelectorAll("[data-series] [data-edit-series]").forEach(button => {
        button.addEventListener("click", () => openEditSeriesDialog(button));
    });

    editSeriesCancelButton?.addEventListener("click", () => {
        editSeriesDialog.close();
    });

    editSeriesDialog.addEventListener("close", () => {
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
    const patternInput = editSeriesDialog.querySelector(
        "[data-edit-series-dialog-input-pattern]",
    );
    const series = button.closest("[data-series]");

    idInput.value = series.dataset.seriesId;
    titleInput.value = series.dataset.seriesTitle;
    patternInput.value = series.dataset.seriesPattern;

    editSeriesDialog.hidden = false;
    editSeriesDialog.showModal();
}
