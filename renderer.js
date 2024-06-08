window.addEventListener("DOMContentLoaded", () => {
  const guildIdInput = document.getElementById("guildId");
  const userIdInput = document.getElementById("userId");
  const resultElement = document.getElementById("result");
  const saveConfigBtn = document.getElementById("saveConfigBtn");

  const channelInputs = [];
  const hotkeyBtns = [];
  const hotkeySpans = [];
  for (let i = 1; i <= 10; i++) {
    channelInputs.push(document.getElementById(`channelId${i}`));
    hotkeyBtns.push(document.getElementById(`hotkeyBtn${i}`));
    hotkeySpans.push(document.getElementById(`hotkey${i}`));
  }

  const hotkeyModal = document.getElementById("hotkeyModal");
  const hotkeyDisplay = document.getElementById("hotkeyDisplay");
  const saveHotkeyBtn = document.getElementById("saveHotkeyBtn");
  const clearHotkeyBtn = document.getElementById("clearHotkeyBtn");
  const closeBtn = document.querySelector(".close-btn");
  let currentHotkeyIndex = null;
  let currentHotkey = null;

  // Ensure all required elements exist
  if (
    !guildIdInput ||
    !userIdInput ||
    !resultElement ||
    !saveConfigBtn ||
    !hotkeyModal ||
    !hotkeyDisplay ||
    !saveHotkeyBtn ||
    !clearHotkeyBtn ||
    !closeBtn
  ) {
    console.error("Some elements are not found in the DOM.");
    return;
  }

  window.electronAPI
    .loadConfig()
    .then((config) => {
      if (config) {
        guildIdInput.value = config.guildId || "";
        userIdInput.value = config.userId || "";

        channelInputs.forEach((input, index) => {
          if (input && hotkeySpans[index]) {
            input.value = config[`channelId${index + 1}`] || "";
            hotkeySpans[index].textContent = config[`hotkey${index + 1}`] || "";
          }
        });
      }
    })
    .catch((error) => {
      resultElement.textContent = `Failed to load configuration: ${error.message}`;
    });

  hotkeyBtns.forEach((btn, index) => {
    if (btn) {
      btn.addEventListener("click", () => {
        currentHotkeyIndex = index;
        hotkeyModal.style.display = "block";
        hotkeyDisplay.textContent =
          hotkeySpans[currentHotkeyIndex].textContent || "Press a key";
        currentHotkey = null;
      });
    }
  });

  closeBtn.addEventListener("click", () => {
    hotkeyModal.style.display = "none";
    currentHotkeyIndex = null;
  });

  window.addEventListener("keydown", (event) => {
    if (currentHotkeyIndex !== null && hotkeyModal.style.display === "block") {
      currentHotkey = event.key;
      hotkeyDisplay.textContent = currentHotkey;
    }
  });

  saveHotkeyBtn.addEventListener("click", () => {
    if (currentHotkeyIndex !== null && currentHotkey !== null) {
      hotkeySpans[currentHotkeyIndex].textContent = currentHotkey;
    }
    hotkeyModal.style.display = "none";
    currentHotkeyIndex = null;
  });

  clearHotkeyBtn.addEventListener("click", () => {
    if (currentHotkeyIndex !== null) {
      hotkeySpans[currentHotkeyIndex].textContent = "";
    }
    hotkeyModal.style.display = "none";
    currentHotkeyIndex = null;
  });

  saveConfigBtn.addEventListener("click", () => {
    if (!guildIdInput.value || !userIdInput.value) {
      resultElement.textContent = "Guild ID and User ID are required";
      return;
    }

    // Disable inputs and button during save operation
    guildIdInput.disabled = true;
    userIdInput.disabled = true;
    channelInputs.forEach((input) => {
      if (input) input.disabled = true;
    });
    saveConfigBtn.disabled = true;
    resultElement.textContent = "Saving configuration...";

    const config = {
      guildId: guildIdInput.value,
      userId: userIdInput.value,
    };

    channelInputs.forEach((input, index) => {
      if (input && hotkeySpans[index]) {
        config[`channelId${index + 1}`] = input.value;
        config[`hotkey${index + 1}`] = hotkeySpans[index].textContent;
      }
    });

    window.electronAPI
      .saveConfig(config)
      .then((message) => {
        resultElement.textContent = message;
        // Enable inputs and button after save operation
        guildIdInput.disabled = false;
        userIdInput.disabled = false;
        channelInputs.forEach((input) => {
          if (input) input.disabled = false;
        });
        saveConfigBtn.disabled = false;
        saveConfigBtn.textContent = "Update Configuration";
      })
      .catch((error) => {
        resultElement.textContent = `Error: ${error.message}`;
        // Enable inputs and button after save operation
        guildIdInput.disabled = false;
        userIdInput.disabled = false;
        channelInputs.forEach((input) => {
          if (input) input.disabled = false;
        });
        saveConfigBtn.disabled = false;
      });
  });
});
