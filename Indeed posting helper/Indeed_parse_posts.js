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
        // That fires when a page's URL has Indeed search results...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: 'www\.(indeeeed|dice)\.com\/jobs' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

var postings = [];

// Display postings by creating table in popup.
function showRows() {
  var rowsTable = document.getElementById('rows');
  while (rowsTable.children.length > 1) {
    rowsTable.removeChild(rowsTable.children[rowsTable.children.length - 1])
  }
  for (var i = 0; i < postings.length; ++i) {
    var row = document.createElement('tr');
    var col = document.createElement('td');
    // checkbox for the row
    var checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.id = 'check' + i;
    col.appendChild(checkbox);
    row.appendChild(col);
    // posting title
    col = document.createElement('td');
    col.innerText = postings[i]["title"];
    row.appendChild(col);
    // posting location
    col = document.createElement('td');    
    col.innerText = postings[i]["city"];
    row.appendChild(col);
    // posting age
    col = document.createElement('td');    
    col.innerText = postings[i]["age"];
    row.appendChild(col);
    // url, not visible
    col = document.createElement('td');      
    col.innerText = postings[i]["url"];
    col.style.display = "none";
    row.appendChild(col);

    rowsTable.appendChild(row);
  }
}

// Set the checked state of all visible rows.
function setAll() {
  var checked = document.getElementById('set_all').checked;
  for (var i = 0; i < postings.length; ++i) {
    document.getElementById('check' + i).checked = checked;
  }
}

function openAll() {
  for (var i = 0; i < postings.length; ++i)  {
    if (document.getElementById('check' + i).checked) {
      chrome.tabs.create({url: postings[i]["url"]}, function(newTab) {});
    }
  }
}

// Add rows to postings from send_indeed_rows.js. Then show.  
// send_indeed_rows.js is injected into all frames of the active tab, so this listener 
// may be called multiple times.
chrome.extension.onMessage.addListener(function(rows) {
  for (var index in rows) {
    postings.push(rows[index]);
  }
  showRows();
});

// Set up event handlers and inject send_rows.js into all frames in the active
// tab.
window.onload = function() {
  document.getElementById('open_all').onclick = openAll;
  document.getElementById('set_all').onchange = setAll;
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: 'send_Indeed_rows.js', allFrames: true});
    });
  });
};
