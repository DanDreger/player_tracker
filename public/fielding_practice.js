
var db = firebase.firestore();

function renderPlayers() {
    db.collection("players").get().then((querySnapshot) => {
        let playersHtml = '<div class="container mt-3">';
        querySnapshot.forEach((doc) => {
            const player = doc.data();
            const playerId = doc.id;

            playersHtml += `
                <div class="row mb-2">
                    <div class="col-4">${player.number}</div>
                    <div class="col-6">${player.firstName} ${player.lastName}</div>
                    <div class="col-12">
                        <button class="btn btn-warning fielding-btn" data-player-id="${playerId}" data-fielding-type="groundBallError">GB Error</button>
                        <button class="btn btn-danger fielding-btn" data-player-id="${playerId}" data-fielding-type="flyBallError">FB Error</button>
                        <button class="btn btn-secondary fielding-btn" data-player-id="${playerId}" data-fielding-type="throwingError">Throw Error</button>
                        <button class="btn btn-success fielding-btn" data-player-id="${playerId}" data-fielding-type="playMade">Play Made</button>
                    </div>
                </div>`;
        });
        playersHtml += '</div>';
        document.getElementById('playersList').innerHTML = playersHtml;
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

function recordFieldingChance(playerId, fieldType) {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const fieldingDocRef = db.collection('players').doc(playerId).collection('Fielding Chances').doc(today);

    return db.runTransaction((transaction) => {
        return transaction.get(fieldingDocRef).then((fieldingDoc) => {
            if (!fieldingDoc.exists) {
                let initialData = {
                    chances: 1,
                    groundBallError: 0,
                    flyBallError: 0,
                    throwingError: 0,
                    playMade: 0
                };
                initialData[fieldType] = 1;
                transaction.set(fieldingDocRef, initialData);
            } else {
                let incrementObject = { chances: firebase.firestore.FieldValue.increment(1) };
                incrementObject[fieldType] = firebase.firestore.FieldValue.increment(1);
                transaction.update(fieldingDocRef, incrementObject);
            }
        });
    });
}

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('fielding-btn')) {
        const playerId = event.target.getAttribute('data-player-id');
        const fieldType = event.target.getAttribute('data-fielding-type');
        recordFieldingChance(playerId, fieldType);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    renderPlayers();
});