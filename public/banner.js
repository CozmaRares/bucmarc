showPageBanner();

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
