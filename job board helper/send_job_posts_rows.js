// Send back to the popup selected values parsed from each posting.
// The popup injects this script into all frames in the active tab.

var city_regex = /[A-Z][A-Za-z\s]+, [A-Z]{2}/
var rows = []
if (document.URL.indexOf('indeed') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('row'));
  rows = elements.map(function(element) {
    return {"title":   element.getElementsByClassName('jobtitle')[0].textContent.trim().replace(/\s*-\s*new$/,''), 
            "company": element.getElementsByClassName('company')[0].textContent.trim(),
            "city":    element.getElementsByClassName('location')[0].textContent, 
            "age":     element.getElementsByClassName('date')[0].textContent, 
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('snip')[0].getElementsByClassName('summary')[0].textContent};
  });
}
else if (document.URL.indexOf('dice') > -1 ) {
  //var elements = [].slice.apply(document.getElementsByClassName('serp-result-content'));
  var elements = [].slice.apply(document.querySelectorAll('#search-results-control .serp-result-content'));
  rows = elements.map(function(element) {
    return {"title":   element.getElementsByTagName('h3')[0].textContent.trim().replace(/\s*Applied$/,' - APPLIED'), 
            "company": element.getElementsByClassName('employer')[0].getElementsByClassName('visible-xs')[0].textContent.trim(),
            "city":    element.getElementsByClassName('location')[0].textContent, 
            "age":     element.getElementsByClassName('posted')[0].textContent, 
            "url":     element.querySelector("a[id ^= 'position']").href,
            //"url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('shortdesc')[0].textContent.trim()};
  });
}
else if (document.URL.indexOf('beyond') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('media-body'));
  rows = elements.map(function(element) {
    var city = '???'
    var city_match = element.getElementsByClassName('job-header-sub')[0].textContent.trim().match(city_regex)
    if (city_match != null) { city = city_match[0] }
    return {"title":   element.getElementsByClassName('job-header')[0].textContent.trim(),
            "company": element.getElementsByClassName('job-title-company')[0].textContent,
            "city":    city, 
            "age":     ' ', 
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('job-abstract')[0].textContent.trim().match(/(.*)/)[0]};
  });
}
else if (document.URL.indexOf('monster') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('js_result_row'));
  rows = elements.map(function(element) {
    return {"title":   element.getElementsByClassName('jobTitle')[0].textContent.trim(),
            "company": element.getElementsByClassName('company')[0].textContent.trim(),
            "city":    element.getElementsByClassName('location')[0].textContent.trim().replace(/\n/g,' '), 
            "age":     element.getElementsByClassName('postedDate')[0].textContent.trim(), 
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('preview')[0].textContent.trim().replace(/\n/g,'')};
  });
}
else if (document.URL.indexOf('careerbuilderzzz') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('jl_col2'));
  rows = elements.map(function(element) {
    return {"title":   element.getElementsByClassName('prefTitle')[0].textContent.trim(),
            "company": ' ', //element.getElementsByClassName('company')[0].textContent
            "city":    element.getElementsByClassName('jl_col4')[0].textContent.trim().match(/(.*)\n/)[0],
            "age":     element.getElementsByClassName('time_posted')[0].textContent.trim(),
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('gs-normal-gray')[0].textContent.trim()};
  });
}
else if (document.URL.indexOf('beta.careerbuilder') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('job-row'));
  rows = elements.map(function(element) {
    return {"title":   element.getElementsByClassName('job-title')[0].textContent.trim(),
            "company": element.getElementsByClassName('job-text')[1].textContent.trim(),
            "city":    element.getElementsByClassName('job-text')[2].textContent.trim(),
            "age":     element.getElementsByClassName('time-posted')[0].textContent.trim().match(/(today|\d+ (hour|week|day)s? ago)/)[0],
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('job-description')[0].textContent.trim()};
  });
}
else if (document.URL.indexOf('jobsradar') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('search-result'));
  rows = elements.map(function(element) {
    var t = element.textContent.trim()
    var p = t.match(/(.*)\n\s+\n(.*) - (.*)\n\s+\n\s+([A-Za-z]{3} \d{2}, \d{4}).*\n+\s+(.*)/);
    if (p == null) { p = ["?", "?", "?", "?", "?", "?"]}
    return {"title":   p[1], //element.getElementsByClassName('serach_result_title')[0].textContent.trim(),
            "company": p[2], 
            "city":    p[3], //element.getElementsByClassName('search-result-subtitle')[0].textContent.trim(),
            "age":     p[4], //element.getElementsByClassName('search-result-date')[0].textContent.trim(),
            "url":     element.getAttribute('href'),
            "summary": p[5]}; //element.textContent.trim()}; //element.getElementsByClassName('search-result-desc')[0].textContent.trim()};
  });
}
else if (document.URL.indexOf('experteer') > -1 ) {
  var elements = [].slice.apply(document.getElementsByClassName('job-list-item'));
  rows = elements.map(function(element) {
    var age = 'LOCKED?';
    var age_match = element.getElementsByClassName('job-age')[0].textContent.trim().match(/\d+ days?/);
    if (age_match != null) { age = age_match[0] } 
    var company_city = element.getElementsByClassName('job-list-item-info')[0].getElementsByTagName('span');
    var company = company_city[0].textContent;
    if (company == '') { company = "LOCKED?"}
    var city = company_city[1].textContent
    return {"title":   element.getElementsByClassName('job-list-item-title')[0].textContent.trim(),
            "company": company, 
            "city":    city, 
            "age":     age,
            "url":     element.getElementsByTagName('a')[0].href,
            "summary": element.getElementsByClassName('job-list-item-expertises')[0].textContent.trim().replace(/Show more/i, '').trim()};
  });
}


if (rows.length > 0) { chrome.extension.sendMessage(rows); }