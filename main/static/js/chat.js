document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const chat = document.querySelector("[data-chat]");

    if (!chat) {
        return;
    }

    const messagesContainer = chat.querySelector(
        "[data-chat-messages]"
    );

    const form = chat.querySelector(
        "[data-chat-form]"
    );

    const textarea = chat.querySelector(
        "[data-chat-input]"
    );

    const fileInput = chat.querySelector(
        "[data-chat-file]"
    );

    const sendButton = chat.querySelector(
        "[data-chat-send]"
    );

    const csrfToken =
        chat.dataset.csrfToken ||
        document.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        )?.value;

    const readUrlTemplate =
        chat.dataset.readUrl || "";

    function scrollToBottom() {
        if (!messagesContainer) {
            return;
        }

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }

    function getReadUrl(messageId) {
        if (!readUrlTemplate) {
            return null;
        }

        return readUrlTemplate.replace(
            "__MESSAGE_ID__",
            messageId
        );
    }

    async function markMessageAsRead(messageElement) {
        if (!messageElement) {
            return;
        }

        const messageId =
            messageElement.dataset.messageId;

        if (!messageId) {
            return;
        }

        const readUrl =
            getReadUrl(messageId);

        if (!readUrl || !csrfToken) {
            return;
        }

        try {
            const response = await fetch(
                readUrl,
                {
                    method: "POST",

                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            if (data.success) {
                messageElement.dataset.read =
                    "true";

                const unreadIndicator =
                    messageElement.querySelector(
                        "[data-unread]"
                    );

                if (unreadIndicator) {
                    unreadIndicator.remove();
                }
            }
        } catch (error) {
            console.error(
                "Unable to mark message as read:",
                error
            );
        }
    }

    function markVisibleMessagesAsRead() {
        if (!messagesContainer) {
            return;
        }

        const unreadMessages =
            messagesContainer.querySelectorAll(
                '[data-message-id][data-read="false"]'
            );

        unreadMessages.forEach(
            (messageElement) => {
                markMessageAsRead(
                    messageElement
                );
            }
        );
    }

    function updateFileName() {
        if (!fileInput) {
            return;
        }

        const fileNameElement =
            chat.querySelector(
                "[data-chat-file-name]"
            );

        if (!fileNameElement) {
            return;
        }

        const file =
            fileInput.files?.[0];

        fileNameElement.textContent =
            file
                ? file.name
                : "";
    }

    function autoResizeTextarea() {
        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";

        textarea.style.height =
            `${textarea.scrollHeight}px`;
    }

    function sendOnEnter(event) {
        if (!textarea) {
            return;
        }

        if (
            event.key !== "Enter" ||
            event.shiftKey
        ) {
            return;
        }

        event.preventDefault();

        if (!form) {
            return;
        }

        if (
            textarea.value.trim() === "" &&
            !fileInput?.files?.length
        ) {
            return;
        }

        form.requestSubmit();
    }

    function disableSendButton() {
        if (!sendButton) {
            return;
        }

        sendButton.disabled = true;

        if (
            sendButton.tagName === "BUTTON"
        ) {
            sendButton.dataset.originalText =
                sendButton.textContent;

            sendButton.textContent =
                "Sending...";
        }
    }

    function handleSubmit() {
        if (!form) {
            return;
        }

        const text =
            textarea?.value.trim() || "";

        const hasFile =
            Boolean(
                fileInput?.files?.length
            );

        if (
            text === "" &&
            !hasFile
        ) {
            return;
        }

        disableSendButton();
    }

    textarea?.addEventListener(
        "input",
        autoResizeTextarea
    );

    textarea?.addEventListener(
        "keydown",
        sendOnEnter
    );

    fileInput?.addEventListener(
        "change",
        updateFileName
    );

    form?.addEventListener(
        "submit",
        handleSubmit
    );

    scrollToBottom();
    autoResizeTextarea();
    markVisibleMessagesAsRead();

    /*
     * If the browser tab becomes active again,
     * check unread messages one more time.
     */
    document.addEventListener(
        "visibilitychange",
        () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                markVisibleMessagesAsRead();
            }
        }
    );
});