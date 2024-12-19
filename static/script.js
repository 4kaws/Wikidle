let wordOfTheDay = "";
let validWords = [];
let persistentRedLetters = new Set();

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

// Validate the input and enable/disable the submit button
// Validate the input using both the local word list and the Datamuse API
function validateInput() {
    const guess = document.getElementById("guess").value.trim().toLowerCase();
    const submitButton = document.getElementById("submit-button");

    if (guess.length === 5) {
        if (validWords.includes(guess)) {
            submitButton.disabled = false;
        } else {
            // Check if the word exists in English using the Datamuse API
            fetch(`https://api.datamuse.com/words?sp=${guess}&max=1`)
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


function checkGuess() {
    const guess = document.getElementById("guess").value.toLowerCase();

    const grid = document.getElementById("grid");
    grid.innerHTML = "";  // Clear the grid for new guess

    let redLetters = new Set();
    let orangeLetters = new Set();
    let greenLetters = new Set();

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

        grid.appendChild(cell);
    }

    document.getElementById("red-letters").textContent = Array.from(persistentRedLetters).join(", ");
    document.getElementById("orange-letters").textContent = Array.from(orangeLetters).join(", ");
    document.getElementById("green-letters").textContent = Array.from(greenLetters).join(", ");

    // Clear the input box and disable the button
    document.getElementById("guess").value = "";
    document.getElementById("submit-button").disabled = true;

    // If the guess is correct, embed the Wikipedia page
    if (guess === wordOfTheDay) {
        embedWikipediaPage(wordOfTheDay);
    }
}

function embedWikipediaPage(word) {
    const wikiContainer = document.getElementById("wiki-embed-container");
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
    wikiContainer.innerHTML = `
        <h2>Learn More About "${word}"</h2>
        <iframe src="${wikiUrl}" width="100%" height="500px" style="border: none;"></iframe>
    `;
}

// Handle Enter key press to submit the guess
function handleEnter(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
}
