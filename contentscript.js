(function () {
  const image = document.createElement("img");

  let object = null;
  let popupTimer = null;
  let popupDuration = 500;

  /** Initialize styles */
  image.style.position = "absolute";
  image.style.zIndex = 9999;
  image.style.display = "none";
  image.style.top = "0px";
  image.style.left = "0px";

  /** Utility functions */
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  /** Visibility functions */
  function popup() {
    const x = getRandomArbitrary(
      0,
      window.innerWidth - (object ? object.width : image.style.width)
    );
    const y = getRandomArbitrary(
      0,
      window.innerHeight - (object ? object.height : image.style.height)
    );
    const offsetX = window.pageXOffset || document.documentElement.scrollLeft;
    const offsetY = window.pageYOffset || document.documentElement.scrollTop;
    image.style.top = `${offsetY + y}px`;
    image.style.left = `${offsetX + x}px`;
    image.style.display = "inline";

    clearTimeout(popupTimer);
    popupTimer = setTimeout(function () {
      image.style.display = "none";
    }, popupDuration);
  }

  /** DOM handler functions */
  function bindStorageDataToElement() {
    chrome.storage.sync.get(["url", "object", "enabled"], function (items) {
      object = items.object;

      if (items.url) {
        image.src = items.url;
      }

      if (!items.enabled && document.body.contains(image)) {
        document.body.removeChild(image);
      } else if (items.enabled && !document.body.contains(image)) {
        document.body.appendChild(image);
      } else {
        // Nothing to do
      }
    });
  }

  // Add event handlers
  window.addEventListener("keydown", popup, false);
  window.addEventListener("click", popup, false);

  // Add event handlers for chrome API
  chrome.storage.onChanged.addListener(bindStorageDataToElement);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    // Re render on update message received
    if (request.action === "UPDATE") {
      bindStorageDataToElement();
    }
  });

  // Initialize
  bindStorageDataToElement();
})();
