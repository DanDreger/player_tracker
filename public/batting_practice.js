
var db = firebase.firestore();

function renderBattingPracticePlayers() {
    console.log('inside render batters')
    db.collection("players").get().then((querySnapshot) => {
        let playersHtml = '<div class="container mt-3">';
        querySnapshot.forEach((doc) => {
            const player = doc.data();
            const playerId = doc.id; // Assuming doc.id contains the player's ID

            playersHtml += `
            <div class="row mb-2">
            <div class="col-1">${player.number}</div>
            <div class="col-8">${player.firstName} ${player.lastName}</div>
            <div class="col-12">
              <div class="row">
                <div class="col-3 swing-btn-container"><button class="btn btn-danger swing-btn" data-player-id="${playerId}" data-swing-type="whiff">Whiff</button></div>
                <div class="col-3 swing-btn-container"><button class="btn btn-secondary swing-btn" data-player-id="${playerId}" data-swing-type="contact">Contact</button></div>
                <div class="col-3 swing-btn-container"><button class="btn btn-primary swing-btn" data-player-id="${playerId}" data-swing-type="productiveBall">Productive Ball</button></div>
                <div class="col-3 swing-btn-container"><button class="btn btn-success swing-btn" data-player-id="${playerId}" data-swing-type="barrel">Barrel</button></div>
              </div>
            </div>
          </div>`;
        });
        playersHtml += '</div>';
        document.getElementById('battersList').innerHTML = playersHtml;
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

function recordSwing(playerId, swingType) {
    const now = firebase.firestore.Timestamp.now(); // Firestore Timestamp for the current moment
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const swingDocRef = db.collection('players').doc(playerId).collection('swings').doc(today);

    return db.runTransaction((transaction) => {
        return transaction.get(swingDocRef).then((swingDoc) => {
            if (!swingDoc.exists) {
                transaction.set(swingDocRef, {
                    [swingType]: 1,
                    totalSwings: 1,
                    date: now
                });
            } else {
                let newCount = (swingDoc.data()[swingType] || 0) + 1;
                transaction.update(swingDocRef, {
                    [swingType]: newCount,
                    totalSwings: firebase.firestore.FieldValue.increment(1),
                    date: now // Update the date to the current timestamp
                });
            }
        });
    });
}

// Example usage
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('swing-btn')) {
        console.log('logging swing')
        const playerId = event.target.getAttribute('data-player-id');
        const swingType = event.target.getAttribute('data-swing-type');
        console.log(playerId)
        console.log(swingType)
        recordSwing(playerId, swingType);
    }
});


// Call this function when the batting_practice_app.html page loads
document.addEventListener('DOMContentLoaded', function () {
    renderBattingPracticePlayers();
});