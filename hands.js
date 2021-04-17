var hands = [],
  rake,
  myRake,
  opponentRake,
  isMyRake = true,
  splitPot,
  table,
  row,
  cell1,
  cell2,
  cell3,
  cell4,
  handsLoaded = false,
  player,
  opponent,
  divider;

$(document).ready(function () {
  document.getElementById("inputfile").addEventListener("change", function () {
    var file = this.files[0];
    document.getElementById("info").removeAttribute("hidden");
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
      // Replace end of hand symbols with new lines
      hands.splice(0, hands.length);
      $("#resTable tbody").empty();
      $("#sessionInfo").hide();
      handsLoaded = false;
      var text = this.result.replace(/(\r\n|\n|\r)/gm, "<br/>");

      countHands(text);
    };

    reader.readAsText(file);
  });
});

//Number of hands played
function countHands(text) {
  hands = text.split("<br/><br/><br/><br/>");
  $("#handNumber").text(hands.length - 1);
}

function showHandsList() {
  $("#sessionInfo").show();

  getPlayers(hands[0].toString().split("<br/>"));
  var button = document.getElementById("showHands");
  if (button.value == "Show hands list") {
    if (!handsLoaded) {
      handsLoaded = true;
      rake = 0;
      myRake = 0;
      opponentRake = 0;
      table = document.getElementById("resTable");

      hands.forEach((hand, index) => {
        splitPot = true;
        var lines = hand.toString().split("<br/>");
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
              "<a href='javascript:showHandInfo(" +
              index +
              ")' id='" +
              index +
              "'>" +
              line.toString().split("PokerStars Home Game Hand ")[1] +
              "</a><br/>";
          } else if (line.toString().startsWith(player + " collected")) {
            isMyRake = true;
            splitPot = !splitPot;
          } else if (line.toString().startsWith(opponent + " collected")) {
            isMyRake = false;
            splitPot = !splitPot;
          } else if (line.toString().includes("Rake ")) {
            cell2 = row.insertCell();
            var potSize =
              parseInt(line.split("Total pot ")[1].split(" | ")[0]) / divider;
            cell2.innerHTML = potSize;

            var currentRake = parseInt(line.split("Rake ")[1]);
            rake += currentRake;

            cell3 = row.insertCell();
            if (splitPot) {
              cell3.innerHTML = "Split pot";
              myRake += currentRake / 2;
              opponentRake += currentRake / 2;
            } else if (isMyRake) {
              myRake += currentRake;
              cell3.innerHTML = player;
            } else {
              opponentRake += currentRake;
              cell3.innerHTML = opponent;
            }
            cell4 = row.insertCell();
            cell4.innerHTML = currentRake / divider;
          }
        });
      });
    }
    button.value = "Hide hands list";

    $("#resTable").show();
  } else {
    $("#resTable").hide();
    button.value = "Show hands list";
  }

  $("#totalRake").text(rake / divider);
  $("#myRake").text(myRake / divider);
  $("#opponentRake").text(opponentRake / divider);
}

function showHandInfo(index) {
  $("#handInfo").html(hands[index]);
}

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

function getPlayers(lines) {
  lines.forEach((line) => {
    if (line.toString().startsWith("Seat 1:")) {
      player = line.toString().split("Seat 1: ")[1].split(" (")[0];
      $("#lblMyRake").text(player + " rake:");
    } else if (line.toString().startsWith("Seat 2:")) {
      opponent = line.toString().split("Seat 2: ")[1].split(" (")[0];
      $("#lblOppRake").text(opponent + " rake:");
    }
  });
}

function readTextFile() {
  var txtFile = new XMLHttpRequest();
  txtFile.open(
    "GET",
    "https://github.com/IvanIvanov91/HandHistoryAnalyzer/blob/c16e321b5bf9fc26fd60500e5d764f7f67912c4b/txt/session2.txt",
    true
  );
  txtFile.onreadystatechange = function () {
    if (txtFile.readyState === 4) {
      // Makes sure the document is ready to parse.
      if (txtFile.status === 200) {
        // Makes sure it's found the file.
        allText = txtFile.responseText;
        lines = txtFile.responseText.split("\n"); // Will separate each line into an array
      }
    }
  };
  txtFile.send(null);
}
