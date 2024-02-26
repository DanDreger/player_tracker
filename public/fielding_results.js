
var db = firebase.firestore();

// function renderFieldingResults() {
//     db.collection("players").get().then((querySnapshot) => {
//         let tableBody = document.getElementById('fielding-results');
//         tableBody.innerHTML = ''; // Clear existing content

//         querySnapshot.forEach((playerDoc) => {
//             const player = playerDoc.data();
//             const playerId = playerDoc.id;
//             let playerFielding = { groundBallError: 0, flyBallError: 0, throwingError: 0, playMade: 0 };
//             console.log('player', player)
//             db.collection("players").doc(playerId).collection("Fielding Chances")
//                 .get().then((fieldingSnapshot) => {
//                     fieldingSnapshot.forEach((chanceDoc) => {
//                         const chanceData = chanceDoc.data();
//                         console.log('chancedata', chanceData)

//                         // Aggregate fielding data
//                         playerFielding.groundBallError += chanceData.groundBallError || 0;
//                         playerFielding.flyBallError += chanceData.flyBallError || 0;
//                         playerFielding.throwingError += chanceData.throwingError || 0;
//                         playerFielding.playMade += chanceData.playMade || 0;
//                     });

//                     // Create a row for the player
//                     let row = `
//                         <tr>
//                             <td>${player.number}</td>
//                             <td>${player.firstName} ${player.lastName}</td>
//                             <td>${playerFielding.groundBallError}</td>
//                             <td>${playerFielding.flyBallError}</td>
//                             <td>${playerFielding.throwingError}</td>
//                             <td>${playerFielding.playMade}</td>
//                         </tr>`;

//                     // Append the row to the table body
//                     tableBody.innerHTML += row;
//                 });
//         });
//     }).catch((error) => {
//         console.error("Error getting documents: ", error);
//     });
// }


function renderFieldingResults() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    console.log(twoWeeksAgo);

    db.collection("players").get().then((querySnapshot) => {
        let tableBody = document.getElementById('fielding-results');
        tableBody.innerHTML = ''; // Clear existing content

        querySnapshot.forEach((playerDoc) => {
            const player = playerDoc.data();
            const playerId = playerDoc.id;
            let playerFielding = { groundBallError: 0, flyBallError: 0, throwingError: 0, playMade: 0, totalChances: 0 };

            db.collection("players").doc(playerDoc.id).collection("Fielding Chances")
                .where("date", ">=", firebase.firestore.Timestamp.fromDate(twoWeeksAgo))
                .get().then((fieldingSnapshot) => {
                    fieldingSnapshot.forEach((chanceDoc) => {
                        const chanceData = chanceDoc.data();
                        console.log('chancedata', chanceData)
                        console.log(twoWeeksAgo)

                        // Aggregate fielding data
                        playerFielding.groundBallError += chanceData.groundBallError || 0;
                        playerFielding.flyBallError += chanceData.flyBallError || 0;
                        playerFielding.throwingError += chanceData.throwingError || 0;
                        playerFielding.playMade += chanceData.playMade || 0;
                        playerFielding.totalChances += chanceData.chances || 0;

                    });
                    const fbErrorPercentage = playerFielding.totalChances > 0 ? Math.round(playerFielding.flyBallError / playerFielding.totalChances * 100) : "0";
                    const gbErrorPercentage = playerFielding.totalChances > 0 ? Math.round(playerFielding.groundBallError / playerFielding.totalChances * 100) : "0";
                    const throwErrorPercentage = playerFielding.totalChances > 0 ? Math.round(playerFielding.throwingError / playerFielding.totalChances * 100) : "0";
                    const playsMadePercentage = playerFielding.totalChances > 0 ? Math.round(playerFielding.playMade / playerFielding.totalChances * 100) : "0";
                    // Create a row for the player
                    let row = `
                        <tr>
                            <td>${player.number}</td>
                            <td>${player.firstName} ${player.lastName}</td>
                            <td>${playerFielding.totalChances}</td>
                            <td>${gbErrorPercentage}%</td>
                            <td>${fbErrorPercentage}%</td>
                            <td>${throwErrorPercentage}%</td>
                            <td>${playsMadePercentage}%</td>
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