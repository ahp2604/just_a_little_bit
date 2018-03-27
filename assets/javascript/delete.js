// for (var i = 0; i < exchanges.length; i++) {
   if ((exchanges[i] === dataUnpacked.Market) && (dataUnpacked.Flag & 1) && (sameDay === 0) ) {
     console.log(sameDay);
     
     test[i] = dataUnpacked.Price;
     console.log(test);
     $("#price-" + exchanges[i]).html(dataUnpacked.Price);
     var priceParsed = parseFloat(
       dataUnpacked.Price.replace("$", "").replace(",", "")
     );

     var userSpend = parseFloat($("input").val());

     purchaseAmount = userSpend / priceParsed;

     // console.log(purchaseAmount);
     $("#available-" + exchanges[i]).html(purchaseAmount);
     
     };

     if ((exchanges[i] === dataUnpacked.Market) && ((sameDay !== 0) || ((dataUnpacked.Flag & 4) || ((dataUnpacked.Flag & 2) && (dataUnpacked.Flag &! 1)) ))){
     $("#available-"+exchanges[i]).parent().remove();
   
     }