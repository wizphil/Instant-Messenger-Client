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

const WebSocket = require('ws');

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
let myUserId;
let sessionId;
let webSocketClient;
let myStatus = null;
let inErrorState = false;

async function main() {
	console.log('Starting application.');
	
	mainWindow = new Window({
		file: path.join('renderer', 'main_window', 'index.html')
	})

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

	mainWindow.once('ready-to-show', () => {
		reconnect();
	});
}

async function getMyUser() {
	// Step 1, get your own user
	// If you don't have a user, go to new user flwo
	try {
		console.log('Attempting login as: ', realUsername);
		self = await UserService.getUserByUsername(service, realUsername);
		if (self != null) {
			console.info('Found user for username: \'', realUsername, '\', self: ', self);
			myUserId = self.id;
		} else {
			console.info('Could not find user for username: \'', realUsername, '\', entering new user flow');
			mainWindow.webContents.send('newUser', username);
		}
	} catch (error) {
		handleError("Login failed. Failed to connect to server.", error, true);
	}
}

async function reconnect() {
	// even if we've already gotten our user before, our settings may have changed, let's get an updated model
	await getMyUser();
	if (self) {
		await goOnline();
	}
}

async function goOnline() {
	if (inErrorState) {
		return;
	}

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
	mainWindow.webContents.send('afterLogin', myUserId, users, unreadMessageCounts);
}

function connectToWebSocket() {
	if (self == null) {
		console.info('Attempted to connect to websocket, but self was null. username: \'', realUsername, '\', going offline.');
		goOffline();
		return;
	}
	
	sessionId = null;
	webSocketClient = new WebSocket('ws://' + serviceHostPort + '/session/user/' + self.id);

	webSocketClient.on('open', function open() {
		console.log('webSocketClient connected');
	});

	webSocketClient.on('close', function close() {
		console.info('WebSocket closed, going offline.');
		goOffline();
	});
	
	webSocketClient.on('error', function error(error) {
		console.warn('WebSocket error, entering error state. Error: ', error);
		let errorMessage = 'Connection error. Is the server down? Are you offline? \n';
		goOffline(errorMessage);
	});

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
	webSocketClient.on('message', function incoming(data) {
		console.log('websocket message received data: ', data);
		var message = JSON.parse(data);
		var category = message.category;
		var content = JSON.parse(message.content);
		console.debug('websocket received message, category: ', category, ', content: \'',content,'\'');
		
		switch (category) {
			case 'DirectMessage':
				break;
			case 'UserTypingPing':
				break;
			case 'GroupTypingPing':
				break;
			case 'NewGroup':
				break;
			case 'UsersAddedToGroup':
				break;
			case 'UserRemovedFromGroup':
				break;
			case 'NewUser':
				break;
			case 'UpdateUserDetails':
				break;
			case 'UpdateUserStatus':
				break;
			case 'DisableUser':
				break;
			case 'EstablisedSession':
				sessionId = content;
				if (myStatus == null) {
					myStatus = 'Available';
				}
			
				setStatus(myStatus);
				isOnline = true;
				break;
			case 'CloseSession':
				goOffline();
				break;
			default:
				console.warn('websocket received message of unknown category: ', category);
				break;
		}
	});
}

async function getAllUsers() {
	try {
		users = await UserService.getAllUserInfo(service);
	} catch (error) {
		handleError("Login failed (Failed to fetch users).", error, true);
	}
}

async function getUnreadMessages() {
	try {
		unreadMessageCounts = await MessageService.getUnreadMessageCounts(service, self.id);
	} catch (error) {
		// go offline
		handleError("Failed to get unread messages.", error, false);
	}

}

function setStatus(status) {
	UserService.setStatus(service, myUserId, sessionId, status);
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
	  errorMessage += 'The request was made but no response was received. \nIs the server down? Are you offline?';
	} else {
	  // Something happened in setting up the request that triggered an Error
	  errorMessage += 'An unexpected error has occured.\nError message: ' + error.message;
	}
	
	// Entering an error state is different than going offline.
	// We're still offline, but we show the user the error.
	if (enterErrorState) {
		inErrorState = true;
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
		mainWindow.webContents.send('error', errorMessage);
	} else {
		mainWindow.webContents.send('offline');
	}
}

app.on('ready', main)

app.on('window-all-closed', function() {
	app.quit()
})