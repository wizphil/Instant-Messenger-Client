async function groupGETRequest(request) {
	request = encodeURI(request);
    await service.get('/group' + request)
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
            console.log('group GET request error: ', request, error);
            return error;
		});
}