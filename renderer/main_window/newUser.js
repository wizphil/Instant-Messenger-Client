'use strict'

const { ipcRenderer } = require('electron')
let isNewUser = false;

document.addEventListener('keyup', (event) => {
  const keyName = event.key;

  // validate input fields
  if (isNewUser) {

    let fullName = document.getElementById('fullNameInput').value;
    let extension = document.getElementById('extensionInput').value;

    let fullNameMinSizeTip = document.getElementById('fullNameMinSizeTip');
    let extensionNumbersOnlyTip = document.getElementById('extensionNumbersOnlyTip');
    
    let canCreate = true;
    if(fullName.length >= 3 && fullName.length <= 30) {
      fullNameMinSizeTip.classList.add('isGreen');
      fullNameMinSizeTip.classList.remove('isRed');
    } else {
      canCreate = false;
      fullNameMinSizeTip.classList.remove('isGreen');
      fullNameMinSizeTip.classList.add('isRed');
    }

    // regex to make sure the extension only contains numbers
    if (/^\d+$/.test(extension)) {
      extensionNumbersOnlyTip.classList.add('isGreen');
      extensionNumbersOnlyTip.classList.remove('isRed');
    } else {
      canCreate = false;
      extensionNumbersOnlyTip.classList.remove('isGreen');
      extensionNumbersOnlyTip.classList.add('isRed');
    }

    if (canCreate) {
      enableCreateUserButton();
    } else {
      disableCreateUserButton();
    }
  }

  if (keyName === 'Control') {
    // do not alert when only Control key is pressed.
    return;
  }

  if (event.ctrlKey) {
    // Even though event.key is not 'Control' (e.g., 'a' is pressed),
    // event.ctrlKey may be true if Ctrl key is pressed at the same time.
    //alert(`Combination of ctrlKey + ${keyName}`);
  } else {
    //alert(`Key pressed ${keyName}`);
  }
}, false);

function disableCreateUserButton() {
  let createUserButton = document.getElementById('create-user-btn');
  createUserButton.classList.add('disabled');
  createUserButton.classList.add('btn-secondary');
  createUserButton.classList.remove('btn-primary');
}

function enableCreateUserButton() {
  let createUserButton = document.getElementById('create-user-btn');
  createUserButton.classList.remove('disabled');
  createUserButton.classList.remove('btn-secondary');
  createUserButton.classList.add('btn-primary');
}

function createUser() {
  let fullName = document.getElementById('fullNameInput').value;
  let extension = document.getElementById('extensionInput').value;

  if(fullName.length < 3 || fullName.length > 30 || !/^\d+$/.test(extension)) {
    alert("Full Name must be between 3 and 30 characters. Extension must be empty or only numbers.");
    return;
  }

  let userDetails = {'fullname': fullName, 'extension': extension};

  console.log('Create User clicked with userDetails: ', userDetails);
  ipcRenderer.send('create-user', userDetails);
}

// delete todo by its text value ( used below in event listener)
// const deleteTodo = (e) => {
//   ipcRenderer.send('delete-todo', e.target.textContent)
// }

// create add todo window button
// document.getElementById('createTodoBtn').addEventListener('click', () => {
//   ipcRenderer.send('add-todo-window')
// })

// on receive new-account flow
ipcRenderer.on('newUser', (event, username) => {
  console.log('newUser received, username: ', username);
  isNewUser = true;

  // get the todoList ul
  let welcome = document.getElementById('welcome');
  let loading = document.getElementById('loading');
  let newUser = document.getElementById('newUser');

  welcome.innerText = "Welcome " + username + "!";
  loading.classList.add('isHidden');
  newUser.classList.remove('isHidden');

  // create html string
//   const todoItems = todos.reduce((html, todo) => {
//     html += `<li class="todo-item">${todo}</li>`

//     return html
//   }, '')

//   // set list html to the todo items
//   //todoList.innerHTML = todoItems

//   // add click handlers to delete the clicked todo
//   todoList.querySelectorAll('.todo-item').forEach(item => {
//     item.addEventListener('click', deleteTodo)
//   })
})

