let wordOfTheDay = "";
let validWords = [];
let persistentRedLetters = new Set();
let wrongGuesses = [];

// Load the common 5-letter words list
fetch("static/common_5_letter_words.txt")
    .then(response => response.text())
    .then(data => {
        validWords = data.split("\n").map(word => word.trim()).filter(word => word.length === 5);
        setWordOfTheDay();
    });

// Function to get the word of the day based on the current date
async function setWordOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const hash = await sha256(today);
    const index = parseInt(hash, 16) % validWords.length;
    wordOfTheDay = validWords[index];
    console.log("DEBUG: The correct word is:", wordOfTheDay);
}

// SHA256 hash function using crypto.subtle
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate the input using both the local word list and the Datamuse API
function validateInput() {
    const guess = document.getElementById("guess").value.trim().toLowerCase();
    const submitButton = document.getElementById("submit-button");

    if (guess.length === 5) {
        if (validWords.includes(guess)) {
            submitButton.disabled = false;
        } else {
            // Use a CORS proxy to bypass CORS issues
            const proxyUrl = "https://corsproxy.io/?";
            const apiUrl = `https://api.datamuse.com/words?sp=${guess}&max=1`;

            fetch(proxyUrl + apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0 && data[0].word === guess) {
                        submitButton.disabled = false;
                    } else {
                        submitButton.disabled = true;
                    }
                })
                .catch(() => {
                    submitButton.disabled = true;
                });
        }
    } else {
        submitButton.disabled = true;
    }
}

// Check the guess and provide feedback
function checkGuess() {
    const guess = document.getElementById("guess").value.toLowerCase();

    // Clear the grid before displaying the new guess
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    let redLetters = new Set();
    let orangeLetters = new Set();
    let greenLetters = new Set();

    const guessRow = document.createElement("div");
    guessRow.className = "guess-row";

    for (let i = 0; i < 5; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = guess[i].toUpperCase();

        if (guess[i] === wordOfTheDay[i]) {
            cell.classList.add("correct");
            greenLetters.add(guess[i].toUpperCase());
        } else if (wordOfTheDay.includes(guess[i])) {
            cell.classList.add("misplaced");
            orangeLetters.add(guess[i].toUpperCase());
        } else {
            cell.classList.add("wrong");
            persistentRedLetters.add(guess[i].toUpperCase());
            redLetters.add(guess[i].toUpperCase());
        }

        guessRow.appendChild(cell);
    }

    grid.appendChild(guessRow);

    document.getElementById("red-letters").textContent = Array.from(persistentRedLetters).join(", ");
    document.getElementById("orange-letters").textContent = Array.from(orangeLetters).join(", ");
    document.getElementById("green-letters").textContent = Array.from(greenLetters).join(", ");

    if (guess !== wordOfTheDay) {
        wrongGuesses.push(guess.toUpperCase());
        updateWrongGuessesDisplay();
    }

    // Clear the input box and disable the button
    document.getElementById("guess").value = "";
    document.getElementById("submit-button").disabled = true;

    // If the guess is correct, embed the Wikipedia page
    if (guess === wordOfTheDay) {
        embedWikipediaPage(wordOfTheDay);
    }
}

// Update the wrong guesses display
function updateWrongGuessesDisplay() {
    document.getElementById("wrong-guesses").textContent = `Wrong Guesses: ${wrongGuesses.join(", ")}`;
}

// Embed the Wikipedia page
function embedWikipediaPage(word) {
    const wikiContainer = document.getElementById("wiki-embed-container");
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
    wikiContainer.innerHTML = `
        <h2>Learn More About "${word}"</h2>
        <iframe src="${wikiUrl}" width="100%" height="700px" style="border: none;"></iframe>
    `;
}

// Handle Enter key press to submit the guess
function handleEnter(event) {
    if (event.key === "Enter" && !document.getElementById("submit-button").disabled) {
        checkGuess();
    }
}
