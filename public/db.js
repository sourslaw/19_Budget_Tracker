let db;
let budgetVersion;
// creating a request for an indexedDB database
const request = indexedDB.open('BudgetDB', budgetVersion || 3);
// changing the db version 
request.onupgradeneeded = function (e) {
  db = e.target.result;
  // if db is empty, create new
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStorage', { autoIncrement: true });
  }
};
// reading and writing
function checkDatabase() {
  // new transaction
  let transaction = db.transaction(['BudgetStorage'], 'readwrite');
  // accesssing the store object
  const fromStore = transaction.objectStore('BudgetStorage');
  // getting all stored objects and setting to getAll
  const allObjs = fromStore.getAll();
  // if successfull . . .
  allObjs.onsuccess = function () {
    if (allObjs.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(allObjs.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        // if response is not empty
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(['BudgetStorage'], 'readwrite');
            // current store is assigne to variable recentStore
            const recentStore = transaction.objectStore('BudgetStorage');
            // clear store
            recentStore.clear();
          }
        });
    }
  };
// checks if application is connected to wifis
request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
// pushes new data to online storage
const saveRecord = (record) => {
  const transaction2 = db.transaction(['BudgetStorage'], 'readwrite');
  const fromStore2 = transaction2.objectStore('BudgetStorage');
  fromStore2.add(record);
};
// checks if app is online or not
window.addEventListener('online', checkDatabase);