
var db = firebase.firestore();

function populatePlayersDropdown() {
    const dropdown = document.getElementById('playersDropdown');

    db.collection('players').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const firstName = doc.data().firstName;
            const lastName = doc.data().lastName;
            const playerName = firstName + ' ' + lastName; // Concatenate the name
            const option = document.createElement('option');
            option.value = doc.id; // Set option value to player's document ID
            option.textContent = playerName;
            dropdown.appendChild(option);
        });
    }).catch((error) => {
        console.error("Error fetching player data: ", error);
    });
}

// Call the function to populate the dropdown
populatePlayersDropdown();

function handleButtonClick(button) {
    event.preventDefault();

    const pitchResult = button.getAttribute('data-value');
    const selectedRadio = document.querySelector('input[name="gridSelection"]:checked');
    const radioValue = selectedRadio ? selectedRadio.value : null;

    // Retrieve the selected windup
    const selectedWindup = document.querySelector('input[name="windup"]:checked');
    const windupValue = selectedWindup ? selectedWindup.value : null;

    const formData = {
        playerId: document.getElementById('playersDropdown').value,
        calledLocation: radioValue,
        result: pitchResult,
        pitchType: document.querySelector('input[name="pitchType"]:checked')?.value,
        windup: windupValue, // Include the windup value
        date: new Date().toISOString().split('T')[0]
    };

    sendToFirestore(formData);
}


// Handle the non-submit buttons
document.querySelectorAll('#targetButtons button[type="button"]').forEach(button => {
    button.addEventListener('click', function () {
        // Manually submit the form
        document.getElementById('pitchForm').submit();
    });
});

function sendToFirestore(data) {
    const db = firebase.firestore();
    const playerRef = db.collection('players').doc(data.playerId);
    const pitchesRef = playerRef.collection('pitches');

    pitchesRef.add({
        calledLocation: data.calledLocation,
        result: data.result,
        pitchType: data.pitchType,
        windup: data.windup,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => {
        console.error("Error adding pitch: ", error);
    });
}

