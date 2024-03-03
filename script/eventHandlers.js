// Query Field
addEvent("query", "blur", handleOnBlurQueryField);

// Iteration Mode Checkbox
addEvent("iteration-mode", "click", handleChangeIterationMode);

// Generate Button
addEvent("generate", "click", handleClickGenerate);

// Download Output File
addEvent("download", "click", downloadContent);

// Copy To Clipboard
addEvent("copy", "click", copyToClipboard);

// Clear Output Area
addEvent("clear", "click", clearOutput);

// Close Alert
addEvent("closeAlert", "click", closeAlert);
