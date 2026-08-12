document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const catalog = document.querySelector(
        "[data-catalog]"
    );

    if (!catalog) {
        return;
    }

    const searchForm = catalog.querySelector(
        "[data-catalog-search-form]"
    );

    const searchInput = catalog.querySelector(
        "[data-catalog-search]"
    );

    const roomCards = Array.from(
        catalog.querySelectorAll(
            "[data-room-card]"
        )
    );

    const emptyState = catalog.querySelector(
        "[data-catalog-empty]"
    );

    const filterToggle = catalog.querySelector(
        "[data-filter-toggle]"
    );

    const filterPanel = catalog.querySelector(
        "[data-filter-panel]"
    );

    const clearFiltersButton =
        catalog.querySelector(
            "[data-clear-filters]"
        );

    const sortSelect = catalog.querySelector(
        "[data-sort]"
    );

    const filterInputs = Array.from(
        catalog.querySelectorAll(
            "[data-filter]"
        )
    );

    let debounceTimer = null;

    function normalize(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function getCardValue(card, attribute) {
        return card.dataset[attribute] || "";
    }

    function cardMatchesSearch(card, query) {
        if (!query) {
            return true;
        }

        const searchableText = normalize(
            [
                getCardValue(card, "title"),
                getCardValue(card, "description"),
                getCardValue(card, "category"),
                getCardValue(card, "games"),
                card.textContent,
            ].join(" ")
        );

        return searchableText.includes(
            normalize(query)
        );
    }

    function cardMatchesFilters(card) {
        const minPriceInput =
            catalog.querySelector(
                '[data-filter="min-price"]'
            );

        const maxPriceInput =
            catalog.querySelector(
                '[data-filter="max-price"]'
            );

        const playersInput =
            catalog.querySelector(
                '[data-filter="players"]'
            );

        const vrInput =
            catalog.querySelector(
                '[data-filter="vr"]'
            );

        const ps5ProInput =
            catalog.querySelector(
                '[data-filter="ps5-pro"]'
            );

        const fourKInput =
            catalog.querySelector(
                '[data-filter="4k"]'
            );

        const categoryInput =
            catalog.querySelector(
                '[data-filter="category"]'
            );

        const price =
            Number(
                getCardValue(
                    card,
                    "price"
                )
            );

        const players =
            Number(
                getCardValue(
                    card,
                    "players"
                )
            );

        const category =
            normalize(
                getCardValue(
                    card,
                    "category"
                )
            );

        if (
            minPriceInput?.value &&
            price <
                Number(
                    minPriceInput.value
                )
        ) {
            return false;
        }

        if (
            maxPriceInput?.value &&
            price >
                Number(
                    maxPriceInput.value
                )
        ) {
            return false;
        }

        if (
            playersInput?.value &&
            players <
                Number(
                    playersInput.value
                )
        ) {
            return false;
        }

        if (
            categoryInput?.value &&
            category !==
                normalize(
                    categoryInput.value
                )
        ) {
            return false;
        }

        if (
            vrInput?.checked &&
            getCardValue(card, "vr") !==
                "true"
        ) {
            return false;
        }

        if (
            ps5ProInput?.checked &&
            getCardValue(card, "ps5Pro") !==
                "true"
        ) {
            return false;
        }

        if (
            fourKInput?.checked &&
            getCardValue(card, "fourK") !==
                "true"
        ) {
            return false;
        }

        return true;
    }

    function applyFilters() {
        const query =
            searchInput?.value || "";

        let visibleCount = 0;

        roomCards.forEach((card) => {
            const matchesSearch =
                cardMatchesSearch(
                    card,
                    query
                );

            const matchesFilters =
                cardMatchesFilters(card);

            const visible =
                matchesSearch &&
                matchesFilters;

            card.hidden = !visible;

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden =
                visibleCount !== 0;
        }

        updateResultCounter(
            visibleCount
        );
    }

    function updateResultCounter(count) {
        const counter =
            catalog.querySelector(
                "[data-results-count]"
            );

        if (!counter) {
            return;
        }

        counter.textContent =
            String(count);
    }

    function clearFilters() {
        filterInputs.forEach(
            (input) => {
                if (
                    input.type ===
                    "checkbox"
                ) {
                    input.checked =
                        false;
                } else {
                    input.value =
                        "";
                }
            }
        );

        if (searchInput) {
            searchInput.value = "";
        }

        if (sortSelect) {
            sortSelect.value =
                "default";
        }

        applyFilters();
        sortRooms();
    }

    function sortRooms() {
        if (!sortSelect) {
            return;
        }

        const sortValue =
            sortSelect.value;

        if (
            sortValue ===
            "default"
        ) {
            return;
        }

        const cardsContainer =
            catalog.querySelector(
                "[data-rooms-grid]"
            );

        if (!cardsContainer) {
            return;
        }

        const sortedCards =
            [...roomCards].sort(
                (first, second) => {
                    const firstPrice =
                        Number(
                            getCardValue(
                                first,
                                "price"
                            )
                        );

                    const secondPrice =
                        Number(
                            getCardValue(
                                second,
                                "price"
                            )
                        );

                    const firstRating =
                        Number(
                            getCardValue(
                                first,
                                "rating"
                            )
                        );

                    const secondRating =
                        Number(
                            getCardValue(
                                second,
                                "rating"
                            )
                        );

                    if (
                        sortValue ===
                        "price-low"
                    ) {
                        return (
                            firstPrice -
                            secondPrice
                        );
                    }

                    if (
                        sortValue ===
                        "price-high"
                    ) {
                        return (
                            secondPrice -
                            firstPrice
                        );
                    }

                    if (
                        sortValue ===
                        "rating"
                    ) {
                        return (
                            secondRating -
                            firstRating
                        );
                    }

                    return 0;
                }
            );

        sortedCards.forEach(
            (card) => {
                cardsContainer.appendChild(
                    card
                );
            }
        );
    }

    searchInput?.addEventListener(
        "input",
        () => {
            window.clearTimeout(
                debounceTimer
            );

            debounceTimer =
                window.setTimeout(
                    () => {
                        applyFilters();
                    },
                    200
                );
        }
    );

    searchForm?.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            applyFilters();
            sortRooms();
        }
    );

    filterInputs.forEach(
        (input) => {
            input.addEventListener(
                "change",
                () => {
                    applyFilters();
                    sortRooms();
                }
            );

            if (
                input.type !==
                "checkbox"
            ) {
                input.addEventListener(
                    "input",
                    () => {
                        applyFilters();
                    }
                );
            }
        }
    );

    sortSelect?.addEventListener(
        "change",
        () => {
            sortRooms();
        }
    );

    clearFiltersButton?.addEventListener(
        "click",
        () => {
            clearFilters();
        }
    );

    filterToggle?.addEventListener(
        "click",
        () => {
            if (!filterPanel) {
                return;
            }

            const isHidden =
                filterPanel.hidden;

            filterPanel.hidden =
                !isHidden;

            filterToggle.setAttribute(
                "aria-expanded",
                String(isHidden)
            );

            filterToggle.classList.toggle(
                "is-active",
                isHidden
            );
        }
    );

    roomCards.forEach(
        (card) => {
            card.addEventListener(
                "mouseenter",
                () => {
                    card.classList.add(
                        "is-hovered"
                    );
                }
            );

            card.addEventListener(
                "mouseleave",
                () => {
                    card.classList.remove(
                        "is-hovered"
                    );
                }
            );
        }
    );

    applyFilters();
    sortRooms();
});