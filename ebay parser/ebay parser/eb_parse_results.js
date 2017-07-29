// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL has ebay search results...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'www.ebay.com/sch/' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

var allRows = [];
var visibleRows = [];

// Display all visible Rows.
function showRows() {
  var rowsTable = document.getElementById('rows');
  while (rowsTable.children.length > 1) {
    rowsTable.removeChild(rowsTable.children[rowsTable.children.length - 1])
  }
  for (var i = 0; i < visibleRows.length; ++i) {

    var row = document.createElement('tr');
    var col0 = document.createElement('td');
    var col1 = document.createElement('td');
    var checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.id = 'check' + i;
    col0.appendChild(checkbox);
    col1.innerText = visibleRows[i];
    col1.style.whiteSpace = 'nowrap';
    row.appendChild(col0);
    row.appendChild(col1);
    rowsTable.appendChild(row);
    document.getElementById('check'+i).addEventListener("click", formatCsv);
  }
  formatCsv();
}

// Set the checked state of all visible rows.
function setAll() {
  var checked = document.getElementById('set_all').checked;
  for (var i = 0; i < visibleRows.length; ++i) {
    document.getElementById('check' + i).checked = checked;
  }
  formatCsv();
}

// Redisplay text in CSV section
function formatCsv() {
  formatedText = ["title", "price", "another price?", "#bids", "BiN", "BO", "shipping", "status", "url"].join(",");
  for (var i = 0; i < visibleRows.length; ++i) {
    if (document.getElementById('check' + i).checked) {
      formatedText = formatedText + '<br>' + visibleRows[i]
    }
  }
  document.getElementById('csv').innerHTML = formatedText;
}

// Re-filter allRows into visibleRows and reshow visibleRows.
function filterRows() {
  var filterValue = document.getElementById('filter').value;
  if (document.getElementById('regex').checked) {
    var filterRegex = new RegExp(filterValue, 'i');
    visibleRows = allRows.filter(function(row) {
      return row.match(filterRegex);
    });
  } else {
    var terms = filterValue.split(' ').map(function(t) { return t.toLowerCase(); } );
    visibleRows = allRows.filter(function(row) {
      for (var termI = 0; termI < terms.length; ++termI) {
        var term = terms[termI];
        if (term.length != 0) {
          var expected = (term[0] != '-');
          if (!expected) {
            term = term.substr(1);
            if (term.length == 0) {
              continue;
            }
          }
          var found = (-1 !== row.toLowerCase().indexOf(term));
          if (found != expected) {
            return false;
          }
        }
      }
      return true;
    });
  }
  showRows();
}

// Add rows from send_rows.js to allRows and visibleRows, and show.  
// send_rows.js is injected into all frames of the active tab, so this listener 
// may be called multiple times.
chrome.extension.onMessage.addListener(function(rows) {
  for (var index in rows) {
    allRows.push(rows[index]);
  }
  visibleRows = allRows;
  showRows();
});

// Set up event handlers and inject send_rows.js into all frames in the active
// tab.
window.onload = function() {
  document.getElementById('filter').onkeyup = filterRows;
  document.getElementById('regex').onchange = filterRows;
  document.getElementById('set_all').onchange = setAll;
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: 'send_rows.js', allFrames: true});
    });
  });
};
