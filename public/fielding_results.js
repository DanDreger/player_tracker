
var db = firebase.firestore();

function renderFieldingResults() {
    db.collection("players").get().then((querySnapshot) => {
        let tableBody = document.getElementById('fielding-results');
        tableBody.innerHTML = ''; // Clear existing content

        querySnapshot.forEach((playerDoc) => {
            const player = playerDoc.data();
            const playerId = playerDoc.id;
            let playerFielding = { groundBallError: 0, flyBallError: 0, throwingError: 0, playMade: 0 };

            db.collection("players").doc(playerId).collection("Fielding Chances")
                .get().then((fieldingSnapshot) => {
                    fieldingSnapshot.forEach((chanceDoc) => {
                        const chanceData = chanceDoc.data();

                        // Aggregate fielding data
                        playerFielding.groundBallError += chanceData.groundBallError || 0;
                        playerFielding.flyBallError += chanceData.flyBallError || 0;
                        playerFielding.throwingError += chanceData.throwingError || 0;
                        playerFielding.playMade += chanceData.playMade || 0;
                    });

                    // Create a row for the player
                    let row = `
                        <tr>
                            <td>${player.number}</td>
                            <td>${player.firstName} ${player.lastName}</td>
                            <td>${playerFielding.groundBallError}</td>
                            <td>${playerFielding.flyBallError}</td>
                            <td>${playerFielding.throwingError}</td>
                            <td>${playerFielding.playMade}</td>
                        </tr>`;

                    // Append the row to the table body
                    tableBody.innerHTML += row;
                });
        });
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderFieldingResults();
});