
let datastore
// Database version.
const version = 1
const DB_NAME = 'todos'
const STORE_NAME = 'todo'

/**
 * Open a connection to the datastore.
 */
export function openDb(callback) {
  // Open a connection to the datastore.
  const request = indexedDB.open(DB_NAME, version)

  // Handle datastore upgrades.
  request.onupgradeneeded = function(e) {
    const db = e.target.result

    e.target.transaction.onerror = onDberror

    // Delete the old datastore.
    if (db.objectStoreNames.contains(STORE_NAME)) {
      db.deleteObjectStore(STORE_NAME)
    }

    // Create a new datastore.
    db.createObjectStore(STORE_NAME, {
      keyPath: 'timestamp',
    })
  }

  // Handle successful datastore access.
  request.onsuccess = function(e) {
    // Get a reference to the DB.
    datastore = e.target.result

    // Execute the callback.
    callback()
  }

  // Handle errors when opening the datastore.
  request.onerror = onDberror
}

/**
 * Fetch all of the todo items in the datastore.
 */
export function fetchTodos(callback) {
  const db = datastore
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const objStore = transaction.objectStore(STORE_NAME)

  const keyRange = IDBKeyRange.lowerBound(0)
  const cursorRequest = objStore.openCursor(keyRange)

  const todos = []

  transaction.oncomplete = function(e) {
    // Execute the callback function.
    callback(todos)
  }

  cursorRequest.onsuccess = function(e) {
    const result = e.target.result

    if (!!result === false) {
      return
    }

    todos.push(result.value)

    result.continue()
  }

  cursorRequest.onerror = onDberror
}

/**
 * Create a new todo item.
 */
export function createTodo(text, callback) {
  // Get a reference to the db.
  const db = datastore

  // Initiate a new transaction.
  const transaction = db.transaction([STORE_NAME], 'readwrite')

  // Get the datastore.
  const objStore = transaction.objectStore(STORE_NAME)

  // Create a timestamp for the todo item.
  const timestamp = new Date().getTime()

  // Create an object for the todo item.
  const todo = {
    text: text,
    timestamp: timestamp,
  }

  // Create the datastore request.
  const request = objStore.put(todo)

  // Handle a successful datastore put.
  request.onsuccess = function(e) {
    // Execute the callback function.
    callback(todo)
  }

  // Handle errors.
  request.onerror = onDberror
}

/**
 * Delete a todo item.
 */
export function deleteTodo(id, callback) {
  const db = datastore
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const objStore = transaction.objectStore(STORE_NAME)

  const request = objStore.delete(id)

  request.onsuccess = function(e) {
    callback()
  }

  request.onerror = onDberror
}

function onDberror(e) {
  console.error(e)
}

export function updateTodo(id, text, callback) {
  const db = datastore
  const transaction = db.transaction([STORE_NAME], 'readwrite')
  const objStore = transaction.objectStore(STORE_NAME)
  
  // Create an object for the todo item.
  const todo = {
    text: text,
    timestamp: id,
  }

  // Create the datastore request.
  const request = objStore.put(todo)

  // Handle a successful datastore put.
  request.onsuccess = function(e) {
    // Execute the callback function.
    callback(todo)
  }

  // Handle errors.
  request.onerror = onDberror
}