(async function () {
  /** Utility functions */
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * Make HTMLDivElement from GIFObject
   * @param {Images.fixed_width} object https://developers.giphy.com/docs/api/schema/
   * @returns {HTMLDivElement}
   */
  function makeGiphyElement(object) {
    const container = document.createElement("div");
    const overlay = document.createElement("div");
    const refreshButton = document.createElement("button");

    container.classList.add("giphy-item");
    overlay.classList.add("overlay", "hidden");

    if (object != null) {
      container.style.backgroundImage = `url('${object.url}')`;
      container.style.width = `${object.width}px`;
      container.style.height = `${object.height}px`;
    } else {
      container.style.backgroundImage = `url('${chrome.runtime.getURL(
        `images/dancing-doge.gif`
      )}')`;
      container.style.width = `200px`;
      container.style.height = `202px`;
    }

    container.addEventListener(
      "mouseover",
      () => {
        overlay.classList.remove("hidden");
        overlay.classList.add("flex");
      },
      false
    );
    container.addEventListener(
      "mouseout",
      () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("flex");
      },
      false
    );

    refreshButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>`;

    refreshButton.addEventListener("click", () =>
      chrome.runtime.sendMessage({ action: "REFRESH" })
    );

    overlay.append(refreshButton);
    container.append(overlay);

    return container;
  }

  /** Chrome extension API functions */
  async function setStorageData(data) {
    return new Promise(function (resolve, reject) {
      chrome.storage.sync.set(data, function () {
        resolve();
      });
    });
  }

  async function findAll(itemList = ["object", "enabled"]) {
    return new Promise(function (resolve, reject) {
      chrome.storage.sync.get(itemList, function (data) {
        resolve(data);
      });
    });
  }

  window.addEventListener(
    "load",
    async function () {
      // find elements
      const closeButton = document.getElementById("close");
      const mainWrapper = document.getElementById("main-wrapper");
      const enabled = document.getElementById("enabled");

      /** DOM handler functions */
      async function bindStorageDataToElement() {
        const data = await findAll();

        removeAllChildNodes(mainWrapper);
        mainWrapper.append(makeGiphyElement(data.object));
        enabled.checked = data.enabled;
      }

      /** Header Event handlers */
      closeButton.addEventListener("click", () => window.close(), false);

      /** Settings form event handlers */
      enabled.addEventListener(
        "change",
        async function () {
          await setStorageData({ enabled: this.checked });
        },
        false
      );

      // Add event handlers for chrome API
      chrome.storage.onChanged.addListener(bindStorageDataToElement);

      // Initialize
      await bindStorageDataToElement();
    },
    false
  );
})();
