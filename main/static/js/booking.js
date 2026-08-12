document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const bookingForm = document.querySelector(
        'form[data-booking-form]'
    );

    if (!bookingForm) {
        return;
    }

    const dateInput = bookingForm.querySelector(
        '[name="booking_date"]'
    );

    const startTimeInput = bookingForm.querySelector(
        '[name="start_time"]'
    );

    const hoursInput = bookingForm.querySelector(
        '[name="hours"]'
    );

    const gameInput = bookingForm.querySelector(
        '[name="selected_game"]'
    );

    const priceElement = document.querySelector(
        "[data-booking-price]"
    );

    const totalElement = document.querySelector(
        "[data-booking-total]"
    );

    const endTimeElement = document.querySelector(
        "[data-booking-end-time]"
    );

    const summaryDateElement = document.querySelector(
        "[data-booking-summary-date]"
    );

    const summaryTimeElement = document.querySelector(
        "[data-booking-summary-time]"
    );

    const summaryHoursElement = document.querySelector(
        "[data-booking-summary-hours]"
    );

    const summaryGameElement = document.querySelector(
        "[data-booking-summary-game]"
    );

    const errorElement = document.querySelector(
        "[data-booking-client-error]"
    );

    const submitButton = bookingForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    const price = Number(
        bookingForm.dataset.price ||
        document.body.dataset.bookingPrice ||
        0
    );

    const currency = (
        bookingForm.dataset.currency ||
        "€"
    );

    function getTodayString() {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function setMinimumDate() {
        if (!dateInput) {
            return;
        }

        dateInput.min = getTodayString();
    }

    function parseTime(value) {
        if (!value || !value.includes(":")) {
            return null;
        }

        const parts = value.split(":");

        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return null;
        }

        return (
            hours * 60 +
            minutes
        );
    }

    function formatTime(totalMinutes) {
        const minutesInDay = 24 * 60;

        totalMinutes =
            totalMinutes % minutesInDay;

        const hours = Math.floor(
            totalMinutes / 60
        );

        const minutes =
            totalMinutes % 60;

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );
    }

    function calculateEndTime() {
        if (
            !startTimeInput ||
            !hoursInput
        ) {
            return null;
        }

        const startMinutes = parseTime(
            startTimeInput.value
        );

        const hours = Number(
            hoursInput.value
        );

        if (
            startMinutes === null ||
            !Number.isFinite(hours) ||
            hours <= 0
        ) {
            return null;
        }

        const endMinutes =
            startMinutes + (hours * 60);

        if (endMinutes > 24 * 60) {
            return null;
        }

        return formatTime(endMinutes);
    }

    function calculateTotal() {
        const hours = Number(
            hoursInput?.value || 0
        );

        if (
            !Number.isFinite(hours) ||
            hours <= 0 ||
            price <= 0
        ) {
            return 0;
        }

        return price * hours;
    }

    function showError(message) {
        if (!errorElement) {
            return;
        }

        errorElement.textContent = message;
        errorElement.hidden = false;
    }

    function clearError() {
        if (!errorElement) {
            return;
        }

        errorElement.textContent = "";
        errorElement.hidden = true;
    }

    function updatePrice() {
        const total = calculateTotal();

        if (totalElement) {
            totalElement.textContent =
                `${total.toFixed(2)} ${currency}`;
        }
    }

    function updateEndTime() {
        if (!endTimeElement) {
            return;
        }

        const endTime = calculateEndTime();

        endTimeElement.textContent =
            endTime || "—";
    }

    function updateSummary() {
        if (summaryDateElement) {
            summaryDateElement.textContent =
                dateInput?.value || "—";
        }

        if (summaryTimeElement) {
            summaryTimeElement.textContent =
                startTimeInput?.value || "—";
        }

        if (summaryHoursElement) {
            const hours = hoursInput?.value;

            summaryHoursElement.textContent =
                hours
                    ? `${hours} hour${Number(hours) === 1 ? "" : "s"}`
                    : "—";
        }

        if (summaryGameElement && gameInput) {
            const selectedOption =
                gameInput.options[
                    gameInput.selectedIndex
                ];

            summaryGameElement.textContent =
                selectedOption?.text || "—";
        }
    }

    function validateDate() {
        if (!dateInput || !dateInput.value) {
            return true;
        }

        const selectedDate =
            new Date(
                `${dateInput.value}T00:00:00`
            );

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (selectedDate < today) {
            showError(
                "Booking date cannot be in the past."
            );

            return false;
        }

        return true;
    }

    function validateTime() {
        if (
            !startTimeInput?.value ||
            !hoursInput?.value
        ) {
            return true;
        }

        const startMinutes =
            parseTime(
                startTimeInput.value
            );

        const hours =
            Number(hoursInput.value);

        if (
            startMinutes === null ||
            !Number.isFinite(hours) ||
            hours <= 0
        ) {
            return true;
        }

        const endMinutes =
            startMinutes + (hours * 60);

        if (endMinutes > 24 * 60) {
            showError(
                "Booking cannot continue into the next day."
            );

            return false;
        }

        return true;
    }

    function validateHours() {
        if (!hoursInput) {
            return true;
        }

        const hours =
            Number(hoursInput.value);

        const min =
            Number(hoursInput.min || 1);

        const max =
            Number(hoursInput.max || 24);

        if (
            !Number.isInteger(hours) ||
            hours < min ||
            hours > max
        ) {
            showError(
                `Booking duration must be between ${min} and ${max} hours.`
            );

            return false;
        }

        return true;
    }

    function validateGame() {
        if (!gameInput) {
            return true;
        }

        if (!gameInput.value) {
            showError(
                "Please select a game."
            );

            return false;
        }

        return true;
    }

    function validateBooking() {
        clearError();

        if (!validateDate()) {
            return false;
        }

        if (!validateHours()) {
            return false;
        }

        if (!validateTime()) {
            return false;
        }

        if (!validateGame()) {
            return false;
        }

        return true;
    }

    function updateInterface() {
        updatePrice();
        updateEndTime();
        updateSummary();
    }

    dateInput?.addEventListener(
        "change",
        () => {
            clearError();
            validateDate();
            updateInterface();
        }
    );

    startTimeInput?.addEventListener(
        "change",
        () => {
            clearError();
            updateInterface();
        }
    );

    hoursInput?.addEventListener(
        "input",
        () => {
            clearError();
            updateInterface();
        }
    );

    gameInput?.addEventListener(
        "change",
        () => {
            clearError();
            updateInterface();
        }
    );

    bookingForm.addEventListener(
        "submit",
        (event) => {
            if (!validateBooking()) {
                event.preventDefault();
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;

                if (
                    submitButton.tagName === "BUTTON"
                ) {
                    submitButton.dataset.originalText =
                        submitButton.textContent;

                    submitButton.textContent =
                        "Checking availability...";
                }
            }
        }
    );

    setMinimumDate();
    updateInterface();
});