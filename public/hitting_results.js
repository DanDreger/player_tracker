
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
            let playerSwings = { whiffs: 0, contacts: 0, productiveBalls: 0, barrels: 0, totalSwings: 0 };

            db.collection("players").doc(playerDoc.id).collection("swings")
                .where("date", ">=", firebase.firestore.Timestamp.fromDate(twoWeeksAgo))
                .get().then((swingsSnapshot) => {
                    // Inside the db.collection("players").doc(playerDoc.id).collection("swings").get().then((swingsSnapshot) => {...}) callback
                    swingsSnapshot.forEach((swingDoc) => {
                        const swingData = swingDoc.data();
                        // Aggregate swing data
                        playerSwings.whiffs += swingData.whiff || 0;
                        playerSwings.swings += swingData.totalSwings || 0;
                        playerSwings.productiveBalls += swingData.productiveBall || 0;
                        playerSwings.barrels += swingData.barrel || 0;
                        playerSwings.totalSwings += swingData.totalSwings || 0;
                        playerSwings.contacts += swingData.contact || 0
                    });


                    // After accumulating counts, calculate rates
                    const whiffsRate = playerSwings.totalSwings > 0 ? Math.round(playerSwings.whiffs / playerSwings.totalSwings * 100) : 0;
                    const contactRate = playerSwings.totalSwings > 0 ? Math.round(playerSwings.contacts / playerSwings.totalSwings * 100) : 0;
                    const productiveBallsRate = playerSwings.totalSwings > 0 ? Math.round(playerSwings.productiveBalls / playerSwings.totalSwings * 100) : 0;
                    const barrelsRate = playerSwings.totalSwings > 0 ? Math.round(playerSwings.barrels / playerSwings.totalSwings * 100) : 0;
                    const totalSwings = (playerSwings.totalSwings)

                    // Create a row for the player
                    let row = `
                    <tr>
                    <td>${player.number}</td>
                    <td>${player.lastName}</td>
                    <td>${whiffsRate}%</td>
                    <td>${contactRate}%</td>
                    <td>${productiveBallsRate}%</td>
                    <td>${barrelsRate}%</td>
                    <td>${totalSwings}</td>
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