document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const profilePage = document.querySelector(
        "[data-profile-page]"
    );

    if (!profilePage) {
        return;
    }

    const avatarInput = profilePage.querySelector(
        '[data-avatar-input]'
    );

    const avatarPreview = profilePage.querySelector(
        "[data-avatar-preview]"
    );

    const bioInput = profilePage.querySelector(
        '[data-bio-input]'
    );

    const bioCounter = profilePage.querySelector(
        "[data-bio-counter]"
    );

    const profileForm = profilePage.querySelector(
        "[data-profile-form]"
    );

    const passwordForm = profilePage.querySelector(
        "[data-password-form]"
    );

    const passwordInput = passwordForm?.querySelector(
        '[name="new_password1"]'
    );

    const passwordConfirmInput =
        passwordForm?.querySelector(
            '[name="new_password2"]'
        );

    const passwordStrength =
        passwordForm?.querySelector(
            "[data-password-strength]"
        );

    const passwordMatch =
        passwordForm?.querySelector(
            "[data-password-match]"
        );

    const deleteAvatarButton =
        profilePage.querySelector(
            "[data-avatar-remove]"
        );

    function updateBioCounter() {
        if (
            !bioInput ||
            !bioCounter
        ) {
            return;
        }

        const currentLength =
            bioInput.value.length;

        const maxLength =
            bioInput.maxLength;

        if (maxLength > 0) {
            bioCounter.textContent =
                `${currentLength}/${maxLength}`;
        } else {
            bioCounter.textContent =
                currentLength;
        }
    }

    function previewAvatar() {
        if (
            !avatarInput ||
            !avatarPreview
        ) {
            return;
        }

        const file =
            avatarInput.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            avatarInput.value = "";

            return;
        }

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                "Avatar image must be smaller than 5 MB."
            );

            avatarInput.value = "";

            return;
        }

        const reader =
            new FileReader();

        reader.addEventListener(
            "load",
            () => {
                avatarPreview.src =
                    reader.result;
            }
        );

        reader.readAsDataURL(file);
    }

    function validateProfileForm() {
        if (!profileForm) {
            return true;
        }

        const phoneInput =
            profileForm.querySelector(
                '[name="phone"]'
            );

        if (
            phoneInput &&
            phoneInput.value.trim()
        ) {
            const phone =
                phoneInput.value.trim();

            const phonePattern =
                /^[+0-9\s()\-]{7,20}$/;

            if (
                !phonePattern.test(
                    phone
                )
            ) {
                alert(
                    "Please enter a valid phone number."
                );

                phoneInput.focus();

                return false;
            }
        }

        if (
            avatarInput?.files?.[0]
        ) {
            const file =
                avatarInput.files[0];

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                alert(
                    "Please select a valid image file."
                );

                avatarInput.focus();

                return false;
            }

            if (
                file.size >
                5 * 1024 * 1024
            ) {
                alert(
                    "Avatar image must be smaller than 5 MB."
                );

                avatarInput.focus();

                return false;
            }
        }

        return true;
    }

    function getPasswordStrength(
        password
    ) {
        if (!password) {
            return {
                score: 0,
                text: "Enter a password.",
            };
        }

        let score = 0;

        if (password.length >= 8) {
            score += 1;
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        }

        if (
            /[^A-Za-z0-9]/.test(
                password
            )
        ) {
            score += 1;
        }

        if (score <= 2) {
            return {
                score,
                text: "Weak password.",
            };
        }

        if (score <= 4) {
            return {
                score,
                text: "Good password.",
            };
        }

        return {
            score,
            text: "Strong password.",
        };
    }

    function updatePasswordStrength() {
        if (
            !passwordInput ||
            !passwordStrength
        ) {
            return;
        }

        const result =
            getPasswordStrength(
                passwordInput.value
            );

        passwordStrength.textContent =
            result.text;

        passwordStrength.dataset.strength =
            String(result.score);
    }

    function updatePasswordMatch() {
        if (
            !passwordInput ||
            !passwordConfirmInput ||
            !passwordMatch
        ) {
            return;
        }

        if (
            !passwordConfirmInput.value
        ) {
            passwordMatch.textContent =
                "";

            passwordMatch.dataset.match =
                "";

            return;
        }

        const matches =
            passwordInput.value ===
            passwordConfirmInput.value;

        passwordMatch.textContent =
            matches
                ? "Passwords match."
                : "Passwords do not match.";

        passwordMatch.dataset.match =
            matches
                ? "true"
                : "false";
    }

    function validatePasswordForm() {
        if (
            !passwordForm ||
            !passwordInput ||
            !passwordConfirmInput
        ) {
            return true;
        }

        const password =
            passwordInput.value;

        const confirmation =
            passwordConfirmInput.value;

        if (password.length < 8) {
            alert(
                "Password must contain at least 8 characters."
            );

            passwordInput.focus();

            return false;
        }

        if (
            password !== confirmation
        ) {
            alert(
                "Passwords do not match."
            );

            passwordConfirmInput.focus();

            return false;
        }

        return true;
    }

    avatarInput?.addEventListener(
        "change",
        previewAvatar
    );

    bioInput?.addEventListener(
        "input",
        updateBioCounter
    );

    profileForm?.addEventListener(
        "submit",
        (event) => {
            if (
                !validateProfileForm()
            ) {
                event.preventDefault();
            }
        }
    );

    passwordInput?.addEventListener(
        "input",
        () => {
            updatePasswordStrength();
            updatePasswordMatch();
        }
    );

    passwordConfirmInput?.addEventListener(
        "input",
        updatePasswordMatch
    );

    passwordForm?.addEventListener(
        "submit",
        (event) => {
            if (
                !validatePasswordForm()
            ) {
                event.preventDefault();
            }
        }
    );

    deleteAvatarButton?.addEventListener(
        "click",
        (event) => {
            const confirmed =
                window.confirm(
                    "Are you sure you want to remove your avatar?"
                );

            if (!confirmed) {
                event.preventDefault();
            }
        }
    );

    updateBioCounter();
    updatePasswordStrength();
    updatePasswordMatch();
});