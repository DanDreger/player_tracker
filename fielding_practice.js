
// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDD_dZ3mGLRx5iIZkeTdig8WcPA6M_5WFw",
    authDomain: "player-tracker-816e1.firebaseapp.com",
    projectId: "player-tracker-816e1",
    storageBucket: "player-tracker-816e1.appspot.com",
    messagingSenderId: "252085866739",
    appId: "1:252085866739:web:c2e73a62787bb7a636a786"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

function renderPlayers() {
    db.collection("players").get().then((querySnapshot) => {
        let playersHtml = '<div class="container mt-3">';
        querySnapshot.forEach((doc) => {
            const player = doc.data();
            const playerId = doc.id;

            playersHtml += `
                <div class="row mb-2">
                    <div class="col-md-2">${player.number}</div>
                    <div class="col-md-4">${player.firstName} ${player.lastName}</div>
                    <div class="col-md-6">
                        <button class="btn btn-warning fielding-btn" data-player-id="${playerId}" data-fielding-type="groundBallError">Ground Ball Error</button>
                        <button class="btn btn-danger fielding-btn" data-player-id="${playerId}" data-fielding-type="flyBallError">Fly Ball Error</button>
                        <button class="btn btn-secondary fielding-btn" data-player-id="${playerId}" data-fielding-type="throwingError">Throwing Error</button>
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