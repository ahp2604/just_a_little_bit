var exchanges = [];
var priceArray = [];
var test = [];
var userInput;

function generateTable(exchangeNames) {
  for (var i = 0; i < exchangeNames.length; i++) {
    parsedNames = exchangeNames[i].split("~");

    exchanges.push(parsedNames[1]);
    test.push(parsedNames[0]);
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
  // console.log(test);
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
  // console.log(currentSubs);
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
    TimeUnix: incomingTrade["TS"],
    Flag: incomingTrade["F"], //Added Property F to bring in Flag to identify Buy or Sell
    Price: CCC.convertValueToDisplay(cointsym, incomingTrade["P"]),
    Quantity: CCC.convertValueToDisplay(coinfsym, incomingTrade["Q"]),
    Total: CCC.convertValueToDisplay(cointsym, incomingTrade["TOTAL"])
  };
  // console.log(newTrade);

  // if (incomingTrade["F"] & 1) {
  //   newTrade["Type"] = "SELL";
  // } else if (incomingTrade["F"] & 2) {
  //   newTrade["Type"] = "BUY";
  // } else {
  //   newTrade["Type"] = "UNKNOWN";
  // }

  displayData(newTrade);
};
//Added in filter F & 2 to only capture Buying Transaction
var displayData = function(dataUnpacked) {
  //test to convert time
  var start = moment.utc().startOf("day").format;
  // console.log(start);

  var time = parseInt(dataUnpacked.TimeUnix); //string
  // console.log(time);

  //test to convert string price to number price
  var high = dataUnpacked.Price.split("$");
  // console.log(high);
  var highInt = parseFloat(high[1].replace("$", "").replace(",", ""));
  // console.log(typeof highInt); //give a number
  priceArray.push(highInt);
  // console.log(priceArray);
  ///////////////////////////////////////////////////////////////////////////////////////////

  for (var i = 0; i < exchanges.length; i++) {
    if (exchanges[i] === dataUnpacked.Market && dataUnpacked.Flag & 1) {
      test[i] = dataUnpacked.Price;
      // console.log(test);
      $("#price-" + exchanges[i]).html(dataUnpacked.Price);
      var priceParsed = parseFloat(
        dataUnpacked.Price.replace("$", "").replace(",", "")
      );

      var userSpend = parseFloat($("input").val());

      purchaseAmount = userSpend / priceParsed;

      // console.log(purchaseAmount);
      $("#available-" + exchanges[i]).html(purchaseAmount);

      //test to showing the high and low
      // if(dataUnpacked.Price = high){
      // pricePopulate.html(dataUnpacked.Price);
      //   pricePopulate.css("background-color","blue")
      // }else if(dataUnpacked.Price = low){
      //   pricePopulate.css("background-color","red")
      // }

      //   console.log(
      //     "Market = " + dataUnpacked.Market + "  price = " + dataUnpacked.Price
      //   );

      //If F & 4 is passing then show Unknown Transaction
      //Cexio Market is showing a unsuall low-price for buying. Verified F:2 is true
    } //else if ((exchanges[i] === dataUnpacked.Market) && (dataUnpacked.Flag === )){
    //$("#price-" + exchanges[i]).html("Unknown Transaction");
    //}
  }

  // $("#row-test").html(
  //   "<td>" +
  //     dataUnpacked.Market +
  //     "</td><td>" +
  //     dataUnpacked.Price +
  //     "</td><td>Delete me</td>"
  // );
};

$("button").click(function() {
  for (i = 0; i < exchanges.length; i++) {
    var price = parseFloat(
      $("#price-" + exchanges[i])
        .text()
        .replace("$", "")
        .replace(",", "")
    );
    userInput = parseFloat($("input").val());
    purchasePower = userInput / price;
    console.log(purchasePower);
    $("#available-" + exchanges[i]).html(purchasePower);
  }
});
