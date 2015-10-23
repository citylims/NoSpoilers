MutationObserver =  window.WebKitMutationObserver;
var throttle = [];
var observer = new MutationObserver(function(mutations, observer) {
    throttle.push(observer);
    if (throttle.length % 3 === 0) {
      hoist();
    }
});

observer.observe(document, {subtree: true, childList: true});

function hoist() {
  getArray();
}

function getArray() {
  chrome.storage.sync.get(["spoilers"], function(result) {
    console.log(result);
    noSpoilers(result);
  })
};

function setArray(obj, arr) {
  chrome.storage.sync.set(obj, function() {
    console.log("set storage" + arr);
  })
}

var noSpoilers = function(obj) {
  var arr = obj.spoilers;
  var totalCount = 0;

  for (var i = 0; i < arr.length; i++) {
    spoilerSearch(i, arr);
  }

  function spoilerSearch(index, arr) {
    var str = arr[index].title;
    if (!str) {
      return;
    }
    var regex = new RegExp('\\b' + str + '\\b', 'gi');
    var matchRegex = $(document.body).text().match(regex);
    var matchCount = matchRegex ? matchRegex.length : 0;
    var spoiler = {title: str, count: matchCount};
    arr[index] = spoiler;
    jsonObj = {};
    jsonObj.spoilers = arr;
    setArray(jsonObj, arr);
    totalCount += matchCount;
  };

  //send
  chrome.runtime.sendMessage({spoilerCount: totalCount}, function(response) {
    console.log(response.success);
  });
};

hoist();
