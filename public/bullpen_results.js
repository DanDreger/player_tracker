var db = firebase.firestore();


function fetchAndDisplayAllPitches() {
    const db = firebase.firestore();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    db.collection("players").get().then((querySnapshot) => {
        const promises = [];

        querySnapshot.forEach((playerDoc) => {
            const player = playerDoc.data();

            const promise = db.collection("players").doc(playerDoc.id).collection("pitches")
                .get().then((pitchesSnapshot) => {
                    const filteredPitches = [];

                    pitchesSnapshot.forEach((pitchDoc) => {
                        const pitchData = pitchDoc.data();
                        const pitchDate = pitchData.timestamp.toDate();

                        if (pitchDate >= twoWeeksAgo) {
                            pitchData.playerId = playerDoc.id;
                            pitchData.firstName = player.firstName;
                            pitchData.lastName = player.lastName;
                            pitchData.number = player.number;
                            filteredPitches.push(pitchData);
                        }
                    });

                    return filteredPitches;
                });

            promises.push(promise);
        });

        Promise.all(promises).then((allFilteredPitchesArrays) => {
            const allPitchesData = allFilteredPitchesArrays.flat();
            displayResults(allPitchesData);
        }).catch((error) => {
            console.error("Error getting documents: ", error);
        });
    });
}

function displayResults(filteredPitches) {
    let playerStats = {};
    filteredPitches.forEach(pitch => {
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