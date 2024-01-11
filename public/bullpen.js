
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

    // Retrieve the selected pitch type
    const selectedPitchType = document.querySelector('input[name="pitchType"]:checked');
    const pitchTypeValue = selectedPitchType ? selectedPitchType.value : null;

    const pitchResult = button.getAttribute('data-value');
    const selectedRadio = document.querySelector('input[name="gridSelection"]:checked');
    const radioValue = selectedRadio ? selectedRadio.value : null;

    const formData = {
        playerId: document.getElementById('playersDropdown').value, // Player ID
        calledLocation: radioValue,
        result: pitchResult,
        pitchType: pitchTypeValue, // Include the pitch type
        date: new Date().toISOString().split('T')[0] // Current date
    };
    console.log(formData);

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
    const dateRef = playerRef.collection('bullpens').doc(data.date);
    const pitchesRef = dateRef.collection('pitches');

    pitchesRef.get().then(snapshot => {
        const pitchNumber = snapshot.size + 1;
        if (!pitchNumber) {
            console.error("Pitch number is undefined");
            return;
        }

        pitchesRef.doc(pitchNumber.toString()).set({
            calledLocation: data.calledLocation,
            result: data.result,
            pitchType: data.pitchType, // Save the pitch type
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(error => {
        console.error("Error adding pitch: ", error);
    });
}

