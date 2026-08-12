document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const body = document.body;

    /*
     * ==========================================
     * HEADER
     * ==========================================
     */

    const header =
        document.querySelector(
            "[data-header]"
        );

    const mobileMenuButton =
        document.querySelector(
            "[data-mobile-menu-toggle]"
        );

    const mobileMenu =
        document.querySelector(
            "[data-mobile-menu]"
        );

    const navigationLinks =
        document.querySelectorAll(
            "[data-nav-link]"
        );

    /*
     * ==========================================
     * MOBILE MENU
     * ==========================================
     */

    function openMobileMenu() {
        if (!mobileMenu) {
            return;
        }

        mobileMenu.classList.add(
            "is-open"
        );

        body.classList.add(
            "menu-open"
        );

        mobileMenuButton?.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function closeMobileMenu() {
        if (!mobileMenu) {
            return;
        }

        mobileMenu.classList.remove(
            "is-open"
        );

        body.classList.remove(
            "menu-open"
        );

        mobileMenuButton?.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    function toggleMobileMenu() {
        if (!mobileMenu) {
            return;
        }

        const isOpen =
            mobileMenu.classList.contains(
                "is-open"
            );

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    mobileMenuButton?.addEventListener(
        "click",
        toggleMobileMenu
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape"
            ) {
                closeMobileMenu();
                closeAllDropdowns();
            }
        }
    );

    /*
     * Close mobile menu after navigation.
     */

    navigationLinks.forEach(
        (link) => {
            link.addEventListener(
                "click",
                () => {
                    closeMobileMenu();
                }
            );
        }
    );

    /*
     * ==========================================
     * HEADER SCROLL STATE
     * ==========================================
     */

    function updateHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 20) {
            header.classList.add(
                "is-scrolled"
            );
        } else {
            header.classList.remove(
                "is-scrolled"
            );
        }
    }

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true,
        }
    );

    updateHeader();

    /*
     * ==========================================
     * DROPDOWNS
     * ==========================================
     */

    const dropdowns =
        document.querySelectorAll(
            "[data-dropdown]"
        );

    function closeDropdown(
        dropdown
    ) {
        dropdown.classList.remove(
            "is-open"
        );

        const toggle =
            dropdown.querySelector(
                "[data-dropdown-toggle]"
            );

        toggle?.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    function closeAllDropdowns(
        except = null
    ) {
        dropdowns.forEach(
            (dropdown) => {
                if (
                    dropdown !== except
                ) {
                    closeDropdown(
                        dropdown
                    );
                }
            }
        );
    }

    dropdowns.forEach(
        (dropdown) => {
            const toggle =
                dropdown.querySelector(
                    "[data-dropdown-toggle]"
                );

            if (!toggle) {
                return;
            }

            toggle.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();

                    const isOpen =
                        dropdown.classList.contains(
                            "is-open"
                        );

                    closeAllDropdowns(
                        dropdown
                    );

                    if (isOpen) {
                        closeDropdown(
                            dropdown
                        );
                    } else {
                        dropdown.classList.add(
                            "is-open"
                        );

                        toggle.setAttribute(
                            "aria-expanded",
                            "true"
                        );
                    }
                }
            );
        }
    );

    document.addEventListener(
        "click",
        (event) => {
            dropdowns.forEach(
                (dropdown) => {
                    if (
                        !dropdown.contains(
                            event.target
                        )
                    ) {
                        closeDropdown(
                            dropdown
                        );
                    }
                }
            );
        }
    );

    /*
     * ==========================================
     * ACTIVE NAVIGATION LINK
     * ==========================================
     */

    const currentPath =
        window.location.pathname;

    navigationLinks.forEach(
        (link) => {
            const href =
                link.getAttribute(
                    "href"
                );

            if (
                !href ||
                href === "#" ||
                href.startsWith(
                    "javascript:"
                )
            ) {
                return;
            }

            try {
                const linkUrl =
                    new URL(
                        href,
                        window.location.origin
                    );

                const linkPath =
                    linkUrl.pathname;

                if (
                    linkPath ===
                    currentPath
                ) {
                    link.classList.add(
                        "is-active"
                    );

                    link.setAttribute(
                        "aria-current",
                        "page"
                    );
                }
            } catch {
                return;
            }
        }
    );

    /*
     * ==========================================
     * BACK TO TOP
     * ==========================================
     */

    const backToTop =
        document.querySelector(
            "[data-back-to-top]"
        );

    function updateBackToTop() {
        if (!backToTop) {
            return;
        }

        if (window.scrollY > 500) {
            backToTop.classList.add(
                "is-visible"
            );
        } else {
            backToTop.classList.remove(
                "is-visible"
            );
        }
    }

    backToTop?.addEventListener(
        "click",
        () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    );

    window.addEventListener(
        "scroll",
        updateBackToTop,
        {
            passive: true,
        }
    );

    updateBackToTop();

    /*
     * ==========================================
     * SMOOTH ANCHOR SCROLL
     * ==========================================
     */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    anchorLinks.forEach(
        (link) => {
            link.addEventListener(
                "click",
                (event) => {
                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    const headerHeight =
                        header?.offsetHeight ||
                        0;

                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight -
                        20;

                    window.scrollTo({
                        top:
                            targetPosition,
                        behavior:
                            "smooth",
                    });

                    closeMobileMenu();
                }
            );
        }
    );

    /*
     * ==========================================
     * PASSWORD VISIBILITY
     * ==========================================
     */

    const passwordToggles =
        document.querySelectorAll(
            "[data-password-toggle]"
        );

    passwordToggles.forEach(
        (toggle) => {
            toggle.addEventListener(
                "click",
                () => {
                    const targetId =
                        toggle.dataset
                            .passwordToggle;

                    const input =
                        document.getElementById(
                            targetId
                        );

                    if (!input) {
                        return;
                    }

                    const isPassword =
                        input.type ===
                        "password";

                    input.type =
                        isPassword
                            ? "text"
                            : "password";

                    toggle.setAttribute(
                        "aria-label",
                        isPassword
                            ? "Hide password"
                            : "Show password"
                    );

                    toggle.classList.toggle(
                        "is-visible",
                        isPassword
                    );
                }
            );
        }
    );

    /*
     * ==========================================
     * CONFIRMATION BUTTONS
     * ==========================================
     */

    const confirmationElements =
        document.querySelectorAll(
            "[data-confirm]"
        );

    confirmationElements.forEach(
        (element) => {
            element.addEventListener(
                "click",
                (event) => {
                    const message =
                        element.dataset
                            .confirm ||
                        "Are you sure?";

                    if (
                        !window.confirm(
                            message
                        )
                    ) {
                        event.preventDefault();
                    }
                }
            );
        }
    );

    /*
     * ==========================================
     * DISABLE BUTTON AFTER SUBMIT
     * ==========================================
     */

    const protectedForms =
        document.querySelectorAll(
            "[data-prevent-double-submit]"
        );

    protectedForms.forEach(
        (form) => {
            form.addEventListener(
                "submit",
                () => {
                    const submitButton =
                        form.querySelector(
                            'button[type="submit"], input[type="submit"]'
                        );

                    if (!submitButton) {
                        return;
                    }

                    submitButton.disabled =
                        true;

                    if (
                        submitButton.tagName ===
                        "BUTTON"
                    ) {
                        submitButton.dataset
                            .originalText =
                            submitButton.textContent;

                        submitButton.textContent =
                            "Processing...";
                    }
                }
            );
        }
    );

    /*
     * ==========================================
     * IMAGE FALLBACK
     * ==========================================
     */

    const images =
        document.querySelectorAll(
            "img[data-image-fallback]"
        );

    images.forEach(
        (image) => {
            image.addEventListener(
                "error",
                () => {
                    image.classList.add(
                        "is-broken"
                    );

                    const fallback =
                        image.dataset
                            .imageFallback;

                    if (
                        fallback &&
                        image.src !==
                            fallback
                    ) {
                        image.src =
                            fallback;
                    }
                }
            );
        }
    );

    /*
     * ==========================================
     * CURRENT YEAR
     * ==========================================
     */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    const currentYear =
        new Date().getFullYear();

    yearElements.forEach(
        (element) => {
            element.textContent =
                currentYear;
        }
    );

    /*
     * ==========================================
     * INITIAL STATE
     * ==========================================
     */

    if (mobileMenu) {
        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    mobileMenuButton?.setAttribute(
        "aria-expanded",
        "false"
    );

    dropdowns.forEach(
        (dropdown) => {
            const toggle =
                dropdown.querySelector(
                    "[data-dropdown-toggle]"
                );

            toggle?.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    );
});