const API_KEY = "API_KEY";

async function giphyRandom() {
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}`
  );
  const json = await res.json();
  const data = json.data;
  return data;
}

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === "install") {
    const initStatus = {
      enabled: true,
      object: null,
      url: chrome.runtime.getURL("images/dancing-doge.gif"),
    };

    console.log(initStatus);

    // Initialize data
    chrome.storage.sync.set(initStatus);
  } else if (details.reason === "update") {
  }
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // REFRESH: save new git object to storage API
  if (request.action === "REFRESH") {
    const GIFObject = await giphyRandom();
    chrome.storage.sync.set({
      object: GIFObject.images.fixed_width,
      url: GIFObject.images.fixed_width.url,
    });
    sendResponse({ message: "OK" });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  // UPDATE: re-rendering view
  chrome.tabs.sendMessage(activeInfo.tabId, { action: "UPDATE" });
});
