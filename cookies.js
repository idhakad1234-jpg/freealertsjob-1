
document.addEventListener("DOMContentLoaded", function() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptCookies = document.getElementById("accept-cookies");
    const clearLocalStorageButton = document.getElementById("clear-local-storage");

    if (!localStorage.getItem("cookiesAccepted")) {
        cookieBanner.style.display = "block";
    }

    acceptCookies.addEventListener("click", function() {
        localStorage.setItem("cookiesAccepted", "true");
        cookieBanner.style.display = "none";
    });

    if (clearLocalStorageButton) {
        clearLocalStorageButton.addEventListener("click", function() {
            localStorage.clear();
            alert("Local storage has been cleared.");
        });
    }
});
