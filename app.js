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

// Function to handle form submission
function updatePlayer() {
    var playerNumber = document.getElementById('playerNumber').value;
    var playerFirstName = document.getElementById('playerFirstName').value;
    var playerLastName = document.getElementById('playerLastName').value;
    // Handle positions data as needed
    // Collect positions
    let positions = [];
    document.querySelectorAll('.position-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            positions.push(checkbox.value);
        }
    });

    // Add data to Firestore
    db.collection("players").add({
        number: playerNumber,
        firstName: playerFirstName,
        lastName: playerLastName,
        positions: positions // Add the positions array
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            // ...existing code to clear input fields and handle response
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
            // ...existing error handling code
        });

    displayPlayers();
}

function displayPlayers() {
    db.collection("players").get().then((querySnapshot) => {
        let playersHtml = '<div class="container mt-3">';

        // Add a title
        playersHtml += '<h3>Player List</h3>';

        // Add a header row
        playersHtml += `
            <div class="row mb-2 font-weight-bold">
                <div class="col-md-2">Number</div>
                <div class="col-md-4">Name</div>
                <div class="col-md-6">Positions</div>
            </div>`;

        // Add player data rows
        querySnapshot.forEach((doc) => {
            const player = doc.data();
            const positions = Array.isArray(player.positions) ? player.positions.join(', ') : 'No positions';
            playersHtml += `
                <div class="row mb-2">
                    <div class="col-md-2">${player.number}</div>
                    <div class="col-md-3">${player.firstName} ${player.lastName}</div>
                    <div class="col-md-5">${positions}</div>
                `;

            // Add an 'Update Player' button
            playersHtml += `
                <div class="col-md-2">
                    <button class="btn btn-primary" onclick="openPlayerModal('${doc.id}')">Update Player</button>
                </div>
            </div>`;
        });

        document.getElementById('playersList').innerHTML = playersHtml;
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

let currentPlayerId = null; // Global variable to keep track of the current player being edited

function openPlayerModal(playerId = null) {
    // Set the global variable
    currentPlayerId = playerId;
    console.log('current player is ' + currentPlayerId)

    if (playerId) {
        // Fetch player data from Firestore
        db.collection("players").doc(playerId).get().then((doc) => {
            if (doc.exists) {
                const playerData = doc.data();
                // Populate the modal with this data
                document.getElementById('playerNumber').value = playerData.number;
                document.getElementById('playerFirstName').value = playerData.firstName;
                document.getElementById('playerLastName').value = playerData.lastName;
                // Loop through checkboxes
                document.querySelectorAll('.position-checkbox').forEach(checkbox => {
                    checkbox.checked = playerData.positions && playerData.positions.includes(checkbox.value);
                });
            }
        }).catch((error) => {
            console.error("Error getting player: ", error);
        });
    } else {
        // Clear the modal fields for adding a new player
        document.getElementById('playerNumber').value = '';
        document.getElementById('playerFirstName').value = '';
        document.getElementById('playerLastName').value = '';

        document.querySelectorAll('.position-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

    }
    $('#playerModal').modal('show');
}

document.getElementById('savePlayerChanges').addEventListener('click', function () {

    const playerNumber = document.getElementById('playerNumber').value;
    const playerFirstName = document.getElementById('playerFirstName').value;
    const playerLastName = document.getElementById('playerLastName').value;

    let positions = [];
    document.querySelectorAll('.position-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            positions.push(checkbox.value);
        }
    });

    const playerData = {
        number: playerNumber,
        firstName: playerFirstName,
        lastName: playerLastName,
        positions: positions
    };

    if (currentPlayerId) {
        // Update existing player
        console.log('existing player');
        db.collection('players').doc(currentPlayerId).update(playerData)
            .then(() => {
                console.log("Player updated successfully");
                $('#playerModal').modal('hide'); // Hide the modal
                displayPlayers(); // Call the function that fetches and displays player data
            })
            .catch((error) => {
                console.error("Error updating player: ", error);
            });
    } else {
        // Add new player
        console.log('inside the else block')
        db.collection('players').add(playerData)
            .then(() => {
                console.log("Player updated successfully");
                $('#playerModal').modal('hide'); // Hide the modal
                displayPlayers(); // Call the function that fetches and displays player data
            })
            .catch((error) => {
                console.error("Error updating player: ", error);
            });
    }
});

// Render registered players on page FontFaceSetLoadEvent
document.addEventListener('DOMContentLoaded', function () {
    displayPlayers();
});
