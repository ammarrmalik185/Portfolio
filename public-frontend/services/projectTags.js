function getProjectTags(project) {
    const skills = project.project?.skills;
    const rawTags = Array.isArray(skills)
        ? skills
        : Array.isArray(project.tags)
            ? project.tags
            : typeof project.tags === "string"
                ? project.tags.split(project.tags.includes(",") ? "," : /\s+/)
                : [];
    const uniqueTags = new Map();
    rawTags.forEach(tag => {
        if (typeof tag !== "string") return;
        const label = tag.trim();
        const key = label.toLowerCase();
        if (label && !uniqueTags.has(key)) uniqueTags.set(key, label);
    });
    return [...uniqueTags.values()];
}

function getProjectTagCounts(projects) {
    const tags = new Map();
    projects.forEach(project => {
        getProjectTags(project).forEach(label => {
            const key = label.toLowerCase();
            const tag = tags.get(key) || { key, label, count: 0 };
            tag.count += 1;
            tags.set(key, tag);
        });
    });
    return [...tags.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function filterProjectsByTag(projects, tag) {
    return searchProjects(projects, "", tag ? [tag] : []);
}

function searchProjects(projects, query = "", selectedTags = []) {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const tagKeys = selectedTags.map(tag => tag.trim().toLowerCase());
    return projects.filter(project => {
        const tags = getProjectTags(project);
        const keys = new Set(tags.map(tag => tag.toLowerCase()));
        const text = [project.title, project.project?.summary, ...tags]
            .filter(value => typeof value === "string")
            .join(" ")
            .toLowerCase();
        return terms.every(term => text.includes(term)) && tagKeys.every(key => keys.has(key));
    });
}

function getProjectTagSuggestions(projects, query = "", selectedTags = [], limit = 6) {
    const text = query.trim().toLowerCase();
    const selected = new Set(selectedTags.map(tag => tag.trim().toLowerCase()));
    return getProjectTagCounts(projects)
        .filter(tag => !selected.has(tag.key) && tag.key.includes(text))
        .sort((a, b) => Number(b.key.startsWith(text)) - Number(a.key.startsWith(text)) || b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, limit);
}

module.exports = { getProjectTags, getProjectTagCounts, filterProjectsByTag, searchProjects, getProjectTagSuggestions };
