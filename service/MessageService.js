async function getUnreadMessageCounts(userId) {
	return await messageGETRequest('/unread/user/' + userId);
}

async function messageGETRequest(request) {
	request = encodeURI(request);
    await service.get('/message' + request)
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
            console.error('message GET request error: ', request, error);
            return error;
		});
}