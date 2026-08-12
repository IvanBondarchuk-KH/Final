document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const paymentForm = document.querySelector(
        "[data-payment-form]"
    );

    if (!paymentForm) {
        return;
    }

    const cardNumberInput =
        paymentForm.querySelector(
            '[data-card-number]'
        );

    const expiryInput =
        paymentForm.querySelector(
            '[data-card-expiry]'
        );

    const cvvInput =
        paymentForm.querySelector(
            '[data-card-cvv]'
        );

    const cardNameInput =
        paymentForm.querySelector(
            '[data-card-name]'
        );

    const amountElement =
        paymentForm.querySelector(
            "[data-payment-amount]"
        );

    const cardPreviewNumber =
        paymentForm.querySelector(
            "[data-card-preview-number]"
        );

    const cardPreviewName =
        paymentForm.querySelector(
            "[data-card-preview-name]"
        );

    const cardPreviewExpiry =
        paymentForm.querySelector(
            "[data-card-preview-expiry]"
        );

    const paymentStatus =
        paymentForm.querySelector(
            "[data-payment-status]"
        );

    const submitButton =
        paymentForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

    function digitsOnly(value) {
        return value.replace(
            /\D/g,
            ""
        );
    }

    function formatCardNumber(value) {
        const digits =
            digitsOnly(value)
                .slice(0, 16);

        return digits.replace(
            /(\d{4})(?=\d)/g,
            "$1 "
        );
    }

    function formatExpiry(value) {
        const digits =
            digitsOnly(value)
                .slice(0, 4);

        if (digits.length <= 2) {
            return digits;
        }

        return (
            `${digits.slice(0, 2)}/` +
            `${digits.slice(2)}`
        );
    }

    function formatCVV(value) {
        return digitsOnly(value)
            .slice(0, 4);
    }

    function updateCardPreview() {
        if (cardPreviewNumber) {
            const value =
                cardNumberInput?.value
                    .trim();

            cardPreviewNumber.textContent =
                value ||
                "•••• •••• •••• ••••";
        }

        if (cardPreviewName) {
            const value =
                cardNameInput?.value
                    .trim()
                    .toUpperCase();

            cardPreviewName.textContent =
                value ||
                "CARD HOLDER";
        }

        if (cardPreviewExpiry) {
            const value =
                expiryInput?.value
                    .trim();

            cardPreviewExpiry.textContent =
                value ||
                "MM/YY";
        }
    }

    function showError(message) {
        if (!paymentStatus) {
            return;
        }

        paymentStatus.textContent =
            message;

        paymentStatus.hidden =
            false;

        paymentStatus.dataset.status =
            "error";
    }

    function clearError() {
        if (!paymentStatus) {
            return;
        }

        paymentStatus.textContent =
            "";

        paymentStatus.hidden =
            true;

        paymentStatus.dataset.status =
            "";
    }

    function validateCardNumber() {
        if (!cardNumberInput) {
            return true;
        }

        const digits =
            digitsOnly(
                cardNumberInput.value
            );

        if (
            digits.length < 13 ||
            digits.length > 19
        ) {
            showError(
                "Please enter a valid card number."
            );

            cardNumberInput.focus();

            return false;
        }

        return true;
    }

    function validateExpiry() {
        if (!expiryInput) {
            return true;
        }

        const value =
            expiryInput.value;

        const match =
            value.match(
                /^(\d{2})\/(\d{2})$/
            );

        if (!match) {
            showError(
                "Please enter the expiry date in MM/YY format."
            );

            expiryInput.focus();

            return false;
        }

        const month =
            Number(match[1]);

        const year =
            Number(match[2]);

        if (
            month < 1 ||
            month > 12
        ) {
            showError(
                "Please enter a valid expiry month."
            );

            expiryInput.focus();

            return false;
        }

        const currentDate =
            new Date();

        const currentYear =
            currentDate.getFullYear() % 100;

        const currentMonth =
            currentDate.getMonth() + 1;

        if (
            year < currentYear ||
            (
                year === currentYear &&
                month < currentMonth
            )
        ) {
            showError(
                "This card has expired."
            );

            expiryInput.focus();

            return false;
        }

        return true;
    }

    function validateCVV() {
        if (!cvvInput) {
            return true;
        }

        const cvv =
            digitsOnly(
                cvvInput.value
            );

        if (
            cvv.length < 3 ||
            cvv.length > 4
        ) {
            showError(
                "Please enter a valid CVV."
            );

            cvvInput.focus();

            return false;
        }

        return true;
    }

    function validateCardName() {
        if (!cardNameInput) {
            return true;
        }

        const name =
            cardNameInput.value
                .trim();

        if (name.length < 2) {
            showError(
                "Please enter the cardholder name."
            );

            cardNameInput.focus();

            return false;
        }

        return true;
    }

    function validatePayment() {
        clearError();

        if (!validateCardName()) {
            return false;
        }

        if (!validateCardNumber()) {
            return false;
        }

        if (!validateExpiry()) {
            return false;
        }

        if (!validateCVV()) {
            return false;
        }

        return true;
    }

    function protectSubmit() {
        if (!submitButton) {
            return;
        }

        submitButton.disabled = true;

        if (
            submitButton.tagName ===
            "BUTTON"
        ) {
            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent =
                "Processing Payment...";
        }
    }

    cardNumberInput?.addEventListener(
        "input",
        () => {
            cardNumberInput.value =
                formatCardNumber(
                    cardNumberInput.value
                );

            updateCardPreview();
            clearError();
        }
    );

    expiryInput?.addEventListener(
        "input",
        () => {
            expiryInput.value =
                formatExpiry(
                    expiryInput.value
                );

            updateCardPreview();
            clearError();
        }
    );

    cvvInput?.addEventListener(
        "input",
        () => {
            cvvInput.value =
                formatCVV(
                    cvvInput.value
                );

            clearError();
        }
    );

    cardNameInput?.addEventListener(
        "input",
        () => {
            updateCardPreview();
            clearError();
        }
    );

    paymentForm.addEventListener(
        "submit",
        (event) => {
            if (!validatePayment()) {
                event.preventDefault();

                return;
            }

            protectSubmit();
        }
    );

    updateCardPreview();
});