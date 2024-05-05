const KEY_QUERY_DATA = "QUERY_DATA";
const KEY_QUERY_NAME = "queryName";
const KEY_QUERY_ID = "queryId";
const KEY_QUERY = "query";
const KEY_ITERATION_MODE = "iteration-mode";
const KEY_DELIMITER = "delimiter";
const KEY_CREATED_DATE = "createdDate";
const DEFAULT_FILE_NAME = "Untitled";
const tempQueryData1 = {
  "c5e3f1c8-975b-4b55-967f-d8c59a5d4f1e": {
    queryId: "c5e3f1c8-975b-4b55-967f-d8c59a5d4f1e",
    queryName: "Query1",
    query: "SELECT * FROM data WHERE condition = true",
    "iteration-mode": "single",
    Delimiter: ";",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "b4f9a8d3-2d24-4e23-bd72-3c36e0a39f10": {
    queryId: "b4f9a8d3-2d24-4e23-bd72-3c36e0a39f10",
    queryName: "Query2",
    query: "SELECT column1, column2 FROM table2 WHERE condition = false",
    "iteration-mode": "multiple",
    Delimiter: ",",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "d8a7b2f1-8e2c-43c8-8df7-6c3e5f7a1e23": {
    queryId: "d8a7b2f1-8e2c-43c8-8df7-6c3e5f7a1e23",
    queryName: "Query3",
    query: "SELECT * FROM table3 WHERE condition = true",
    "iteration-mode": "single",
    Delimiter: "|",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "e4f9c8d1-6b2e-49e6-8e23-5a8c4f7b9a0e": {
    queryId: "e4f9c8d1-6b2e-49e6-8e23-5a8c4f7b9a0e",
    queryName: "Query4",
    query: "SELECT * FROM table1 WHERE condition = true",
    "iteration-mode": "multiple",
    Delimiter: ";",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "a7d3e8c5-2e7c-4f1a-8d1f-3c4e5f7a0b2c": {
    queryId: "a7d3e8c5-2e7c-4f1a-8d1f-3c4e5f7a0b2c",
    queryName: "Query5",
    query: "SELECT * FROM table2 WHERE condition = false",
    "iteration-mode": "single",
    Delimiter: "\t",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "f8e9a7c3-1d2e-4b5f-8c1e-2f3e4a5b7c9d": {
    queryId: "f8e9a7c3-1d2e-4b5f-8c1e-2f3e4a5b7c9d",
    queryName: "Query6",
    query: "SELECT column1 FROM table3",
    "iteration-mode": "multiple",
    Delimiter: ",",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "b9d2c8a4-3e5f-4a6d-9b2e-7c8d4e1a3f5g": {
    queryId: "b9d2c8a4-3e5f-4a6d-9b2e-7c8d4e1a3f5g",
    queryName: "Query7",
    query: "SELECT * FROM data WHERE condition = true",
    "iteration-mode": "single",
    Delimiter: ";",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "c3d4a7b8-9f5e-4d6b-8a7c-1e9d8b2a3c4d": {
    queryId: "c3d4a7b8-9f5e-4d6b-8a7c-1e9d8b2a3c4d",
    queryName: "Query8",
    query: "SELECT column1, column2 FROM table2 WHERE condition = false",
    "iteration-mode": "multiple",
    Delimiter: "|",
    createdDate: "2024-04-29T00:00:00Z",
  },
  "a5b3e9c1-7d2e-4f6b-9a7d-8c4e1f5a3b6c": {
    queryId: "a5b3e9c1-7d2e-4f6b-9a7d-8c4e1f5a3b6c",
    queryName: "Query9",
    query: "SELECT column1 FROM table3 WHERE condition = true",
    "iteration-mode": "single",
    Delimiter: ",",
    createdDate: "2024-04-29T00:00:00Z",
  },
};
const queryData = getQueryDataFromLocalStorage();
// const queryData = tempQueryData1;
const rawQueryItem = `<li class="query-item">
<span class="query-name-content">{query_content}</span>
<img src="icon/edit.png" alt="Edit" title="Edit" class="img-btn" width="25px" />
<img src="icon/bin.png" alt="Delete" title="Delete" class="img-btn" width="25px" onclick="handleDeleteQuery('{query_id}')"/>
</li>`;

function getQueryDataFromLocalStorage() {
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(KEY_QUERY_DATA));
  } catch (error) {}
  return data;
}

function saveQueryInLocalStorage(key = undefined) {
  key = key || generateId();
  const queryObj = queryData[key] || {};

  // TODO: write information
  queryObj[KEY_QUERY_NAME] = "";
  queryObj[KEY_QUERY] = "";
  queryObj[KEY_ITERATION_MODE] = "";
  queryObj[KEY_DELIMITER] = "";
  queryObj[KEY_CREATED_DATE] = new Date();

  queryData[key] = queryObj;
  localStorage.setItem(KEY_QUERY_DATA, JSON.stringify(queryData));
}

function loadQueryInfo(key = undefined) {
  const queryObj = queryData[key] || {};
  const queryName = queryObj[KEY_QUERY_NAME] || "";
  const query = queryObj[KEY_QUERY] || "";
  const iterationMode = queryObj[KEY_ITERATION_MODE] || "";
  const delimiter = queryObj[KEY_DELIMITER] || "";
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
    !searchKey || searchKey.trim() == 0
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
          .replace("{query_id}", obj[KEY_QUERY_ID])
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
  // Deleting query object from queryData
  delete queryData[queryId];

  // storing updated queryData localStorage.
  localStorage.setItem(KEY_QUERY_DATA, JSON.stringify(queryData));

  const queryNameSearch = document.getElementById("queryNameSearch").value;
  loadQueryNameList(queryNameSearch);
}
