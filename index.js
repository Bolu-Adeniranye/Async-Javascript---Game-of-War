let deckId;
let computerScore = 0;
let myScore = 0;
const cardsContainer = document.getElementById("cards");
const newDeckBtn = document.getElementById("new-deck");
const drawCardBtn = document.getElementById("draw-cards");
const winnerHeading = document.getElementById("winner-text");
const remainingCardsEl = document.getElementById("remaining-cards"); // Updated to use the new element
const computerScoreEl = document.getElementById("computer-score");
const myScoreEl = document.getElementById("my-score");

function handleClick() {
    console.log("New deck button clicked");
    fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/")
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            deckId = data.deck_id;
            console.log("Deck ID:", deckId);

            // Reset the UI and scores
            remainingCardsEl.innerHTML = `Remaining Cards: ${data.remaining}`;
            cardsContainer.children[0].innerHTML = ``;
            cardsContainer.children[1].innerHTML = ``;
            computerScore = 0;
            myScore = 0;
            computerScoreEl.textContent = `Computer score: ${computerScore}`;
            myScoreEl.textContent = `My score: ${myScore}`;
            winnerHeading.textContent = ``;
            drawCardBtn.disabled = false;
        })
        .catch(err => console.error('Error fetching new deck:', err));
}

newDeckBtn.addEventListener("click", handleClick);

drawCardBtn.addEventListener("click", () => {
    if (!deckId) {
        console.error('No deck ID available. Please shuffle a new deck.');
        return;
    }

    fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Drawn cards:", data.cards);

            remainingCardsEl.innerHTML = `Remaining Cards: ${data.remaining}`;
            cardsContainer.children[0].innerHTML = `
                <img src=${data.cards[0].image} class="card" />
            `;
            cardsContainer.children[1].innerHTML = `
                <img src=${data.cards[1].image} class="card" />
            `;
            const winnerText = determineCardWinner(data.cards[0], data.cards[1]);
            winnerHeading.textContent = `${winnerText}`;

            if (data.remaining === 0) {
                drawCardBtn.disabled = true;
                // Display final winner message
                if (computerScore > myScore) {
                    winnerHeading.textContent = "The computer won the game!";
                } else if (myScore > computerScore) {
                    winnerHeading.textContent = "You won the game!";
                } else {
                    winnerHeading.textContent = "It's a tie game!";
                }
            }
        })
        .catch(err => console.error('Error drawing cards:', err));
});

function determineCardWinner(card1, card2) {
    const valueOptions = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];
    const card1ValueIndex = valueOptions.indexOf(card1.value);
    const card2ValueIndex = valueOptions.indexOf(card2.value);

    if (card1ValueIndex > card2ValueIndex) {
        computerScore++;
        computerScoreEl.textContent = `Computer score: ${computerScore}`;
        return "Computer wins!";
    } else if (card1ValueIndex < card2ValueIndex) {
        myScore++;
        myScoreEl.textContent = `My score: ${myScore}`;
        return "You win!";
    } else {
        return "War!";
    }
}
