var db = firebase.firestore();


function fetchAndDisplayAllPitches() {
    const db = firebase.firestore();
    const allPitchesData = [];

    db.collection("players").get().then(playersSnapshot => {
        playersSnapshot.forEach(playerDoc => {
            const playerId = playerDoc.id;
            const playerData = playerDoc.data(); // Get player details

            db.collection("players").doc(playerId).collection("pitches").get()
                .then(pitchesSnapshot => {
                    pitchesSnapshot.forEach(pitchDoc => {
                        const pitchData = pitchDoc.data();
                        console.log('playerdata', playerData)
                        pitchData.playerId = playerId;
                        pitchData.firstName = playerData.firstName;
                        pitchData.lastName = playerData.lastName;
                        pitchData.number = playerData.number;
                        allPitchesData.push(pitchData);
                    });
                    displayResults(allPitchesData); // Call displayResults after fetching all data
                });
        });
    });
}

function displayResults(pitchesData) {
    let playerStats = {};
    pitchesData.forEach(pitch => {
        if (!playerStats[pitch.playerId]) {
            playerStats[pitch.playerId] = {
                hit: 0,
                nearMiss: 0,
                miss: 0,
                missTypes: {},
                firstName: pitch.firstName, // Aggregate player's first name
                lastName: pitch.lastName,   // Aggregate player's last name
                number: pitch.number        // Aggregate player's number
            };
        }
        const player = playerStats[pitch.playerId];
        if (pitch.result === "Hit") {
            player.hit++;
        } else if (pitch.result.includes("Near Miss")) {
            player.nearMiss++;
        } else if (pitch.result.toLowerCase().startsWith("miss") && !pitch.result.includes("Near Miss")) {
            player.miss++;
        }

        if (pitch.result !== "Hit") {
            const missType = pitch.result.replace(/near|miss|Hit/gi, "").trim();
            player.missTypes[missType] = (player.missTypes[missType] || 0) + 1;
        }
    });




    let resultsTable = '';
    Object.keys(playerStats).forEach(playerId => {
        const player = playerStats[playerId];
        const totalPitches = player.hit + player.nearMiss + player.miss;
        const hitPercentage = totalPitches > 0 ? Math.round((player.hit / totalPitches) * 100) : 0;
        const nearMissPercentage = totalPitches > 0 ? Math.round((player.nearMiss / totalPitches) * 100) : 0;
        const missPercentage = totalPitches > 0 ? Math.round((player.miss / totalPitches) * 100) : 0;
        const mostCommonMiss = Object.keys(player.missTypes).sort((a, b) => player.missTypes[b] - player.missTypes[a])[0] || '';

        resultsTable += `<tr>
                            <td class="d-none d-md-table-cell">${player.number}</td>
                            <td class="d-none d-md-table-cell">${player.firstName}</td>
                            <td>${player.lastName}</td>
                            <td>${totalPitches}</td>
                            <td>${hitPercentage}%</td>
                            <td>${nearMissPercentage}%</td>
                            <td>${missPercentage}%</td>
                            <td>${mostCommonMiss}</td>
                        </tr>`;
    });
    document.getElementById('bullpen-results').getElementsByTagName('tbody')[0].innerHTML = resultsTable;
}

document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayAllPitches();
});