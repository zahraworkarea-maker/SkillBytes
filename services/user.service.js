const UserService = (apiHandler) => {
	const url = "/auth/user";

	async function retrieve(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	async function retrieveAll() {
		return apiHandler(`${url}/all`, {
			method: "GET",
		});
	}

	async function retrieveById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	async function login(req) {
		return apiHandler(`${url}/login`, {
			method: "POST",
			data: req,
		});
	}

	async function save(req) {
		if (req?.get && req.get("id")) {
			return update(req);
		}

		return create(req);
	}

	async function create(req) {
		return apiHandler(url, {
			method: "POST",
			data: req,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	async function update(req) {
		return apiHandler(url, {
			method: "PUT",
			data: req,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	async function updatePassword(id, req) {
		return apiHandler(`${url}/update-password/${id}`, {
			method: "PUT",
			data: req,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	return {
		retrieve,
		retrieveAll,
		retrieveById,
		destroy,
		login,
		save,
		create,
		update,
		updatePassword,
	};
};

export default UserService;
