const PROJECT_PLATFORMS = ["Android", "Web", "iOS", "Windows", "macOS", "Linux"];

function normalisePlatforms(value) {
    if (!Array.isArray(value)) return [];
    const selected = new Map();
    value.forEach(platform => {
        if (typeof platform !== "string" || !platform.trim()) return;
        const label = platform.trim();
        const key = label.toLowerCase();
        if (!selected.has(key)) selected.set(key, label);
    });
    const presets = PROJECT_PLATFORMS.filter(platform => selected.has(platform.toLowerCase()));
    const custom = [...selected.values()].filter(platform =>
        !PROJECT_PLATFORMS.some(preset => preset.toLowerCase() === platform.toLowerCase()));
    return [...presets, ...custom];
}

module.exports = { PROJECT_PLATFORMS, normalisePlatforms };
