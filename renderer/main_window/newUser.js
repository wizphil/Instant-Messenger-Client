'use strict'

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

  // get the todoList ul
  let main = document.getElementById('mainView');
  let disconnected = document.getElementById('disconnected');
  let loading = document.getElementById('loading');
  let newUser = document.getElementById('newUser');
  
  newUser.classList.remove('isHidden');
  
  main.classList.add('isHidden');
  disconnected.classList.add('isHidden');
  loading.classList.add('isHidden');

  welcome.innerText = "Welcome " + username + "!";

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

