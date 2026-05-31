const reloadPage = () => {
    window.location.reload();
};

const editMark = () => {
    reloadPage();
};

const deleteMark = async url => {
    await fetch("/api/mark/delete/" + encodeURIComponent(url), {
        method: "DELETE",
    });

    reloadPage();
};

document.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
        editMark();
    });
});

document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
        const url = button.getAttribute("data-delete");

        if (!url) {
            return;
        }

        void deleteMark(url);
    });
});
