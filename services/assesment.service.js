const AssessmentService = (apiHandler) => {
	const url = "/assessments";

	/**
	 * Retrieve all assessments with pagination
	 * @param {Object} params - Query parameters (page, per_page, search)
	 * @returns {Promise} Paginated assessments list response
	 */
	async function retrieve(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	/**
	 * Retrieve a specific assessment by ID
	 * @param {number} id - Assessment ID
	 * @returns {Promise} Single assessment response with message and data
	 */
	async function retrieveById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	/**
	 * Retrieve assessment details with questions
	 * @param {number} slug - Assessment slug/identifier
	 * @returns {Promise} Assessment detail with questions response
	 */
	async function retrieveBySlug(slug) {
		return apiHandler(`${url}/${slug}`, {
			method: "GET",
		});
	}

	/**
	 * Create a new assessment
	 * @param {Object} req - Assessment data
	 * @returns {Promise} Created assessment response with message and data
	 */
	async function create(req) {
		return apiHandler(url, {
			method: "POST",
			data: req,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Update an existing assessment
	 * @param {number} id - Assessment ID
	 * @param {Object} req - Updated assessment data
	 * @returns {Promise} Updated assessment response with message and data
	 */
	async function update(id, req) {
		return apiHandler(`${url}/${id}`, {
			method: "PUT",
			data: req,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Delete an assessment
	 * @param {number} id - Assessment ID
	 * @returns {Promise} Deleted assessment response with message and data
	 */
	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save an assessment (create or update)
	 * @param {Object} req - Assessment data with optional id
	 * @returns {Promise} Saved assessment response
	 */
	async function save(req) {
		if (req?.id) {
			return update(req.id, req);
		}

		return create(req);
	}

	return {
		retrieve,
		retrieveById,
		retrieveBySlug,
		create,
		update,
		destroy,
		save,
	};
};

export default AssessmentService;
