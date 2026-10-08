const PAGE_SIZE = 6;

function paginateItems(items, requestedPage = 1, pageSize = PAGE_SIZE) {
    const pageCount = Math.ceil(items.length / pageSize);
    const page = Math.min(Math.max(1, requestedPage), Math.max(1, pageCount));
    const startIndex = (page - 1) * pageSize;
    return {
        items: items.slice(startIndex, startIndex + pageSize),
        page,
        pageCount,
        total: items.length,
        startIndex,
        start: items.length ? startIndex + 1 : 0,
        end: Math.min(startIndex + pageSize, items.length)
    };
}

function getPageNumbers(page, pageCount) {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
    const candidates = new Set([1, pageCount, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach(value => candidates.add(value));
    if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach(value => candidates.add(value));
    const pages = [...candidates].filter(value => value >= 1 && value <= pageCount).sort((a, b) => a - b);
    const result = [];
    pages.forEach((value, index) => {
        const previous = pages[index - 1];
        if (value - previous === 2) result.push(previous + 1);
        else if (value - previous > 2) result.push("ellipsis");
        result.push(value);
    });
    return result;
}

module.exports = { PAGE_SIZE, paginateItems, getPageNumbers };
