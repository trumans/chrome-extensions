// Send back to the popup the values parsed from each item in the results.
// The popup injects this script into all frames in the active tab.
var elements = [].slice.apply(document.getElementsByClassName('sresult'));
var el, title, price, bids, bin, bo, status;
var rows = elements.map(function(element)
{
  // url: assume first href is the link to to the item.
  url = element.getElementsByTagName('a')[0].href;
  // title: remove 'new listing' from front, trim whitespace. 
  //        replace double-quotes with 2 double-quotes. 
  //        surround with double-quotes
  el = element.getElementsByClassName('lvtitle')[0].textContent.replace(/^new listing/i,'').trim();
  el = el.replace(/"/g, '""');
  title = '"' + el + '"'; 
  // price: extract first price
  price = element.getElementsByClassName('lvprice')[0].textContent.match(/\$(\d*\.\d{2})/)[1];
  // if a second price then include a note
  element.getElementsByClassName('lvprice')[1] ? price2 = 'another price' : price2 = ''
  // bid count, Buy It Now, Best Offer: create separate values
  el = element.getElementsByClassName('lvformat')[0].textContent.trim();
  bids = '', bin = '', bo = '';
  if        (el.match(/buy it now/i)) { bin = 'buy it now'; }
    else if (el.match(/best offer/i)) { bo = 'best offer'; }
    else if (el.match(/bid/i))        { bids = el; }
  // shipping comment, if it exists
  el = element.getElementsByClassName('lvshipping')[0];
  (el) ? ship = el.textContent.trim() : ship = '';
  // status: active, sold, ended
  status = '???';
  el = element.getElementsByClassName('lvdetails')[0].textContent.trim()
  // check if there is a date-time of the format Jan-01 09:59, which indicates completed listing
  if (el.match(/[a-z]{3}-[0-1][0-9] [0-2][0-9]:[0-9]{2}/i)) {
    // sold items have price formated in green, as per class
    if (element.getElementsByClassName('bidsold').length)  {status = "SOLD"}
    else { status = "ENDED" }
  } 
  else { status = "ACTIVE" } 
  return [title, price, price2, bids, bin, bo, ship, status, url].join(",")
});

chrome.extension.sendMessage(rows);