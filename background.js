function escape(input) {
  return input.replace(/'/g, "\\'");
}

function parseUrl(url) {
  // https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string

  let hostname, protocol;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    const parts = url.split("/");
    protocol = parts[0];
    hostname = parts[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return { hostname, protocol };
}

function updateTitle(tabId, title) {
  const escaped = escape(title);
  chrome.tabs.executeScript(tabId, {
    code: "document.title = '" + escaped + "'"
  });
}

function updateFavicon(tabId, url) {
  chrome.tabs.executeScript(tabId, {
    code: `var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'shortcut icon';
link.href = '${url}';
document.getElementsByTagName('head')[0].appendChild(link);`
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (!tab.url || !changeInfo) {
    return;
  }

  const { hostname, protocol } = parseUrl(tab.url);

  if (changeInfo.title !== hostname) {
    updateTitle(tabId, hostname);
  }

  const favicon_url = (protocol || "https:") + "//" + hostname + "/favicon.ico";

  if (changeInfo.favIconUrl !== favicon_url) {
    updateFavicon(tabId, favicon_url);
  }
});
