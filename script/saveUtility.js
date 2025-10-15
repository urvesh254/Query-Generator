const KEY_QUERY_DATA = "QUERY_DATA";
const KEY_QUERY_NAME = "queryName";
const KEY_QUERY_ID = "queryId";
const KEY_QUERY = "query";
const KEY_ITERATION_MODE = "iteration-mode";
const KEY_DELIMITER = "delimiter";
const KEY_PLACEHOLDERS = "placeholders";
const DEFAULT_FILE_NAME = "Untitled";
const SHOW_QUERY_NAME_LENGTH = 15;
const SAVE_UTILITY_DEFAULT_DELAY = 1500;
const queryData = getQueryDataFromLocalStorage();
const rawQueryItem = `<li class="query-item">
<span class="query-name-content">{query_content}</span>
<img src="icon/edit.png" alt="Edit" title="Edit" class="img-btn" width="25px" onclick="loadQueryInfo('{query_id}')"/>
<img src="icon/bin.png" alt="Delete" title="Delete" class="img-btn" width="25px" onclick="handleDeleteQuery('{query_id}')"/>
</li>`;

function getQueryDataFromLocalStorage() {
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(KEY_QUERY_DATA)) || data;
  } catch (error) {}
  return data;
}

function saveQueryInLocalStorage(key = undefined) {
  key = key || generateId();
  const queryObj = queryData[key] || {};

  const queryName = document.getElementById("queryName").value;
  const query = document.getElementById("query").value;
  const iterationMode = document.getElementById("iteration-mode").checked;
  const delimiter = document.getElementById("delimiter").value;

  if (queryName == "") {
    showAlert("Query Name should not be empty");
    return;
  } else if (query == "") {
    showAlert("Query should not be empty");
    return;
  } else if (delimiter == "") {
    showAlert("Delimiter should not be empty");
    return;
  }

  const inputs = document.querySelectorAll("#placeholder-table input");
  const placeholders = [...inputs].reduce((res, placeholder) => {
    res[placeholder.id] = placeholder.value;
    return res;
  }, {});

  queryObj[KEY_QUERY_ID] = key;
  queryObj[KEY_QUERY_NAME] = queryName;
  queryObj[KEY_QUERY] = query;
  queryObj[KEY_ITERATION_MODE] = iterationMode ? 1 : 0; //  Need to change when other mode will implemented
  queryObj[KEY_DELIMITER] = delimiter;
  queryObj[KEY_PLACEHOLDERS] = placeholders;

  // Setting key to queryId if it is saving first time.
  document.getElementById("queryId").value = key;
  try {
    queryData[key] = queryObj;
    localStorage.setItem(KEY_QUERY_DATA, JSON.stringify(queryData));

    const showQueryName =
      queryName.length < SHOW_QUERY_NAME_LENGTH
        ? queryName
        : queryName.substring(0, SHOW_QUERY_NAME_LENGTH) + "...";
    const message = `<div style="display:flex;align-items:center;gap:2px;">
        <img src="icon/check-mark.png"/>
        <span><b>${showQueryName}</b> file data saved successfully</span>
        </div>`;
    showToast(message, SAVE_UTILITY_DEFAULT_DELAY);
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      showToast(
        `<div style="color: #FF6347;"><b>Error:</b> Browser's local storage is full!!</div>`,
        SAVE_UTILITY_DEFAULT_DELAY
      );
    } else {
      showToast(
        `<div style="color: #FF6347;">Something went wrong</div>`,
        SAVE_UTILITY_DEFAULT_DELAY
      );
      console.error(error);
    }

    // Deleting query object from queryData
    delete queryData[key];
  }
}

function loadQueryInfo(key = undefined) {
  const queryObj = queryData[key] || {};
  const queryId = queryObj[KEY_QUERY_ID] || "";
  const queryName = queryObj[KEY_QUERY_NAME] || "";
  const query = queryObj[KEY_QUERY] || "";
  const iterationMode = queryObj[KEY_ITERATION_MODE] == 1; //  Need to change when other mode will implemented
  const delimiter = queryObj[KEY_DELIMITER] || "$";
  const placeholders = queryObj[KEY_PLACEHOLDERS] || {};

  document.getElementById("queryId").value = queryId;
  document.getElementById("queryName").value = queryName;
  document.getElementById("query").value = query;
  document.getElementById("iteration-mode").checked = iterationMode;
  document.getElementById("delimiter").value = delimiter;

  document.getElementById("data").value = "";
  document.getElementById("output").value = "";
  document.getElementById("filename").value = "output.txt";

  contentFormat();
  handleChangeIterationMode();
  toggleSidebar();

  // Setting default placeholder values
  for (const placeholderId of Object.keys(placeholders)) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) continue;
    placeholder.value = placeholders[placeholderId];
  }

  const showQueryName =
    queryName.length < SHOW_QUERY_NAME_LENGTH
      ? queryName
      : queryName.substring(0, SHOW_QUERY_NAME_LENGTH) + "...";
  showToast(
    `<b>${showQueryName}</b> file data loaded successfully`,
    SAVE_UTILITY_DEFAULT_DELAY
  );
}

function isQueryNameExist(queryName, searchKeyRegex) {
  if (!searchKeyRegex) return true;
  if (!queryName) return false;
  queryName = queryName.toLowerCase();
  return searchKeyRegex.test(queryName);
}

function getFormattedQueryName(searchedChars, queryName) {
  if (searchedChars.length == 0) return queryName;
  let formattedQueryName = "";
  let index = 0;
  let sIndex = 0;
  while (sIndex < searchedChars.length && index < queryName.length) {
    if (searchedChars[sIndex].toLowerCase() == queryName[index].toLowerCase()) {
      formattedQueryName += `<span class="highlight">${queryName[index]}</span>`;
      sIndex++;
    } else {
      formattedQueryName += queryName[index];
    }
    index++;
  }
  formattedQueryName += queryName.substring(index);

  return formattedQueryName;
}

function loadQueryNameList(searchKey = undefined) {
  const queryNameList = document.getElementById("queryNameList");
  const searchKeyRegex =
    !searchKey || searchKey.trim().length == 0
      ? undefined
      : new RegExp(
          ".*" + [...searchKey.trim().toLowerCase()].join(".*") + ".*"
        );
  const filteredQueryNames = Object.keys(queryData)
    .filter((key) =>
      isQueryNameExist(queryData[key][KEY_QUERY_NAME], searchKeyRegex)
    )
    .map((key) => queryData[key]);

  if (filteredQueryNames.length) {
    const searchedChars = searchKeyRegex ? searchKey.trim() : "";
    queryNameList.innerHTML = filteredQueryNames
      .map((obj) =>
        rawQueryItem
          .replace(
            "{query_content}",
            getFormattedQueryName(searchedChars, obj[KEY_QUERY_NAME])
          )
          .replaceAll("{query_id}", obj[KEY_QUERY_ID])
      )
      .join("");
  } else {
    queryNameList.innerHTML = `<li class="query-item">No Record Found</li>`;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar.style.left === "0%") {
    // Hide the sidebar
    sidebar.style.left = "-105%";
    menuIcon.src = "icon/menu.png";
    document.body.style.overflow = "";
  } else {
    // Show the sidebar
    sidebar.style.left = "0%";
    menuIcon.src = "icon/close.png";
    document.body.style.overflow = "hidden";
    document.getElementById("queryNameSearch").focus();
    window.scrollTo({ top: 0 });

    // Load default query name list
    loadQueryNameList();
  }
}

function handleDeleteQuery(queryId) {
  const queryName = queryData[queryId][KEY_QUERY_NAME];
  const showQueryName =
    queryName.length < SHOW_QUERY_NAME_LENGTH
      ? queryName
      : queryName.substring(0, SHOW_QUERY_NAME_LENGTH) + "...";

  // Deleting query object from queryData
  delete queryData[queryId];

  // storing updated queryData localStorage.
  localStorage.setItem(KEY_QUERY_DATA, JSON.stringify(queryData));
  showAlert(`<b>${showQueryName}</b> file has been deleted`);

  const queryNameSearch = document.getElementById("queryNameSearch").value;
  loadQueryNameList(queryNameSearch);
}

function handleClickSave() {
  const queryId = document.getElementById("queryId").value;
  saveQueryInLocalStorage(queryId);
}

function handleClickReset() {
  document.getElementById("queryName").value = DEFAULT_FILE_NAME;
  document.getElementById("query").value = "";
  document.getElementById("iteration-mode").checked = true;
  document.getElementById("delimiter").value = "$";
  document.getElementById("queryId").value = "";
  document.getElementById("data").value = "";
  document.getElementById("output").value = "";
  document.getElementById("filename").value = "output.txt";

  contentFormat();
  handleChangeIterationMode();
  showToast("Data rested successfully", SAVE_UTILITY_DEFAULT_DELAY);
}

// Export data as JSON
function handleExportData() {
  const data = getQueryDataFromLocalStorage();

  // ...settings logic if needed...
  const dataStr = JSON.stringify(data);
  const fileName = `query-generator-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  downloadFile(dataStr, fileName);
  showToast(`<div style="display:flex;align-items:center;gap:2px;">
        <img src="icon/check-mark.png"/>
        <span>Data exported successfully.</span>
        </div>`);
}

// Import data from JSON
function handleImportData() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) {
    showAlert("Please select a JSON file to import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      const data = getQueryDataFromLocalStorage();
      for (const obj of Object.keys(imported)) {
        const queryId = generateId();
        obj[KEY_QUERY_ID] = queryId; // Assign a new ID to avoid conflicts
        data[queryId] = {
          ...imported[obj],
          [KEY_QUERY_ID]: queryId, // Ensure the ID is set correctly
        };
      }
      localStorage.setItem(KEY_QUERY_DATA, JSON.stringify(data));

      for (const key of Object.keys(queryData)) {
        delete queryData[key];
      }
      for (const key of Object.keys(data)) {
        queryData[key] = data[key];
      }

      // If you have settings, handle them here
      showToast(`<div style="display:flex;align-items:center;gap:2px;">
        <img src="icon/check-mark.png"/>
        <span>Data imported successfully</span>
        </div>`);
      document.getElementById("importModal").style.display = "none";
      document.getElementById("importFile").value = "";
    } catch (err) {
      showAlert("Invalid JSON file.");
      console.error("Error parsing JSON:", err);
    }
  };
  reader.readAsText(file);
}
