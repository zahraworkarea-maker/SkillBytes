const MateriLvlService = (apiHandler) => {
	const url = "/levels";

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

	async function retrieveById(level) {
		return apiHandler(`${url}/${level}`, {
			method: "GET",
		});
	}

	async function retrieveLessons(level) {
		return apiHandler(`${url}/${level}/lessons`, {
			method: "GET",
		});
	}

	async function destroy(level) {
		return apiHandler(`${url}/${level}`, {
			method: "DELETE",
		});
	}

	async function save(req) {
		const level =
			req?.get &&
			(req.get("level") || req.get("level_number") || req.get("id"));

		if (level) {
			return update(level, req);
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

	async function update(level, req) {
		return apiHandler(`${url}/${level}`, {
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
		retrieveLessons,
		destroy,
		save,
		create,
		update,
	};
};

export default MateriLvlService;
