// Send back to the popup selected values parsed from each posting.
// The popup injects this script into all frames in the active tab.
var elements = [].slice.apply(document.getElementsByClassName('row'));
var rows = elements.map(function(element) {
  return {"title": element.getElementsByClassName('jobtitle')[0].textContent.trim().replace(/\s*-\s*new$/,''), 
          "city":  element.getElementsByClassName('location')[0].textContent, 
          "age":   element.getElementsByClassName('date')[0].textContent, 
          "url":   element.getElementsByTagName('a')[0].href};
});
chrome.extension.sendMessage(rows);