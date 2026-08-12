document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const game = document.querySelector(".game-page");

    if (!game) {
        return;
    }

    const target = document.getElementById("game-target");
    const startButton = document.getElementById("game-start");
    const stopButton = document.getElementById("game-stop");

    const scoreElement = document.getElementById("game-score");
    const levelElement = document.getElementById("game-level");
    const timeElement = document.getElementById("game-time");
    const statusElement = document.getElementById("game-status");

    const overlay = document.getElementById("game-overlay");

    const resultElement = document.getElementById("game-result");
    const finalScoreElement = document.getElementById("final-score");
    const finalLevelElement = document.getElementById("final-level");
    const finalTimeElement = document.getElementById("final-time");

    const restartButton = document.getElementById("game-restart");

    if (
        !target ||
        !startButton ||
        !stopButton ||
        !scoreElement ||
        !levelElement ||
        !timeElement
    ) {
        return;
    }

    const scoreUrl =
        game.dataset.scoreUrl ||
        "/game/score/";

    const csrfToken =
        game.dataset.csrfToken ||
        document.querySelector(
            "[name=csrfmiddlewaretoken]"
        )?.value ||
        getCookie("csrftoken");

    const GAME_DURATION = 30;
    const LEVEL_SCORE_STEP = 10;

    let score = 0;
    let level = 1;
    let timeLeft = GAME_DURATION;

    let gameRunning = false;

    let timerInterval = null;
    let targetTimeout = null;

    let gameStartedAt = null;

    function getCookie(name) {
        const cookies = document.cookie.split(";");

        for (const cookie of cookies) {
            const trimmed = cookie.trim();

            if (
                trimmed.startsWith(
                    `${name}=`
                )
            ) {
                return decodeURIComponent(
                    trimmed.substring(
                        name.length + 1
                    )
                );
            }
        }

        return null;
    }

    function updateInterface() {
        scoreElement.textContent = score;
        levelElement.textContent = level;
        timeElement.textContent = timeLeft;
    }

    function setStatus(text) {
        if (statusElement) {
            statusElement.textContent = text;
        }
    }

    function calculateLevel() {
        return (
            Math.floor(
                score / LEVEL_SCORE_STEP
            ) + 1
        );
    }

    function getTargetSize() {
        return Math.max(
            46,
            82 - (level - 1) * 6
        );
    }

    function positionTarget() {
        const arenaWidth =
            game.clientWidth;

        const arenaHeight =
            game.clientHeight;

        const targetSize =
            getTargetSize();

        const padding = 20;

        const maxX = Math.max(
            padding,
            arenaWidth -
                targetSize -
                padding
        );

        const maxY = Math.max(
            padding,
            arenaHeight -
                targetSize -
                padding
        );

        const x =
            Math.random() *
                (maxX - padding) +
            padding;

        const y =
            Math.random() *
                (maxY - padding) +
            padding;

        target.style.width =
            `${targetSize}px`;

        target.style.height =
            `${targetSize}px`;

        target.style.left =
            `${x}px`;

        target.style.top =
            `${y}px`;
    }

    function getTargetDelay() {
        return Math.max(
            350,
            1000 -
                (level - 1) * 90
        );
    }

    function scheduleTarget() {
        if (!gameRunning) {
            return;
        }

        clearTimeout(targetTimeout);

        targetTimeout = setTimeout(
            () => {
                if (!gameRunning) {
                    return;
                }

                positionTarget();
                scheduleTarget();
            },
            getTargetDelay()
        );
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function stopTargetMovement() {
        if (targetTimeout) {
            clearTimeout(targetTimeout);
            targetTimeout = null;
        }
    }

    function updateLevel() {
        const newLevel =
            calculateLevel();

        if (newLevel !== level) {
            level = newLevel;

            setStatus(
                `Level ${level}!`
            );
        }
    }

    function registerHit() {
        if (!gameRunning) {
            return;
        }

        score += 1;

        updateLevel();
        updateInterface();

        setStatus(
            "Nice! Hit the next target."
        );

        positionTarget();
        scheduleTarget();
    }

    function startTimer() {
        timerInterval =
            setInterval(() => {
                if (!gameRunning) {
                    return;
                }

                timeLeft -= 1;

                updateInterface();

                if (timeLeft <= 0) {
                    timeLeft = 0;
                    updateInterface();
                    finishGame();
                }
            }, 1000);
    }

    function showResult(gameTime) {
        if (!resultElement) {
            return;
        }

        finalScoreElement.textContent =
            score;

        finalLevelElement.textContent =
            level;

        finalTimeElement.textContent =
            gameTime;

        resultElement.hidden =
            false;
    }

    function hideResult() {
        if (resultElement) {
            resultElement.hidden =
                true;
        }
    }

    async function saveScore(gameTime) {
        if (!scoreUrl) {
            setStatus(
                "Game finished."
            );
            return;
        }

        try {
            const response =
                await fetch(
                    scoreUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                csrfToken || "",

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            JSON.stringify({
                                score: score,
                                level: level,
                                game_time:
                                    gameTime,
                            }),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                        "Failed to save score."
                );
            }

            setStatus(
                "Score saved successfully!"
            );

        } catch (error) {
            console.error(
                "Game score error:",
                error
            );

            setStatus(
                "Game finished, but score could not be saved."
            );
        }
    }

    function finishGame() {
        if (!gameRunning) {
            return;
        }

        gameRunning = false;

        stopTimer();
        stopTargetMovement();

        target.hidden = true;

        startButton.disabled =
            false;

        stopButton.disabled =
            true;

        const gameTime =
            Math.max(
                0,
                Math.min(
                    GAME_DURATION,
                    Math.floor(
                        (
                            Date.now() -
                            gameStartedAt
                        ) / 1000
                    )
                )
            );

        setStatus(
            `Game Over — Score: ${score}`
        );

        showResult(
            gameTime
        );

        saveScore(
            gameTime
        );
    }

    function startGame() {
        stopTimer();
        stopTargetMovement();

        score = 0;
        level = 1;
        timeLeft =
            GAME_DURATION;

        gameRunning = true;

        gameStartedAt =
            Date.now();

        hideResult();

        if (overlay) {
            overlay.hidden = true;
        }

        target.hidden = false;

        startButton.disabled =
            true;

        stopButton.disabled =
            false;

        updateInterface();

        setStatus(
            "Game started! Hit the target!"
        );

        positionTarget();
        startTimer();
        scheduleTarget();
    }

    function stopGame() {
        if (!gameRunning) {
            return;
        }

        finishGame();
    }

    target.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            event.stopPropagation();

            registerHit();
        }
    );

    startButton.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            startGame();
        }
    );

    stopButton.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            stopGame();
        }
    );

    if (restartButton) {
        restartButton.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                startGame();
            }
        );
    }

    window.addEventListener(
        "resize",
        () => {
            if (gameRunning) {
                positionTarget();
            }
        }
    );

    target.hidden = true;

    stopButton.disabled =
        true;

    hideResult();

    updateInterface();

    setStatus(
        "Press Start Game to begin."
    );
});