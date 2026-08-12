document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const favoriteButtons = document.querySelectorAll(
        "[data-favorite-button]"
    );

    if (!favoriteButtons.length) {
        return;
    }

    const csrfToken =
        document.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        )?.value ||
        document.querySelector(
            'meta[name="csrf-token"]'
        )?.getAttribute("content");

    const favoriteCounter =
        document.querySelector(
            "[data-favorites-count]"
        );

    function updateCounter(change) {
        if (!favoriteCounter) {
            return;
        }

        const currentCount =
            Number(
                favoriteCounter.textContent || 0
            );

        const newCount =
            Math.max(
                0,
                currentCount + change
            );

        favoriteCounter.textContent =
            newCount;
    }

    function updateButton(
        button,
        isFavorite
    ) {
        const icon =
            button.querySelector(
                "[data-favorite-icon]"
            );

        const text =
            button.querySelector(
                "[data-favorite-text]"
            );

        button.dataset.favorite =
            isFavorite
                ? "true"
                : "false";

        button.setAttribute(
            "aria-pressed",
            isFavorite
                ? "true"
                : "false"
        );

        button.classList.toggle(
            "is-active",
            isFavorite
        );

        if (icon) {
            icon.classList.toggle(
                "fa-solid",
                isFavorite
            );

            icon.classList.toggle(
                "fa-regular",
                !isFavorite
            );
        }

        if (text) {
            text.textContent =
                isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites";
        }
    }

    async function toggleFavorite(button) {
        const url =
            button.dataset.favoriteUrl;

        if (!url) {
            return;
        }

        if (!csrfToken) {
            console.error(
                "CSRF token not found."
            );

            return;
        }

        if (
            button.dataset.loading ===
            "true"
        ) {
            return;
        }

        button.dataset.loading = "true";
        button.disabled = true;

        const previousState =
            button.dataset.favorite ===
            "true";

        try {
            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers: {
                            "X-CSRFToken":
                                csrfToken,

                            "X-Requested-With":
                                "XMLHttpRequest",

                            "Accept":
                                "application/json",
                        },
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            /*
             * The current Django view redirects
             * after changing the favorite.
             *
             * Therefore the request itself
             * succeeded if we reach this point.
             */
            const newState =
                !previousState;

            updateButton(
                button,
                newState
            );

            updateCounter(
                newState
                    ? 1
                    : -1
            );

        } catch (error) {
            console.error(
                "Favorite error:",
                error
            );

            updateButton(
                button,
                previousState
            );

        } finally {
            button.dataset.loading =
                "false";

            button.disabled = false;
        }
    }

    favoriteButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();

                    toggleFavorite(button);
                }
            );
        }
    );
});