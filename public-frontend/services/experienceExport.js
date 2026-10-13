function cleanText(value) {
    if (value === undefined || value === null) return "";

    const text = String(value);
    if (typeof window === "undefined") {
        return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    const element = document.createElement("textarea");
    element.innerHTML = text.replace(/<[^>]*>/g, " ");
    return element.value.replace(/\s+/g, " ").trim();
}

function listText(items) {
    if (!Array.isArray(items)) return "";

    return items.map(item => {
        if (typeof item === "string") return cleanText(item);
        if (item && typeof item === "object") return cleanText(item.content || item.text);
        return "";
    }).filter(Boolean).join("; ");
}

function blockText(block) {
    const data = block?.data || {};

    switch (block?.type) {
        case "header":
            return cleanText(data.text);
        case "paragraph":
            return cleanText(data.text);
        case "list":
            return listText(data.items);
        case "quote":
            return [cleanText(data.text), cleanText(data.caption)].filter(Boolean).join(" — ");
        case "code":
            return cleanText(data.code);
        case "table":
            return (data.content || []).map(row => {
                const cells = Array.isArray(row) ? row : row?.row;
                return Array.isArray(cells) ? cells.map(cleanText).filter(Boolean).join(" | ") : "";
            }).filter(Boolean).join("\n");
        case "image":
            return [cleanText(data.caption), cleanText(data.file?.url || data.url)].filter(Boolean).join(" — ");
        case "raw":
            return cleanText(data.html);
        default:
            return cleanText(data.text || data.content);
    }
}

function experienceText(experience) {
    const metadata = experience.experience || {};
    const skills = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof experience.tags === "string" ? experience.tags.split(",") : [];
    const details = (experience.content?.blocks || []).map(blockText).filter(Boolean);
    const period = [metadata.startDate, metadata.endDate || (metadata.startDate ? "Present" : "")].filter(Boolean).join(" - ");
    const facts = [
        ["Role", experience.title],
        ["Company", metadata.company],
        ["Employment type", metadata.employmentType],
        ["Location", metadata.location],
        ["Dates", period],
        ["Summary", metadata.summary],
        ["Skills", skills.map(cleanText).filter(Boolean).join(", ")]
    ].filter(([, value]) => cleanText(value));

    return [
        `## ${cleanText(experience.title) || "Untitled role"}`,
        ...facts.map(([label, value]) => `${label}: ${cleanText(value)}`),
        details.length ? `Details:\n${details.map(detail => `- ${detail}`).join("\n")}` : ""
    ].filter(Boolean).join("\n");
}

function projectText(project) {
    const metadata = project.project || {};
    const skills = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof project.tags === "string" ? project.tags.split(",") : [];
    const details = (project.content?.blocks || []).map(blockText).filter(Boolean);
    const facts = [
        ["Project", project.title],
        ["Summary", metadata.summary],
        ["Skills", skills.map(cleanText).filter(Boolean).join(", ")],
        ["Live URL", metadata.liveUrl],
        ["Repository URL", metadata.repositoryUrl],
        ["Cover image", metadata.image || project.image]
    ].filter(([, value]) => cleanText(value));

    return [
        `## ${cleanText(project.title) || "Untitled project"}`,
        ...facts.map(([label, value]) => `${label}: ${cleanText(value)}`),
        details.length ? `Details:\n${details.map(detail => `- ${detail}`).join("\n")}` : ""
    ].filter(Boolean).join("\n");
}

export function createAiPortfolioExport(experiences, projects) {
    const entries = experiences.map(experienceText).filter(Boolean);
    const projectEntries = projects.map(projectText).filter(Boolean);

    return [
        "Use the complete experience and project history below together with the job description to write a concise, tailored professional email or application message.",
        "Ground every claim in the portfolio provided. Prioritize the most relevant skills, outcomes, and projects, do not invent qualifications, and leave placeholders only for details not provided.",
        "",
        "JOB DESCRIPTION:",
        "[Paste the job description here]",
        "",
        "COMPLETE WORK EXPERIENCE:",
        entries.join("\n\n") || "No experience entries are available.",
        "",
        "COMPLETE PROJECTS:",
        projectEntries.join("\n\n") || "No projects are available."
    ].join("\n");
}
