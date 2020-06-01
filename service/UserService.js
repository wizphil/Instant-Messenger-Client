
module.exports = {
	getUserByUsername: async function (service, username) {
		return await this.userGETRequest(service, '/username/' + username);
	},

	getAllUserInfo: async function (service) {
		return await this.userGETRequest(service, '/info/');
	},

	createUser: async function(service, userDetails) {
		return await this.userPOSTRequest(service, '', userDetails);
	},

	setStatus: function(service, id, sessionId, status) {
		this.userPUTRequest(service, id + '/session/' + sessionId + '/status/' + status, null);
	},

	userGETRequest: async function (service, request) {
		request = encodeURI(request);
		await service.get('/user' + request)
			.then(function (response) {
				// handle success
				if (response.data == null || response.data == '') {
					return null;
				} else {
					return response.data;
				}
			})
			.catch(function (error) {
				// handle error
				console.error('failed user GET request: ', request, ', error: ', error);
				throw error;
			});
	},

	userPUTRequest: function (service, request, body) {
		request = encodeURI(request);
		service.put('/user' + request, body)
			.then(function (response) {
				// handle success
				if (response.data == null || response.data == '') {
					return null;
				} else {
					return response.data;
				}
			})
			.catch(function (error) {
				// handle error
				console.warn('failed user PUT request: ', request, ', body: ', body, ' error: ', error);
			});
	},

	userPOSTRequest: async function (service, request, body) {
		request = encodeURI(request);
		await service.post('/user' + request, body)
			.then(function (response) {
				// handle success
				if (response.data == null || response.data == '') {
					return null;
				} else {
					return response.data;
				}
			})
			.catch(function (error) {
				// handle error
				console.error('failed user POST request: ', request, ', body: ', body, ' error: ', error);
				throw error;
			});
	}
}