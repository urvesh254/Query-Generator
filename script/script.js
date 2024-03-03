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
  downloadFile(content);
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

function handleOnBlurQueryField() {
  const query = document.getElementById("query");

  // Find All placeholders
  const matches = query.value.matchAll(REGEX_PLACEHOLDER);
  const placeholders = new Set();
  const errorPlaceholders = new Set();
  let isPlaceholderValid = true;
  for (const match of matches) {
    const placeholder = match[0];

    isPlaceholderValid =
      isPlaceholderValid & REGEX_VALID_PLACEHOLDER.test(placeholder);
    if (!REGEX_VALID_PLACEHOLDER.test(placeholder)) {
      errorPlaceholders.add(placeholder);
    }
    placeholders.add(placeholder);
  }

  // Put that in placeholders table
  const placeholderTable = document.getElementById("placeholder-table");
  placeholderTable.innerHTML = "";
  for (const placeholder of placeholders) {
    placeholderTable.innerHTML += `<tr>
        <td>${placeholder}</td>
        <td><input id=${placeholder} type="text" placeholder="Enter value" /></td>
    </tr>`;
  }

  if (!placeholders.size) {
    placeholderTable.innerHTML = NO_PLACEHOLDER_FOUND;
    showToast("No placeholder found");
  } else if (!isPlaceholderValid) {
    placeholderTable.innerHTML = NO_PLACEHOLDER_FOUND;
    showAlert(
      `The placeholder must include only alphabetic characters (A-Z, both uppercase and lowercase) and '_'
        <div style="color:red;"><b>Error:</b> [${[
          ...errorPlaceholders,
        ].toString()}]</div>
      `
    );
  }

  handleChangeIterationMode();
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

    const finalOutput = replacePlaceholders(res);
    const sizeInMB = getStringSizeInMB(finalOutput);
    if (sizeInMB > MAX_OUTPUT_SIZE_IN_MB) {
      downloadFile(finalOutput);
      showAlert(
        `Output size is <b>${sizeInMB.toFixed(2)}MB</b>. 
      Due to its size, the output will be downloaded directly.`
      );
      output.value = "";
    } else {
      output.value = finalOutput;
      showToast("Query generated successfully");
    }
    btnGenerate.disabled = false;
  } catch (error) {
    console.error(error);
    showToast(error);
  }
}

function handleNormalMode(placeholderIds) {
  const data = [];
  const row = [];
  const res = {};
  const placeholdersIndexes = {};
  let index = 0;
  for (const id of placeholderIds) {
    row.push(document.getElementById(id).value || "");
    placeholdersIndexes[id] = index++;
  }
  data.push(row);

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
    showAlert(message);
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
  console.log(data.length);
  console.log(`Total insert queries: ${lst ? lst.length : 0}`);
  return finalData;
}
