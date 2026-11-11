import assert from "node:assert/strict";
import test from "node:test";
import { normalisePlatforms } from "./projectPlatforms.js";

test("custom platforms survive a project JSON round trip alongside canonical presets", () => {
    const project = { platforms: normalisePlatforms(["Meta Quest", " web ", "PlayStation 5", "ANDROID"]) };
    const imported = JSON.parse(JSON.stringify(project));
    assert.deepEqual(normalisePlatforms(imported.platforms), ["Android", "Web", "Meta Quest", "PlayStation 5"]);
});

test("platforms ignore invalid entries and deduplicate names without losing custom spelling", () => {
    assert.deepEqual(normalisePlatforms([null, 12, {}, "", "  ", " Xbox ", "xbox", "IOS", "ios", "Steam Deck"]),
        ["iOS", "Xbox", "Steam Deck"]);
    assert.deepEqual(normalisePlatforms(undefined), []);
    assert.deepEqual(normalisePlatforms("Web"), []);
});
