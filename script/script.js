function copyToClipboard() {
  const textarea = document.getElementById("output");
  textarea.select();
  navigator.clipboard
    .writeText(textarea.value)
    .then(() => {
      showToast("Output copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      showToast("Error");
    });
  textarea.selectionEnd = textarea.selectionStart;
}

function clearOutput() {
  document.getElementById("output").value = "";
  showToast("Output cleared");
}

function downloadContent() {
  const filename = document.getElementById("filename").value;
  const content = document.getElementById("output").value;
  downloadFile(content, filename);
  showToast(`${filename} downloaded`);
}

function handleChangeIterationMode() {
  const itrMode = document.getElementById("iteration-mode");

  // change placeholder and input type of table inputs
  const inputType = itrMode.checked ? "number" : "text";
  const placeholder = itrMode.checked ? "Enter index" : "Enter value";
  const inputs = document.querySelectorAll("#placeholder-table input");
  for (const input of inputs) {
    input.type = inputType;
    input.placeholder = placeholder;
  }

  // showHide Data Div based on itrMode
  document.getElementById("data-div").style.display = itrMode.checked
    ? ""
    : "none";
}

/* Query Field Handling - Start */
function contentFormat() {
  const query = document.getElementById("query");
  const overlay = document.getElementById("overlay");
  let str = query.value;
  const matches = str.matchAll(REGEX_PLACEHOLDER);
  const placeholderTable = document.getElementById("placeholder-table");
  const placeholders = new Set();
  placeholderTable.innerHTML = "";

  // removing '<' and '>' tag to resolve dirty content issue
  str = str.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  let i = 0;
  for (const match of matches) {
    const placeholder = match[0];

    let formattedMatch = `<span class="highlight">${placeholder}</span>`;
    str = str.replaceAll(placeholder, formattedMatch);
    if (!placeholders.has(placeholder)) {
      placeholderTable.innerHTML += `
    <tr>
      <td class="text-center">${++i}</td>
      <td>${placeholder}</td>
      <td><input id=${placeholder} type="text" placeholder="Enter value" /></td>
    </tr>`;
    }
    placeholders.add(placeholder);
  }

  // If no placeholders are found then it will show default message.
  if (!placeholders.size) {
    placeholderTable.innerHTML = NO_PLACEHOLDER_FOUND;
  }

  overlay.innerHTML = str + "</br>";

  handleChangeIterationMode();
}

function handleScroll() {
  const query = document.getElementById("query");
  const overlay = document.getElementById("overlay");

  const scrollTop = query.scrollTop;
  overlay.scrollTop = scrollTop;

  const scrollLeft = query.scrollLeft;
  overlay.scrollLeft = scrollLeft;
}

function resizeOverlay() {
  const overlay = document.getElementById("overlay");
  const query = document.getElementById("query");
  const queryParent = document.querySelector(".query-parent");

  overlay.style.width = query.clientWidth + "px";
  overlay.style.height = query.clientHeight + "px";
  queryParent.style.height = query.clientHeight + "px";
}

function handleOnBlurQueryField() {
  const inputs = document.querySelectorAll("#placeholder-table input");
  if (!inputs.length) showToast("No placeholder found");
}
/* Query Field Handling - End */

function handleClickGenerateWorker() {
  showLoading();

  // It will execute this method using
  setTimeout(handleClickGenerate, 700);
}

function handleClickGenerate() {
  try {
    const query = document.getElementById("query");
    const itrMode = document.getElementById("iteration-mode");
    const inputs = document.querySelectorAll("#placeholder-table input");
    const placeholderIds = [...inputs].map((input) => input.id);
    const output = document.getElementById("output");

    // Validate input
    if (query.value == "") {
      showAlert("Query should not be empty");
      return;
    }

    if (placeholderIds.length == 0) {
      showAlert("No placeholder found");
      return;
    }

    let res;
    if (itrMode.checked) {
      // Iterating mode
      res = handleIteratingMode(placeholderIds);
    } else {
      // Normal Mode
      res = handleNormalMode(placeholderIds);
    }

    if (res.error) {
      showAlert(res.error);
      output.value = "";
      return;
    }

    res["query"] = query.value;
    const btnGenerate = document.getElementById("generate");
    btnGenerate.disabled = true;

    const filename = document.getElementById("filename").value;
    const finalOutput = replacePlaceholders(res);
    const sizeInMB = getStringSizeInMB(finalOutput);
    if (sizeInMB > MAX_OUTPUT_SIZE_IN_MB) {
      downloadFile(finalOutput, filename);
      showAlert(
        `Output size is <b>${sizeInMB.toFixed(2)}MB</b>. 
        Due to its size, the output will be downloaded directly.`
      );
      output.value = "";
    } else {
      output.value = finalOutput;
      showAlert("Query generated successfully");
    }
    btnGenerate.disabled = false;
  } catch (error) {
    console.error(error);
    showToast(error);
  } finally {
    hideLoading();
  }
}

function handleNormalMode(placeholderIds) {
  const data = [];
  const row = [];
  const res = {};
  const placeholdersIndexes = {};
  const errorPlaceholders = [];
  let index = 0;
  for (const id of placeholderIds) {
    const value = document.getElementById(id).value;
    if (!value) errorPlaceholders.push(id);
    row.push(value || "");
    placeholdersIndexes[id] = index++;
  }
  data.push(row);

  // Warning
  if (errorPlaceholders.length) {
    let message = `Below fields are empty. Please verify once.
            <div style="color:#ddb100;"><b>Warning:</b> [${errorPlaceholders}]</div>`;
    showToast(message);
  }

  res["data"] = data;
  res["placeholdersIndexes"] = placeholdersIndexes;
  return res;
}

function handleIteratingMode(placeholderIds) {
  const res = {};
  const placeholdersIndexes = {};
  const dataStr = document.getElementById("data").value.trim();
  const delimiter = document.getElementById("delimiter").value;

  // Processing data, finding max, min and mismatched data.
  const data = dataStr.split("\n").map((row) => row.split(delimiter));
  const sizeOfAllRows = data.map((lst) => lst.length);
  const maxDataRowLen = sizeOfAllRows.reduce(
    (acc, curr) => Math.max(acc, curr),
    0
  );
  const mismatchedData = data.filter((lst) => lst.length != maxDataRowLen);

  let maxPlaceholderIndex = -1;
  let minPlaceholderIndex = Infinity;
  const errorPlaceholders = [];
  for (const id of placeholderIds) {
    let value = document.getElementById(id).value || "";

    placeholdersIndexes[id] = parseInt(value);
    if (value) {
      maxPlaceholderIndex = Math.max(
        maxPlaceholderIndex,
        placeholdersIndexes[id]
      );
      minPlaceholderIndex = Math.min(
        minPlaceholderIndex,
        placeholdersIndexes[id]
      );
    } else errorPlaceholders.push(id);
  }

  // Validation Errors
  if (minPlaceholderIndex < 0) {
    res["error"] = "Negative index not allowed";
  } else if (maxDataRowLen <= maxPlaceholderIndex) {
    res[
      "error"
    ] = `Maximum placeholder index will not possible for the given data.
          <br>Maximum Row Size: ${maxDataRowLen}, Maximum Index Given: ${maxPlaceholderIndex}`;
  } else if (mismatchedData.length) {
    res[
      "error"
    ] = `All data does not have same length<br><br><b>Mismatched data</b> <br> 
      ${mismatchedData.map((str) => `"${str}"`).join("<br>")}`;
  }

  // Warning
  if (errorPlaceholders.length) {
    let message = `Below fields are empty. Please verify once.
            <div style="color:#ddb100;"><b>Warning:</b> [${errorPlaceholders}]</div>`;
    showToast(message);
  }

  res["data"] = data;
  res["placeholdersIndexes"] = placeholdersIndexes;
  return res;
}

function replacePlaceholders(obj) {
  const query = obj.query + "\n";
  const data = obj.data;
  const placeholdersIndexes = obj.placeholdersIndexes;
  console.log(new Date().getTime(), "replacePlaceholders start...");
  let finalData = "";

  for (let row of data) {
    let finalRow = query;
    for (let placeholder of Object.keys(placeholdersIndexes)) {
      let index = placeholdersIndexes[placeholder];
      let value = row[index] || "";
      finalRow = finalRow.replaceAll(placeholder, value);
    }
    finalData += finalRow;
  }

  console.log(new Date().getTime(), "replacePlaceholders end...");
  lst = finalData.match(/insert/gi);
  console.log("Data Length: ", data.length);
  console.log(`Total insert queries: ${lst ? lst.length : 0}`);
  return finalData;
}
