'use strict'

const path = require('path')
const axios = require('axios')
const {
	app,
	ipcMain
} = require('electron')

const Window = require('./core/BaseWindow');
const UserService = require('./service/UserService');
const MessageService = require('./service/MessageService');
const GroupService = require('./service/GroupService');

// TODO don't hardcode the serviceHostPort
const serviceHostPort = 'localhost:8080';
const service = axios.create({
	baseURL: 'http://' + serviceHostPort + '/v1'
});

const os = require('os');

// when we display the username (done in new user flow), we don't include the domain (it's extra info the user doesn't really need)
// however, when we create the account, we make sure the domain is part of the username to prevent mixup of accounts
const domain = os.hostname();
const username = os.userInfo().username;
const realUsername = 'pkelly';//domain + '\\' + username;
let isOnline = false;
let mainWindow;
let users;
let unreadMessageCounts;
let self;
let userId;
let sessionId;
let webSocketClient;
let myStatus = null;


async function main() {
	console.log('Starting application.');
	// todo list window
	mainWindow = new Window({
		file: path.join('renderer', 'main_window', 'index.html')
	})

	// add todo window
	// let addTodoWin

	// // TODO: put these events into their own file

	// // initialize with todos
	// mainWindow.once('show', () => {
	// 	mainWindow.webContents.send('todos', todosData.todos)
	// })

	// // create add todo window
	// ipcMain.on('add-todo-window', () => {
	// 	// if addTodoWin does not already exist
	// 	if (!addTodoWin) {
	// 		// create a new add todo window
	// 		addTodoWin = new Window({
	// 			file: path.join('renderer', 'add_item', 'add.html'),
	// 			width: 400,
	// 			height: 400,
	// 			// close with the main window
	// 			parent: mainWindow
	// 		})

	// 		// cleanup
	// 		addTodoWin.on('closed', () => {
	// 			addTodoWin = null
	// 		})
	// 	}
	// })

	// // add-todo from add todo window
	// ipcMain.on('add-todo', (event, todo) => {
	// 	const updatedTodos = todosData.addTodo(todo).todos

	// 	mainWindow.send('todos', updatedTodos)
	// })

	// create's new user
	ipcMain.on('create-user', (event, userDetails) => {
		userDetails.username = realUsername;
		userDetails.enabled = true;
		try {
			let createUserResponse = UserService.createUser(service, userDetails);
			console.info('New user created! createUserResponse: ', createUserResponse);

			self = createUserResponse.data;
			goOnline();
		} catch (error) {
			handleError("Failed to create new user.", error, true);
		}
		//const updatedTodos = todosData.deleteTodo(todo).todos

		//mainWindow.send('todos', updatedTodos)
	});

	reconnect();
}

async function getMyUser() {
	// Step 1, get your own user
	// If you don't have a user, go to new user flwo
	try {
		console.log('Attempting login as: ', realUsername);
		self = await UserService.getUserByUsername(service, realUsername);
		if (self != null) {
			console.info('User for username: \'', realUsername, '\' found, user: ', self);
			userId = self.id;
		} else {
			console.info('Could not find user for username: \'', realUsername, '\', entering new user flow');
			mainWindow.once('show', () => {
				mainWindow.webContents.send('newUser', username);
			})
		}
	} catch (error) {
		handleError("Login failed. Failed to connect to server.", error, true);
	}
}

async function reconnect() {
	// even if we've already gotten our user before, our settings may have changed, let's get an updated model
	await getMyUser();
	//await goOnline();
}

async function goOnline() {
	// Step 1, make sure we have our user
	if (self == null) {
		console.info('Attempted to go online, but self was null. username: \'', realUsername, '\', going offline.');
		goOffline();
		return;
	}

	// Step 2, connect to the websocket
	connectToWebSocket();

	// Step 3, get all users
	await getAllUsers();

	// Step 4, get unread messages 
	await getUnreadMessages();

	// Step 5, create the UI with users + unread messages

	// Step 6 (final step), set our status! (aka appear online to all other users)
	if (myStatus == null) {
		myStatus = 'Available';
	}

	setStatus(myStatus);
	isOnline = true;
}

function connectToWebSocket() {
	if (self == null) {
		console.info('Attempted to connect to websocket, but self was null. username: \'', realUsername, '\', going offline.');
		goOffline();
		return;
	}
	
	webSocketClient = new WebSocket('ws://' + serviceHostPort + '/session/' + sessionId + '/user/' + self.id);

	webSocketClient.onclose = function(event) {
		console.info('WebSocket closed, going offline. Event: ', event);
		goOffline();
	};
	
	webSocketClient.onerror = function(event) {
		console.warn('WebSocket error, entering error state. Event: ', event);
		let errorMessage = 'Connection error. Is the server down? Are you offline? \n';
		goOffline(errorMessage);
	};

	// when we receive a message from the server it's always in the form of MessageCategory and content
	/// content depents on the message category
	/// MessageCategory is:
	//// DirectMessage("dm"),
    //// UserTypingPing("ping"),
    //// GroupTypingPing("gping"),
    //// NewGroup("newgroup"),
    //// UsersAddedToGroup("addgusers"),
    //// UserRemovedFromGroup("rmguser"),
    //// NewUser("newuser"),
    //// UpdateUserDetails("udetails"),
    //// UpdateUserStatus("ustatus"),
	//// DisableUser("deluser"),
    //// EstablisedSession("newsession"),
    //// CloseSession("delsession");
	webSocketClient.onmessage = function(event) {
		var message = JSON.parse(event.data);
		var category = message.category;
		var content = JSON.parse(message.content);
		console.debug('websocket received message, category: ', category);
		
		switch (category) {
			case 'dm':
				break;
			case 'ping':
				break;
			case 'gping':
				break;
			case 'newgroup':
				break;
			case 'addgusers':
				break;
			case 'rmguser':
				break;
			case 'newuser':
				break;
			case 'udetails':
				break;
			case 'ustatus':
				break;
			case 'deluser':
				break;
			case 'newsession':
				sessionId = content;
				break;
			case 'delsession':
				goOffline();
				break;
			default:
				console.warn('websocket received message of unknown category: ', category);
				break;
		}
	};
}

async function getAllUsers() {
	try {
		let getAllUsersResponse = await UserService.getAllUserInfo(service);
	} catch (error) {
		handleError("Login failed (Failed to fetch users).", error, true);
	}
}

async function getUnreadMessages() {
	try {
		let getUnreadMessageCountsResponse = await MessageService.getUnreadMessageCounts(self.id);
	} catch (error) {
		// go offline
		handleError("Failed to get unread messages.", error, false);
	}

}

function setStatus(status) {
	UserService.setStatus(service, userId, sessionId,status);
}

function handleError(failedComponent, error, enterErrorState) {
	let errorMessage = failedComponent + '\n';
	if (error.response) {
	  // The request was made and the server responded with a status code
	  // that falls out of the range of 2xx
	  errorMessage += 'Received error from server. \nResponse code: ' + error.response.status + ', Response: ' + error.response.data;
	} else if (error.request) {
	  // The request was made but no response was received
	  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
	  // http.ClientRequest in node.js
	  errorMessage += 'The request was made but no response was received. Is the server down? Are you offline?';
	} else {
	  // Something happened in setting up the request that triggered an Error
	  errorMessage += 'An unexpected error has occured.\nError message: ' + error.message;
	}
	
	// Entering an error state is different than going offline.
	// We're still offline, but we show the user the error.
	if (enterErrorState) {
		goOffline(errorMessage);
		console.error('Received breaking errorMessage: ', errorMessage, ', error: ', error);
	} else {
		console.warn('Received non-breaking errorMessage: ', errorMessage);
	}
}

// this function is for graceful log offs
function goOffline(errorMessage) {
	if (isOnline) {	
		setStatus('Offline');
	}

	isOnline = false;
	sessionId = null;
	if (webSocketClient) {
		webSocketClient.close();
	}

	webSocketClient = null;
	
	if (errorMessage) {
		mainWindow.once('show', () => {
			mainWindow.webContents.send('error', errorMessage);
		})
	} else {
		mainWindow.once('show', () => {
			mainWindow.webContents.send('offline');
		})
	}
}

app.on('ready', main)

app.on('window-all-closed', function() {
	app.quit()
})