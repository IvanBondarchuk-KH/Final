document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const reviewForms = document.querySelectorAll(
        "[data-review-form]"
    );

    const deleteForms = document.querySelectorAll(
        "[data-review-delete]"
    );

    reviewForms.forEach((form) => {
        const ratingInput = form.querySelector(
            '[name="rating"]'
        );

        const commentInput = form.querySelector(
            '[name="comment"]'
        );

        const ratingDisplay = form.querySelector(
            "[data-rating-value]"
        );

        const ratingStars = form.querySelectorAll(
            "[data-rating-star]"
        );

        const characterCounter = form.querySelector(
            "[data-review-counter]"
        );

        const submitButton = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        function updateRatingDisplay() {
            if (!ratingInput) {
                return;
            }

            const rating =
                Number(ratingInput.value || 0);

            if (ratingDisplay) {
                ratingDisplay.textContent =
                    rating > 0
                        ? `${rating}/5`
                        : "Select rating";
            }

            ratingStars.forEach((star) => {
                const starValue =
                    Number(
                        star.dataset.ratingStar
                    );

                star.classList.toggle(
                    "is-active",
                    starValue <= rating
                );

                star.setAttribute(
                    "aria-checked",
                    starValue === rating
                        ? "true"
                        : "false"
                );
            });
        }

        function updateCharacterCounter() {
            if (
                !commentInput ||
                !characterCounter
            ) {
                return;
            }

            const currentLength =
                commentInput.value.length;

            const maxLength =
                commentInput.maxLength;

            if (maxLength > 0) {
                characterCounter.textContent =
                    `${currentLength}/${maxLength}`;
            } else {
                characterCounter.textContent =
                    `${currentLength}`;
            }
        }

        function selectRating(value) {
            if (!ratingInput) {
                return;
            }

            ratingInput.value = value;

            updateRatingDisplay();
        }

        ratingStars.forEach((star) => {
            star.addEventListener(
                "click",
                () => {
                    const value =
                        Number(
                            star.dataset.ratingStar
                        );

                    if (
                        Number.isInteger(value) &&
                        value >= 1 &&
                        value <= 5
                    ) {
                        selectRating(value);
                    }
                }
            );

            star.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    event.preventDefault();

                    const value =
                        Number(
                            star.dataset.ratingStar
                        );

                    if (
                        Number.isInteger(value) &&
                        value >= 1 &&
                        value <= 5
                    ) {
                        selectRating(value);
                    }
                }
            );
        });

        ratingInput?.addEventListener(
            "change",
            updateRatingDisplay
        );

        commentInput?.addEventListener(
            "input",
            updateCharacterCounter
        );

        form.addEventListener(
            "submit",
            (event) => {
                const rating =
                    Number(
                        ratingInput?.value || 0
                    );

                if (
                    !Number.isInteger(rating) ||
                    rating < 1 ||
                    rating > 5
                ) {
                    event.preventDefault();

                    if (ratingDisplay) {
                        ratingDisplay.textContent =
                            "Please select a rating.";
                    }

                    ratingInput?.focus();

                    return;
                }

                if (
                    commentInput &&
                    commentInput.maxLength > 0 &&
                    commentInput.value.length >
                        commentInput.maxLength
                ) {
                    event.preventDefault();

                    commentInput.focus();

                    return;
                }

                if (submitButton) {
                    submitButton.disabled = true;

                    if (
                        submitButton.tagName ===
                        "BUTTON"
                    ) {
                        submitButton.dataset.originalText =
                            submitButton.textContent;

                        submitButton.textContent =
                            "Saving...";
                    }
                }
            }
        );

        updateRatingDisplay();
        updateCharacterCounter();
    });

    deleteForms.forEach((form) => {
        form.addEventListener(
            "submit",
            (event) => {
                const confirmed =
                    window.confirm(
                        "Are you sure you want to delete this review?"
                    );

                if (!confirmed) {
                    event.preventDefault();

                    return;
                }

                const submitButton =
                    form.querySelector(
                        'button[type="submit"], input[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                }
            }
        );
    });
});