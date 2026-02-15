const getPagination = (query) => {
    const page = Math.abs(parseInt(query.page, 10)) || 1;
    const limit = Math.abs(parseInt(query.limit, 10)) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const getPagingData = (data, page, limit) => {
    const { count: total, rows: items } = data;
    const totalPages = Math.ceil(total / limit);

    return {
        total,
        items,
        totalPages,
        currentPage: page,
        limit,
    };
};

module.exports = {
    getPagination,
    getPagingData,
};
