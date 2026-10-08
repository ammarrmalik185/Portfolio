function dateValue(value, fallback = 0) {
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
    if (value && typeof value.toMillis === "function") return value.toMillis();
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function newestFirst(a, b) {
    return dateValue(b.date) - dateValue(a.date) || String(a.id).localeCompare(String(b.id));
}

function sortProjects(projects) {
    return [...projects].sort((a, b) => {
        const aOrder = Number.isFinite(a.order) ? a.order : Infinity;
        const bOrder = Number.isFinite(b.order) ? b.order : Infinity;
        return (aOrder === bOrder ? 0 : aOrder - bOrder) || newestFirst(a, b);
    });
}

function sortExperiences(experiences) {
    return [...experiences].sort((a, b) => {
        return dateValue(b.experience?.startDate, -Infinity) - dateValue(a.experience?.startDate, -Infinity) || newestFirst(a, b);
    });
}

module.exports = { sortProjects, sortExperiences };
