showPageBanner();
setupCopyButtons();

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

function setupCopyButtons() {
    document.addEventListener("click", e => {
        const button = e.target.closest("[data-copy]");
        if (!button) return;

        const text = button.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = "Copied!";
            button.classList.add("copied");

            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove("copied");
            }, 2000);
        });
    });
}
