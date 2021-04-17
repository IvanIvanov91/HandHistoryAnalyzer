var hands = [],
  replays = [],
  rake,
  firstPlayerRake,
  secondPlayerRake,
  isFirstPlayerRake = true,
  splitPot,
  row,
  cell1,
  cell2,
  cell3,
  cell4,
  handsLoaded = false,
  firstPlayer,
  secondPlayer,
  divider,
  handsWonFirstPlayer,
  handsWonSecondPlayer;

//Number of hands played
function countHands(text) {
  hands = text.split("<br/><br/><br/><br/>");
  $("#handNumber").text(hands.length - 1);
}

//Show list of all hands in the session
function showHandsList() {
  $("#sessionInfo").show();

  //Get players names for the rake info
  getPlayers(hands[0].toString().split("<br/>"));

  var button = $("#showHands");
  if (button.val() == "Show hands list") {
    if (!handsLoaded) {
      handsLoaded = true;
      rake = 0;
      firstPlayerRake = 0;
      secondPlayerRake = 0;
      handsWonFirstPlayer = 0;
      handsWonSecondPlayer = 0;

      hands.forEach((hand, index) => {
        splitPot = true;
        var lines = hand.toString().split("<br/>");

        //List all hands
        lines.forEach((line) => {
          if (line.toString().startsWith("PokerStars Home Game Hand #")) {
            if (line.toString().includes("Hold'em No Limit")) {
              divider = 100;
            }

            var tbodyRef = document
              .getElementById("resTable")
              .getElementsByTagName("tbody")[0];
            row = tbodyRef.insertRow();
            cell1 = row.insertCell();
            cell1.innerHTML +=
              "<a href='" +
              replays[index] +
              "' id='" +
              index +
              "' target='_blank'>" +
              line
                .toString()
                .replace("PokerStars Home Game Hand ", "")
                .replace(" {Club #4781089}  ", "") +
              "</a><br/>";
          }
          //First player won the pot
          else if (line.toString().startsWith(firstPlayer + " collected")) {
            isFirstPlayerRake = true;
            handsWonFirstPlayer += 1;
            splitPot = !splitPot;
          }
          //Second player won the pot
          else if (line.toString().startsWith(secondPlayer + " collected")) {
            isFirstPlayerRake = false;
            handsWonSecondPlayer += 1;
            splitPot = !splitPot;
          }
          //Get rake
          else if (line.toString().includes("Rake ")) {
            cell2 = row.insertCell();

            //Get pot size
            var potSize =
              parseInt(line.split("Total pot ")[1].split(" | ")[0]) / divider;
            cell2.innerHTML = potSize;

            var currentRake = parseInt(line.split("Rake ")[1]);
            rake += currentRake;

            //Populate cell for who won the pot
            cell3 = row.insertCell();
            if (splitPot) {
              cell3.innerHTML = "Split pot";
              firstPlayerRake += currentRake / 2;
              secondPlayerRake += currentRake / 2;
            } else if (isFirstPlayerRake) {
              firstPlayerRake += currentRake;
              cell3.innerHTML = firstPlayer;
            } else {
              secondPlayerRake += currentRake;
              cell3.innerHTML = secondPlayer;
            }

            //Populate rake cell
            cell4 = row.insertCell();
            cell4.innerHTML = currentRake / divider;
          }
        });
      });
    }
    button.val("Hide hands list");

    $("#resTable").show();
  } else {
    $("#resTable").hide();
    $("#handInfo").hide();
    button.val("Show hands list");
  }

  $("#totalRake").text("Total rake: " + rake / divider);
  $("#firstPlayerRake").text(
    firstPlayer +
      " rake: " +
      firstPlayerRake / divider +
      " | Hands won: " +
      handsWonFirstPlayer
  );
  $("#secondPlayerRake").text(
    secondPlayer +
      " rake: " +
      secondPlayerRake / divider +
      " | Hands won: " +
      handsWonSecondPlayer
  );
}

//Show info for selected hand
function showHandInfo(index) {
  $("#handInfo").show();
  $("#handInfo").val(hands[index].replace(/<br\/>/gi, "\n"));
}

//Make table sortable
$("th").click(function () {
  var table = $(this).parents("table").eq(0);
  var rows = table
    .find("tr:gt(0)")
    .toArray()
    .sort(comparer($(this).index()));
  this.asc = !this.asc;
  if (!this.asc) {
    rows = rows.reverse();
  }
  for (var i = 0; i < rows.length; i++) {
    table.append(rows[i]);
  }
});

function comparer(index) {
  return function (a, b) {
    var valA = getCellValue(a, index),
      valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB)
      ? valA - valB
      : valA.toString().localeCompare(valB);
  };
}

function getCellValue(row, index) {
  return $(row).children("td").eq(index).text();
}

//Get players names
function getPlayers(lines) {
  lines.forEach((line) => {
    if (line.toString().startsWith("Seat 1:")) {
      firstPlayer = line.toString().split("Seat 1: ")[1].split(" (")[0];
    } else if (line.toString().startsWith("Seat 2:")) {
      secondPlayer = line.toString().split("Seat 2: ")[1].split(" (")[0];
    }
  });
}

//Read text file from server
function readTextFile(filePath) {
  const fileUrl =
    "https://ivanivanov91.github.io/HandHistoryAnalyzer/txt/" +
    filePath +
    ".txt"; // provide file location

  fetch(fileUrl)
    .then((response) => response.text())
    .then((data) => {
      // Do something with your data
      var text = data.replace(/(\r\n|\n|\r)/gm, "<br/>");
      hands.splice(0, hands.length);
      $("#resTable tbody").empty();
      $("#resTable").hide();

      $("#showHands").val("Show hands list");
      $("#sessionInfo").hide();
      $("#handInfo").hide();
      handsLoaded = false;
      $("#info").show();
      countHands(text);
      getReplays(filePath);
    });
}

function getReplays(filePath) {
  const fileUrl =
    "https://ivanivanov91.github.io/HandHistoryAnalyzer/txt/" +
    filePath +
    "replays.txt"; // provide file location

  fetch(fileUrl)
    .then((response) => response.text())
    .then((data) => {
      // Do something with your data
      replays = data.split("\n");
    });
}
