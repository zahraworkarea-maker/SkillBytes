const PBLCaseService = (apiHandler) => {
	const url = "/api/pbl-cases";

	/**
	 * Retrieve all PBL cases with pagination
	 * @param {Object} params - Query parameters (page, per_page, search)
	 * @returns {Promise} Paginated PBL cases list response
	 */
	async function retrieve(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	/**
	 * Retrieve a specific PBL case by ID
	 * @param {number} id - Case ID
	 * @returns {Promise} Single PBL case response with message and data
	 */
	async function retrieveById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	/**
	 * Create a new PBL case
	 * @param {Object} req - Case data
	 * @returns {Promise} Created case response with message and data
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
	 * Update an existing PBL case
	 * @param {number} id - Case ID
	 * @param {Object} req - Updated case data
	 * @returns {Promise} Updated case response with message and data
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
	 * Delete a PBL case
	 * @param {number} id - Case ID
	 * @returns {Promise} Deleted case response with message and data
	 */
	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save a PBL case (create or update)
	 * @param {Object} req - Case data with optional id
	 * @returns {Promise} Saved case response
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
		create,
		update,
		destroy,
		save,
	};
};

export default PBLCaseService;
