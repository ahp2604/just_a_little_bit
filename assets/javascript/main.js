var exchanges = [];

function generateTable(exchangeNames) {
  for (var i = 0; i < exchangeNames.length; i++) {
    parsedNames = exchangeNames[i].split("~");
    console.log(parsedNames);
    exchanges.push(parsedNames[1]);
    $("#bit-table").after(
      "<tr><td id='market-" +
        parsedNames[1] +
        "'>" +
        parsedNames[1] +
        "</td><td id='price-" +
        parsedNames[1] +
        "'>--</td><td id='available-" +
        parsedNames[1] +
        "'>--</td></tr>"
    );
  }
  console.log(exchanges);
}

// Code to extract price from streamer
var streamUrl = "https://streamer.cryptocompare.com/";
var fsym = "BTC";
var tsym = "USD";
var currentSubs;
var currentSubsText = "";
var dataUrl =
  "https://min-api.cryptocompare.com/data/subs?fsym=" + fsym + "&tsyms=" + tsym;
var socket = io(streamUrl);

$.getJSON(dataUrl, function(data) {
  currentSubs = data["USD"]["TRADES"];
  console.log(currentSubs);
  generateTable(currentSubs);
  for (var i = 0; i < currentSubs.length; i++) {
    currentSubsText += currentSubs[i] + ", ";
  }
  $("#sub-exchanges").text(currentSubsText);
  socket.emit("SubAdd", { subs: currentSubs });
});

socket.on("m", function(currentData) {
  var tradeField = currentData.substr(0, currentData.indexOf("~"));
  if (tradeField == CCC.STATIC.TYPE.TRADE) {
    transformData(currentData);
  }
});

var transformData = function(data) {
  var coinfsym = CCC.STATIC.CURRENCY.getSymbol(fsym);
  var cointsym = CCC.STATIC.CURRENCY.getSymbol(tsym);
  var incomingTrade = CCC.TRADE.unpack(data);
  // console.log(incomingTrade);
  var newTrade = {
    Market: incomingTrade["M"],
    Type: incomingTrade["T"],
    ID: incomingTrade["ID"],
    Price: CCC.convertValueToDisplay(cointsym, incomingTrade["P"]),
    Quantity: CCC.convertValueToDisplay(coinfsym, incomingTrade["Q"]),
    Total: CCC.convertValueToDisplay(cointsym, incomingTrade["TOTAL"])
  };

  if (incomingTrade["F"] & 1) {
    newTrade["Type"] = "SELL";
  } else if (incomingTrade["F"] & 2) {
    newTrade["Type"] = "BUY";
  } else {
    newTrade["Type"] = "UNKNOWN";
  }

  displayData(newTrade);
};

var displayData = function(dataUnpacked) {
  for (var i = 0; i < exchanges.length; i++) {
    if (exchanges[i] === dataUnpacked.Market) {
      $("#price-" + exchanges[i]).html(dataUnpacked.Price);

      //   console.log(
      //     "Market = " + dataUnpacked.Market + "  price = " + dataUnpacked.Price
      //   );
    }
  }
  // $("#row-test").html(
  //   "<td>" +
  //     dataUnpacked.Market +
  //     "</td><td>" +
  //     dataUnpacked.Price +
  //     "</td><td>Delete me</td>"
  // );
};

$("#unsubscribe").click(function() {
  console.log("Unsubscribing to streamers");
  $("#subscribe").removeClass("subon");
  $(this).addClass("subon");
  $("#stream-text").text("Stream stopped");
  socket.emit("SubRemove", { subs: currentSubs });
  $("#sub-exchanges").text("");
});

$("#subscribe").click(function() {
  console.log("Subscribing to streamers");
  $("#unsubscribe").removeClass("subon");
  $(this).addClass("subon");
  $("#stream-text").text("Streaming...");
  socket.emit("SubAdd", { subs: currentSubs });
  $("#sub-exchanges").text(currentSubsText);
});
