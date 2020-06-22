module.exports = {
	getUnreadMessageCounts: async function(service, userId) {
		return await this.messageGETRequest(service, '/unread/user/' + userId);
	},

	messageGETRequest: async function (service, request) {
		request = encodeURI(request);
		let responseData = await service.get('/message' + request)
			.then(function (response) {
				// handle success
				if (response.data == null || response.data == '') {
					console.log('succeeded message GET request: ', request, ', no response.data');
					return null;
				} else {
					console.log('succeeded message GET request: ', request, ', response.data: ', response.data);
					return response.data;
				}
			})
			.catch(function (error) {
				// handle error
				console.error('failed message GET request: ', request, ', error: ', error);
				throw error;
			});

		return responseData;
	}
}