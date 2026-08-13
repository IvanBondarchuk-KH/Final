document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    console.log("🎮 PS Lounge Game JS loaded");

    const game = document.querySelector(".game-page");

    if (!game) {
        console.error("❌ .game-page not found");
        return;
    }

    const arena = document.getElementById("game-arena");
    const target = document.getElementById("game-target");

    const startButton =
        document.getElementById("game-start");

    const stopButton =
        document.getElementById("game-stop");

    const restartButton =
        document.getElementById("game-restart");

    const scoreElement =
        document.getElementById("game-score");

    const levelElement =
        document.getElementById("game-level");

    const timeElement =
        document.getElementById("game-time");

    const statusElement =
        document.getElementById("game-status");

    const overlay =
        document.getElementById("game-overlay");

    const resultElement =
        document.getElementById("game-result");

    const finalScoreElement =
        document.getElementById("final-score");

    const finalLevelElement =
        document.getElementById("final-level");

    const finalTimeElement =
        document.getElementById("final-time");

    // ==========================================
    // CHECK ELEMENTS
    // ==========================================

    console.log("Game elements:", {
        game,
        arena,
        target,
        startButton,
        stopButton,
        scoreElement,
        levelElement,
        timeElement,
    });

    if (
        !arena ||
        !target ||
        !startButton ||
        !stopButton ||
        !scoreElement ||
        !levelElement ||
        !timeElement
    ) {
        console.error(
            "❌ Game initialization failed. Missing elements."
        );

        return;
    }

    // ==========================================
    // CONFIG
    // ==========================================

    const scoreUrl =
        game.dataset.scoreUrl ||
        "/game/score/";

    const csrfToken =
        game.dataset.csrfToken ||
        getCookie("csrftoken");

    const GAME_DURATION = 30;

    // ==========================================
    // STATE
    // ==========================================

    let score = 0;
    let level = 1;
    let timeLeft = GAME_DURATION;

    let gameRunning = false;

    let timerInterval = null;

    let gameStartedAt = null;

    // ==========================================
    // COOKIE
    // ==========================================

    function getCookie(name) {
        const cookies =
            document.cookie.split(";");

        for (const cookie of cookies) {
            const trimmed =
                cookie.trim();

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

    // ==========================================
    // UI
    // ==========================================

    function updateInterface() {
        scoreElement.textContent =
            String(score);

        levelElement.textContent =
            String(level);

        timeElement.textContent =
            String(timeLeft);
    }

    function setStatus(text) {
        if (statusElement) {
            statusElement.textContent =
                text;
        }
    }

    // ==========================================
    // LEVEL
    // ==========================================

    function updateLevel() {
        level =
            Math.floor(score / 10) + 1;

        levelElement.textContent =
            String(level);
    }

    // ==========================================
    // TARGET POSITION
    // ==========================================

    function positionTarget() {
        const arenaWidth =
            arena.clientWidth;

        const arenaHeight =
            arena.clientHeight;

        const targetSize =
            Math.max(
                46,
                82 -
                    (level - 1) * 6
            );

        const padding = 40;

        /*
         * Because CSS uses:
         *
         * transform:
         * translate(-50%, -50%);
         *
         * left/top are the center
         * coordinates.
         */

        const minX =
            padding +
            targetSize / 2;

        const maxX =
            arenaWidth -
            padding -
            targetSize / 2;

        const minY =
            padding +
            targetSize / 2;

        const maxY =
            arenaHeight -
            padding -
            targetSize / 2;

        const x =
            minX +
            Math.random() *
                Math.max(
                    0,
                    maxX - minX
                );

        const y =
            minY +
            Math.random() *
                Math.max(
                    0,
                    maxY - minY
                );

        target.style.width =
            `${targetSize}px`;

        target.style.height =
            `${targetSize}px`;

        target.style.left =
            `${x}px`;

        target.style.top =
            `${y}px`;

        console.log(
            "🎯 Target positioned:",
            {
                x,
                y,
                size: targetSize,
            }
        );
    }

    // ==========================================
    // REGISTER HIT
    // ==========================================

    function registerHit() {
        console.log(
            "🟢 registerHit() called"
        );

        console.log(
            "Game running:",
            gameRunning
        );

        console.log(
            "Score before:",
            score
        );

        if (!gameRunning) {
            console.warn(
                "⚠️ Click ignored because game is not running."
            );

            return;
        }

        score += 1;

        updateLevel();

        updateInterface();

        setStatus(
            `Hit! Score: ${score}`
        );

        console.log(
            "🔥 HIT!",
            {
                score,
                level,
            }
        );

        /*
         * Move target after successful hit.
         */
        positionTarget();
    }

    // ==========================================
    // VERY IMPORTANT:
    // CLICK HANDLER ON ARENA
    // ==========================================

    arena.addEventListener(
        "click",
        (event) => {
            console.log(
                "🖱️ Arena click:",
                event.target
            );

            const clickedTarget =
                event.target.closest(
                    "#game-target"
                );

            if (!clickedTarget) {
                return;
            }

            console.log(
                "🎯 TARGET CLICK DETECTED!"
            );

            event.preventDefault();
            event.stopPropagation();

            registerHit();
        }
    );

    // ==========================================
    // START GAME
    // ==========================================

    function startGame() {
        console.log(
            "▶️ START GAME"
        );

        score = 0;
        level = 1;
        timeLeft =
            GAME_DURATION;

        gameRunning = true;

        gameStartedAt =
            Date.now();

        updateInterface();

        setStatus(
            "Game started! Hit the target!"
        );

        if (overlay) {
            overlay.hidden = true;
        }

        target.hidden = false;

        startButton.disabled = true;
        stopButton.disabled = false;

        positionTarget();

        startTimer();

        console.log(
            "✅ Game running:",
            gameRunning
        );
    }

    // ==========================================
    // TIMER
    // ==========================================

    function startTimer() {
        stopTimer();

        timerInterval =
            setInterval(() => {
                if (!gameRunning) {
                    return;
                }

                timeLeft -= 1;

                if (timeLeft < 0) {
                    timeLeft = 0;
                }

                updateInterface();

                if (timeLeft === 0) {
                    finishGame();
                }
            }, 1000);
    }

    function stopTimer() {
        if (
            timerInterval !== null
        ) {
            clearInterval(
                timerInterval
            );

            timerInterval = null;
        }
    }

    // ==========================================
    // FINISH GAME
    // ==========================================

    function finishGame() {
        if (!gameRunning) {
            return;
        }

        console.log(
            "🏁 GAME FINISHED",
            {
                score,
                level,
                timeLeft,
            }
        );

        gameRunning = false;

        stopTimer();

        target.hidden = true;

        startButton.disabled = false;
        stopButton.disabled = true;

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

        showResult(gameTime);

        saveScore(gameTime);
    }

    // ==========================================
    // RESULT
    // ==========================================

    function showResult(gameTime) {
        if (!resultElement) {
            return;
        }

        if (finalScoreElement) {
            finalScoreElement.textContent =
                String(score);
        }

        if (finalLevelElement) {
            finalLevelElement.textContent =
                String(level);
        }

        if (finalTimeElement) {
            finalTimeElement.textContent =
                String(gameTime);
        }

        resultElement.hidden = false;
    }

    function hideResult() {
        if (resultElement) {
            resultElement.hidden = true;
        }
    }

    // ==========================================
    // STOP GAME
    // ==========================================

    function stopGame() {
        console.log(
            "⏹ STOP GAME"
        );

        if (!gameRunning) {
            return;
        }

        finishGame();
    }

    // ==========================================
    // SAVE SCORE
    // ==========================================

    async function saveScore(gameTime) {
        console.log(
            "💾 Saving score:",
            {
                score,
                level,
                gameTime,
            }
        );

        try {
            const formData =
                new URLSearchParams();

            formData.append(
                "score",
                String(score)
            );

            formData.append(
                "level",
                String(level)
            );

            formData.append(
                "game_time",
                String(gameTime)
            );

            const response =
                await fetch(
                    scoreUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded; charset=UTF-8",

                            "X-CSRFToken":
                                csrfToken || "",

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            formData.toString(),
                    }
                );

            const data =
                await response.json();

            console.log(
                "Server response:",
                data
            );

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                    "Score saving failed."
                );
            }

            setStatus(
                "Score saved successfully!"
            );

        } catch (error) {
            console.error(
                "❌ Score save error:",
                error
            );

            setStatus(
                "Game finished, but score could not be saved."
            );
        }
    }

    // ==========================================
    // BUTTONS
    // ==========================================

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

                hideResult();

                startGame();
            }
        );
    }

    // ==========================================
    // RESIZE
    // ==========================================

    window.addEventListener(
        "resize",
        () => {
            if (gameRunning) {
                positionTarget();
            }
        }
    );

    // ==========================================
    // INITIAL STATE
    // ==========================================

    target.hidden = true;

    stopButton.disabled = true;

    hideResult();

    updateInterface();

    setStatus(
        "Press Start Game to begin."
    );

    console.log(
        "✅ PS Lounge Game initialized"
    );
});