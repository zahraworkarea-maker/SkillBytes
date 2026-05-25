const UserResumeService = (apiHandler) => {
	const url = "/user/resumes";

	async function retrieveAll(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	async function retrieveById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	async function create(lessonId, content) {
		return apiHandler(url, {
			method: "POST",
			data: {
				lesson_id: lessonId,
				content: content,
			},
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	async function update(id, req) {
		return apiHandler(`${url}/${id}`, {
			method: "PUT",
			data: req,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	return {
		retrieveAll,
		retrieveById,
		create,
		update,
		destroy,
	};
};

export default UserResumeService;
