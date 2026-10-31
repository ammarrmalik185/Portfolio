const PROJECT_PLATFORMS = ["Android", "Web", "iOS", "Windows", "macOS", "Linux"];

function normalisePlatforms(value) {
    if (!Array.isArray(value)) return [];
    const selected = new Set(value.filter(platform => typeof platform === "string")
        .map(platform => platform.trim().toLowerCase()));
    return PROJECT_PLATFORMS.filter(platform => selected.has(platform.toLowerCase()));
}

module.exports = { PROJECT_PLATFORMS, normalisePlatforms };
