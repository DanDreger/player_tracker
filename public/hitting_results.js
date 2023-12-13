
var db = firebase.firestore();

function renderHittingResults() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    console.log(twoWeeksAgo)

    db.collection("players").get().then((querySnapshot) => {
        let tableBody = document.getElementById('hitting-results');
        tableBody.innerHTML = ''; // Clear existing content

        querySnapshot.forEach((playerDoc) => {
            const player = playerDoc.data();
            let playerSwings = { whiffs: 0, swings: 0, productiveBalls: 0, barrels: 0, totalSwings: 0 };

            db.collection("players").doc(playerDoc.id).collection("swings")
                .where("date", ">=", firebase.firestore.Timestamp.fromDate(twoWeeksAgo))
                .get().then((swingsSnapshot) => {
                    swingsSnapshot.forEach((swingDoc) => {
                        const swingData = swingDoc.data();

                        // Aggregate swing data
                        playerSwings.whiffs += swingData.whiff || 0;
                        playerSwings.swings += swingData.totalSwings || 0;
                        playerSwings.productiveBalls += swingData.productiveBall || 0;
                        playerSwings.barrels += swingData.barrel || 0;
                        playerSwings.totalSwings += swingData.totalSwings || 0;
                    });

                    // Create a row for the player
                    let row = `
                        <tr>
                            <td>${player.number}</td>
                            <td>${player.firstName} ${player.lastName}</td>
                            <td>${playerSwings.whiffs}</td>
                            <td>${playerSwings.swings}</td>
                            <td>${playerSwings.productiveBalls}</td>
                            <td>${playerSwings.barrels}</td>
                            <td>${playerSwings.totalSwings}</td>
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
    renderHittingResults();
});