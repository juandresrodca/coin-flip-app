let totalTries = 0;
let remainingTries = 0;
let currentRotation = 0;
let isFlipping = false;
let correctGuesses = 0;

// --- PARTICLE BACKGROUND ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        ctx.fillStyle = `rgba(148, 163, 184, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 100; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}
animate();

// --- COIN FLIP LOGIC ---

// Listen for side selection changes to show preview
document.getElementById("userChoice").addEventListener("change", (e) => {
    if (isFlipping) return;
    const side = e.target.value;
    currentRotation = side === "heads" ? 0 : 180;
    const coin = document.getElementById("coin");
    coin.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    coin.style.transform = `rotateY(${currentRotation}deg)`;
});

function startFlip() {
    if (isFlipping) return;

    const decisionValue = document.getElementById("decision").value;
    const choiceValue = document.getElementById("userChoice").value;
    let inputTries = parseInt(document.getElementById("tries").value);
    
    // ENFORCE ODD: Always use an odd number for multiple tosses to avoid session ties
    if (inputTries > 1 && inputTries % 2 === 0) {
        inputTries += 1;
        document.getElementById("tries").value = inputTries;
    }

    totalTries = inputTries;
    remainingTries = totalTries;
    correctGuesses = 0;

    // LOCK UI: Disable inputs during session
    document.getElementById("decision").disabled = true;
    document.getElementById("userChoice").disabled = true;
    document.getElementById("tries").disabled = true;

    const decisionBox = document.getElementById("decisionOutput");
    if (decisionValue && decisionValue.trim() !== "") {
        decisionBox.innerText = `Deciding: ${decisionValue}`;
    } else {
        decisionBox.innerText = "";
    }

    executeToss(choiceValue);
}

function executeToss(userChoice) {
    if (remainingTries <= 0 || isFlipping) return;

    isFlipping = true;
    const coin = document.getElementById("coin");
    const dashboard = document.getElementById("dashboard");
    const mainBtn = document.getElementById("mainBtn");

    dashboard.classList.add("hidden");
    mainBtn.disabled = true;

    // Toss configuration
    const flips = Math.floor(Math.random() * 5) + 5; // 5-10 full rotations
    const result = Math.random() < 0.5 ? "heads" : "tails";
    
    // BUG FIX: Ensure rotation always lands on the correct side relative to 'heads' (0) or 'tails' (180)
    const targetExtra = result === "heads" ? 0 : 180;
    let newRotation = currentRotation + flips * 360;
    
    // Adjust newRotation to the correct face
    const currentModulo = newRotation % 360;
    if (result === "heads") {
        newRotation -= currentModulo;
    } else {
        newRotation = newRotation - currentModulo + 180;
    }
    
    // Ensure we always rotate forward
    if (newRotation <= currentRotation) newRotation += 360;
    currentRotation = newRotation;
    
    // Smooth transition time
    const flipDuration = 2000;
    coin.style.transition = `transform ${flipDuration}ms cubic-bezier(0.1, 0, 0.3, 1)`;
    coin.style.transform = `rotateY(${currentRotation}deg)`;

    // Live timer logic
    const timerElem = document.getElementById("live-timer");
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerElem.innerText = `Flipping... ${elapsed.toFixed(2)}s`;
    }, 50);

    setTimeout(() => {
        clearInterval(timerInterval);
        timerElem.innerText = "";
        isFlipping = false;
        remainingTries--;

        const isCorrect = result === userChoice;
        if (isCorrect) correctGuesses++;

        // Update UI
        dashboard.classList.remove("hidden");
        document.getElementById("resultText").innerHTML = 
            `RESULT: <span style="color: ${result === 'heads' ? '#818cf8' : '#c084fc'}">${result.toUpperCase()}</span> ${isCorrect ? '✅' : '❌'}`;
        
        document.getElementById("timeText").innerText = 
            `Choice: ${userChoice.toUpperCase()}`;
        
        document.getElementById("remainingText").innerText = 
            remainingTries > 0 ? `Tosses remaining: ${remainingTries}` : "All tosses complete!";

        if (remainingTries === 0) {
            const finalMsg = document.getElementById("finalSummary");
            finalMsg.classList.remove("hidden");
            finalMsg.classList.add("animate-pop");
            
            if (correctGuesses > totalTries / 2) {
                finalMsg.innerText = "Yeah! Your choice was the right one! 🎉";
                finalMsg.style.color = "#4ade80";
            } else if (correctGuesses === totalTries / 2) {
                finalMsg.innerText = "It's a tie! Balanced luck. ⚖️";
                finalMsg.style.color = "#facc15";
            } else {
                finalMsg.innerText = "Better luck next time! The coin had other plans. 🪙";
                finalMsg.style.color = "#f87171";
            }
            
            mainBtn.disabled = false;
            mainBtn.innerText = "Start New Sequence";
            mainBtn.onclick = () => location.reload();
        } else {
            mainBtn.disabled = false;
            mainBtn.innerText = `Toss your ${totalTries - remainingTries + 1}th coin`;
            mainBtn.onclick = () => executeToss(userChoice);
        }

    }, flipDuration);
}