import assert from "node:assert/strict";
import test from "node:test";
import { sortProjects, sortExperiences } from "./collectionOrdering.js";

const ids = entries => entries.map(entry => entry.id);

test("saved project order overrides publication date and retains unranked entries", () => {
    const projects = [
        { id: "new", date: 900 },
        { id: "second", order: 1, date: 800 },
        { id: "first", order: 0, date: 100 },
        { id: "old", date: 200 },
        { id: "legacy" }
    ];
    assert.deepEqual(ids(sortProjects(projects)), ["first", "second", "new", "old", "legacy"]);
    assert.equal(projects[0].id, "new", "sorting must not mutate the displayed draft");
});

test("legacy projects use newest publication date and deterministic ties", () => {
    assert.deepEqual(ids(sortProjects([
        { id: "z", date: 100 },
        { id: "a", date: 100 },
        { id: "recent", date: { toMillis: () => 200 } }
    ])), ["recent", "a", "z"]);
});

test("sort projects before limiting so an older featured project reaches the homepage", () => {
    const projects = Array.from({ length: 8 }, (_, index) => ({ id: String(index), date: index }));
    projects[0].order = 0;
    assert.deepEqual(ids(sortProjects(projects).slice(0, 6)), ["0", "7", "6", "5", "4", "3"]);
});

test("experience uses newest start date rather than publication or end date", () => {
    const experiences = [
        { id: "old-role", date: 900, experience: { startDate: "2020-12", endDate: "2026-10" } },
        { id: "recent-role", date: 100, experience: { startDate: "2025-01", endDate: "2025-06" } },
        { id: "middle-role", date: 200, experience: { startDate: "2023-03" } }
    ];
    assert.deepEqual(ids(sortExperiences(experiences)), ["recent-role", "middle-role", "old-role"]);
    assert.equal(experiences[0].id, "old-role");
});

test("experience keeps missing and invalid start dates last, with publication date as a tie breaker", () => {
    assert.deepEqual(ids(sortExperiences([
        { id: "missing", date: 400 },
        { id: "invalid", date: 300, experience: { startDate: "invalid" } },
        { id: "same-start-old", date: 100, experience: { startDate: "2025-01" } },
        { id: "same-start-new", date: 200, experience: { startDate: "2025-01" } },
        { id: "historic", experience: { startDate: "1960-01" } }
    ])), ["same-start-new", "same-start-old", "historic", "missing", "invalid"]);
});

test("work, university, and college share a timeline ordered by latest start date", () => {
    const experiences = [
        { id: "college", date: 900, experience: { type: "college", startDate: "2015-08", endDate: "2017-06" } },
        { id: "work", date: 100, experience: { startDate: "2023-01" } },
        { id: "university", date: 800, experience: { type: "university", startDate: "2017-09", endDate: "2021-06" } },
        { id: "recent-university", date: 200, experience: { type: "university", startDate: "2025-09" } }
    ];
    assert.deepEqual(ids(sortExperiences(experiences)), ["recent-university", "work", "university", "college"]);
    assert.deepEqual(ids(sortExperiences(experiences).slice(0, 2)), ["recent-university", "work"]);
});
