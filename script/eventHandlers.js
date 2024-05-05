// About Message
addEvent("about", "click", handleShowAboutInfo);

// Query Field Validations
addEvent("query", "blur", handleOnBlurQueryField);
addEvent("query", "input", contentFormat);
addEvent("query", "scroll", handleScroll);
new ResizeObserver(resizeOverlay).observe(document.getElementById("query"));

// Iteration Mode Checkbox
addEvent("iteration-mode", "click", handleChangeIterationMode);

// Generate Button
addEvent("generate", "click", handleClickGenerateWorker);

// Download Output File
addEvent("download", "click", downloadContent);

// Copy To Clipboard
addEvent("copy", "click", copyToClipboard);

// Clear Output Area
addEvent("clear", "click", clearOutput);

// Close Alert
addEvent("closeAlert", "click", closeAlert);

// Add event listeners to toggle the sidebar
addEvent("menuIcon", "click", toggleSidebar);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleSidebar();
});

// Query Name Search Event
addEvent("queryNameSearch", "input", (e) => loadQueryNameList(e.target.value));
