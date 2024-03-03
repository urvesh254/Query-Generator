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
}

function downloadContent() {
  const content = document.getElementById("output").value;
  const filename = document.getElementById("filename").value;

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || "output.txt";
  link.click();

  URL.revokeObjectURL(link.href);

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
    showAlert("No placeholder found");
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
  const query = document.getElementById("query");
  const itrMode = document.getElementById("iteration-mode");
  const inputs = document.querySelectorAll("#placeholder-table input");
  const placeholderIds = [...inputs].map((input) => input.id);

  // Validate input
  if (query.value == "") {
    showAlert("Query should not be empty");
    return;
  }

  if (placeholderIds.length == 0) {
    showAlert("No placeholder found");
    return;
  }

  let data, placeholdersIndexes;
  if (itrMode.checked) {
    // Iterating mode
    let res = handleIteratingMode(placeholderIds);
    if (res.error) {
      showAlert(res.error);
      return;
    }
    data = res.data;
    placeholdersIndexes = res.placeholdersIndexes;
  } else {
    // Normal Mode
    let res = handleNormalMode(placeholderIds);
    if (res.error) {
      showAlert(res.error);
      return;
    }
    data = res.data;
    placeholdersIndexes = res.placeholdersIndexes;
  }

  // query, lst, placeholders
  const btnGenerate = document.getElementById("generate");
  btnGenerate.disabled = true;
  // This is written because button is not disabled on time.
  setTimeout(() => {
    replacePlaceholders(query.value, data, placeholdersIndexes);
    btnGenerate.disabled = false;
    showToast("Query generated successfully");
  }, 1);
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
  const data = dataStr.split("\n").map((row) => row.split(delimiter));
  const maxDataRowLen = Math.max(...data.map((lst) => lst.length));
  //   const minDataRowLen = Math.min(...data.map((lst) => lst.length));
  const mismatchedData = data.filter((lst) => lst.length != maxDataRowLen);

  let maxPlaceholderLen = -1;
  let minPlaceholderLen = 0;
  const errorPlaceholders = [];
  for (const id of placeholderIds) {
    let value = document.getElementById(id).value || "";

    placeholdersIndexes[id] = parseInt(value);
    if (value) {
      maxPlaceholderLen = Math.max(maxPlaceholderLen, placeholdersIndexes[id]);
      minPlaceholderLen = Math.min(minPlaceholderLen, placeholdersIndexes[id]);
    } else errorPlaceholders.push(id);
  }

  if (maxDataRowLen <= maxPlaceholderLen) {
    res[
      "error"
    ] = `Maximum placeholder index will not possible for the given data.
        <br>Maximum Row Size: ${maxDataRowLen}, Maximum Index Given: ${maxPlaceholderLen}`;
  }

  if (mismatchedData.length) {
    res[
      "error"
    ] = `All data does not have same length<br><br><b>Mismatched data</b> <br> 
    ${mismatchedData.join("<br>")}`;
  }

  if (minPlaceholderLen < 0) {
    res["error"] = "Negative index not allowed";
  }

  if (errorPlaceholders.length) {
    let message = `Below fields are empty. Please verify once.
          <div style="color:#ddb100;"><b>Warning:</b> [${errorPlaceholders}]</div>`;
    showAlert(message);
  }

  res["data"] = data;
  res["placeholdersIndexes"] = placeholdersIndexes;
  return res;
}

function replacePlaceholders(query, data, placeholdersIndexes) {
  console.log(new Date(), "replacePlaceholders start...");
  const output = document.getElementById("output");
  output.value = "";
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
  output.value = finalData;
  //   btnGenerate.disabled = false;
  console.log(new Date(), "replacePlaceholders end...");
}
