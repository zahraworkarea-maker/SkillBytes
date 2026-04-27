const MateriService = (apiHandler) => {
	const url = "/lessons";

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

	async function retrieveBySlug(slug) {
		return apiHandler(`${url}/${slug}`, {
			method: "GET",
		});
	}

	async function destroy(slug) {
		return apiHandler(`${url}/${slug}`, {
			method: "DELETE",
		});
	}

	async function complete(lesson) {
		return apiHandler(`${url}/${lesson}/complete`, {
			method: "POST",
		});
	}

	async function save(req) {
		if (req?.get && req.get("slug")) {
			return update(req.get("slug"), req);
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

	async function update(slug, req) {
		return apiHandler(`${url}/${slug}`, {
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
		retrieveBySlug,
		destroy,
		complete,
		save,
		create,
		update,
	};
};

export default MateriService;
