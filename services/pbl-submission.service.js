const PBLSubmissionService = (apiHandler) => {
	const url = "/pbl-submissions";

	async function submit(data) {
		return apiHandler(url, {
			method: "POST",
			data,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

	async function getSubmissions(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	async function getSubmissionById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	async function getSubmissionDetails(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	return {
		submit,
		getSubmissions,
		getSubmissionById,
		getSubmissionDetails,
	};
};

export default PBLSubmissionService;
