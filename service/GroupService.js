module.exports = {
	groupGETRequest: async function (service, request) {
		request = encodeURI(request);
		let responseData = await service.get('/group' + request)
			.then(function (response) {
				// handle success
				if (response.data == null || response.data == '') {
					console.log('succeeded group GET request: ', request, ', no response.data');
					return null;
				} else {
					console.log('succeeded group GET request: ', request, ', response.data: ', response.data);
					return response.data;
				}
			})
			.catch(function (error) {
				// handle error
				console.error('failed group GET request: ', request, ', error: ', error);
				throw error;
			});

		return responseData;
	}
}