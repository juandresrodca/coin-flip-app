let remainingTries = 0;

// FUNCTION: Random toss time (max 40s)
function getRandomFlipTime() {
    return Math.floor(Math.random() * 40000) + 1000; // between 1s and 40s
}

// FUNCTION: Random result
function getRandomResult() {
    return Math.random() < 0.5 ? "heads" : "tails";
}

function startFlip() {
    const userChoice = document.getElementById("userChoice").value;
    remainingTries = parseInt(document.getElementById("tries").value);

    flipCoin(userChoice);
}

function flipCoin(userChoice) {
    if (remainingTries <= 0) return;

    const coin = document.getElementById("coin");
    const dashboard = document.getElementById("dashboard");

    dashboard.classList.add("hidden");

    const flipTime = getRandomFlipTime();
    const result = getRandomResult();

    // Start animation
    coin.classList.add("flip");

    setTimeout(() => {
        coin.classList.remove("flip");

        // Set result image
        coin.src = result === "heads" ? "coin-heads.png" : "coin-tails.png";

        remainingTries--;

        // Show dashboard
        dashboard.classList.remove("hidden");

        document.getElementById("resultText").innerText =
            `Result: ${result.toUpperCase()} (You chose ${userChoice.toUpperCase()})`;

        document.getElementById("timeText").innerText =
            `Flip time: ${(flipTime / 1000).toFixed(2)} seconds`;

        document.getElementById("remainingText").innerText =
            `Remaining tries: ${remainingTries}`;

        // Auto next toss if remaining
        if (remainingTries > 0) {
            setTimeout(() => flipCoin(userChoice), 2000);
        }

    }, flipTime);
}