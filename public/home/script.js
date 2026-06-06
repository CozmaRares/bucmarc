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

document.querySelectorAll("[data-mark] [data-edit]").forEach(button => {
    button.addEventListener("click", () => {
        const mark = button.closest("[data-mark]");

        if (
            !(mark instanceof HTMLElement) ||
            !(urlInput instanceof HTMLInputElement) ||
            !(titleInput instanceof HTMLInputElement) ||
            !(categoryInput instanceof HTMLSelectElement)
        ) {
            return;
        }

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
    });
});

cancelButton.addEventListener("click", () => {
    editMarkDialog.close();
});

editMarkDialog.addEventListener("close", () => {
    editMarkDialog.hidden = true;
});

document.querySelectorAll("[data-mark] [data-delete]").forEach(button => {
    button.addEventListener("click", async () => {
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
    });
});
