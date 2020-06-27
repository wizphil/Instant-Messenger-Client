'use strict'

// delete todo by its text value ( used below in event listener)
// const deleteTodo = (e) => {
//   ipcRenderer.send('delete-todo', e.target.textContent)
// }

// create add todo window button
// document.getElementById('createTodoBtn').addEventListener('click', () => {
//   ipcRenderer.send('add-todo-window')
// })

// on receive new-account flow
ipcRenderer.on('error', (event, errorMessage) => {
  console.log('error received, errorMessage: ', errorMessage);

  // get the todoList ul
  let main = document.getElementById('main');
  let disconnected = document.getElementById('disconnected');
  let loading = document.getElementById('loading');
  let newUser = document.getElementById('newUser');
  
  disconnected.classList.remove('isHidden');
  
  main.classList.add('isHidden');
  loading.classList.add('isHidden');
  newUser.classList.add('isHidden');

  disconnected.innerText = errorMessage;

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

