import assert from "node:assert/strict";
import test from "node:test";
import { paginateItems, getPageNumbers } from "./pagination.js";
import { searchProjects } from "./projectTags.js";
import { sortExperiences } from "./collectionOrdering.js";

test("pages retain order with no duplicate or skipped entries and a partial final page", () => {
    const items = Array.from({ length: 14 }, (_, index) => ({ id: index }));
    const pages = [1, 2, 3].map(page => paginateItems(items, page));
    assert.deepEqual(pages.flatMap(page => page.items), items);
    assert.deepEqual(pages.map(page => [page.start, page.end, page.total]), [[1, 6, 14], [7, 12, 14], [13, 14, 14]]);
    assert.equal(pages[2].pageCount, 3);
    assert.equal(items.length, 14);
});

test("empty lists and out-of-range pages never produce invalid ranges", () => {
    const empty = paginateItems([], 5);
    assert.deepEqual(empty.items, []);
    assert.equal(empty.page, 1);
    assert.equal(empty.pageCount, 0);
    assert.equal(empty.start, 0);
    assert.equal(empty.end, 0);
    assert.equal(paginateItems([1, 2], 100).page, 1);
    assert.equal(paginateItems([1, 2], -1).page, 1);
});

test("project search runs before pagination, and narrowing results clamps the page", () => {
    const projects = Array.from({ length: 20 }, (_, index) => ({ id: index, title: `Project ${index}`, project: { skills: index % 2 ? ["React"] : ["CSS"] } }));
    const matching = searchProjects(projects, "project", ["react"]);
    assert.deepEqual(paginateItems(matching, 1).items.map(project => project.id), [1, 3, 5, 7, 9, 11]);
    assert.deepEqual(paginateItems(matching, 2).items.map(project => project.id), [13, 15, 17, 19]);
    const narrowed = paginateItems(searchProjects(projects, "Project 19", ["react"]), 2);
    assert.equal(narrowed.page, 1);
    assert.equal(narrowed.total, 1);
    assert.equal(narrowed.items[0].id, 19);
});

test("experience paging retains latest-start-date-first ordering across pages", () => {
    const experiences = Array.from({ length: 8 }, (_, index) => ({ id: index, date: 8 - index, experience: { startDate: `${2018 + index}-01` } }));
    const ordered = sortExperiences(experiences);
    assert.deepEqual(paginateItems(ordered, 1).items.map(item => item.id), [7, 6, 5, 4, 3, 2]);
    assert.deepEqual(paginateItems(ordered, 2).items.map(item => item.id), [1, 0]);
});

test("page controls stay compact while exposing first, current, and last pages", () => {
    assert.deepEqual(getPageNumbers(1, 3), [1, 2, 3]);
    assert.deepEqual(getPageNumbers(1, 20), [1, 2, 3, 4, "ellipsis", 20]);
    assert.deepEqual(getPageNumbers(10, 20), [1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
    assert.deepEqual(getPageNumbers(20, 20), [1, "ellipsis", 17, 18, 19, 20]);
});
