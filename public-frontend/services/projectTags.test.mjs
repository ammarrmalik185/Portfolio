import assert from "node:assert/strict";
import test from "node:test";
import { getProjectTags, getProjectTagCounts, filterProjectsByTag, searchProjects, getProjectTagSuggestions } from "./projectTags.js";

test("counts projects once per tag, grouping case and whitespace variants", () => {
    const projects = [
        { project: { skills: ["React", " react ", "Node.js", "", null] } },
        { project: { skills: ["REACT", "Firebase"] } },
        { tags: "React, UI Design" },
        {}
    ];
    assert.deepEqual(getProjectTagCounts(projects), [
        { key: "react", label: "React", count: 3 },
        { key: "firebase", label: "Firebase", count: 1 },
        { key: "node.js", label: "Node.js", count: 1 },
        { key: "ui design", label: "UI Design", count: 1 }
    ]);
});

test("filtering uses exact tags, preserves saved order, and All includes untagged projects", () => {
    const projects = [
        { id: "first", project: { skills: [" React "] } },
        { id: "different", project: { skills: ["React Native"] } },
        { id: "last", tags: "REACT, Firebase" },
        { id: "untagged" }
    ];
    assert.deepEqual(filterProjectsByTag(projects, "react").map(project => project.id), ["first", "last"]);
    assert.deepEqual(filterProjectsByTag(projects, "missing"), []);
    assert.deepEqual(filterProjectsByTag(projects, null), projects);
    assert.deepEqual(projects.map(project => project.id), ["first", "different", "last", "untagged"]);
});

test("uses all skills for filtering, including tags beyond the four shown on cards", () => {
    const project = { project: { skills: ["React", "Node.js", "Firebase", "CSS", "UI Design"] } };
    assert.equal(getProjectTagCounts([project]).length, 5);
    assert.deepEqual(filterProjectsByTag([project], "ui design"), [project]);
});

test("supports legacy tag strings and arrays while preferring structured skills", () => {
    assert.deepEqual(getProjectTags({ tags: "React Firebase" }), ["React", "Firebase"]);
    assert.deepEqual(getProjectTags({ tags: "React, UI Design, React" }), ["React", "UI Design"]);
    assert.deepEqual(getProjectTags({ tags: ["React", " React "] }), ["React"]);
    assert.deepEqual(getProjectTags({ project: { skills: ["CSS"] }, tags: "React" }), ["CSS"]);
    assert.deepEqual(getProjectTags({}), []);
});

test("search matches names, descriptions, and tags without changing project order", () => {
    const projects = [
        { id: "first", title: "Client portal", project: { summary: "Manage invoices", skills: ["React", "Firebase"] } },
        { id: "second", title: "Mobile app", project: { summary: "Client chat", skills: ["React Native"] } },
        { id: "third", title: "Invoice dashboard", project: { summary: "Client billing", skills: ["React", "Firebase"] } },
        { id: "untagged", title: "Client notes" }
    ];
    assert.deepEqual(searchProjects(projects, "  CLIENT   FIREBASE ").map(project => project.id), ["first", "third"]);
    assert.deepEqual(searchProjects(projects, "invoices").map(project => project.id), ["first"]);
    assert.deepEqual(searchProjects(projects, "client", ["react", "FIREBASE"]).map(project => project.id), ["first", "third"]);
    assert.deepEqual(searchProjects(projects, "client", ["React"]).map(project => project.id), ["first", "third"]);
    assert.deepEqual(searchProjects(projects, "notes"), [projects[3]]);
    assert.deepEqual(searchProjects(projects, "missing"), []);
    assert.deepEqual(searchProjects(projects), projects);
});

test("suggestions match typed tags, rank prefixes first, and exclude selected tags", () => {
    const projects = [
        { project: { skills: ["React", "React Native", "Preact"] } },
        { project: { skills: ["Preact"] } },
        { project: { skills: ["Preact"] } }
    ];
    assert.deepEqual(getProjectTagSuggestions(projects, " REA ").map(tag => tag.key), ["react", "react native", "preact"]);
    assert.deepEqual(getProjectTagSuggestions(projects, "rea", ["REACT"]).map(tag => tag.key), ["react native", "preact"]);
    assert.equal(getProjectTagSuggestions(projects, "missing").length, 0);
});

test("suggestions stay compact even when projects have many tags", () => {
    const projects = [{ project: { skills: Array.from({ length: 30 }, (_, index) => `Tag ${index}`) } }];
    assert.equal(getProjectTagSuggestions(projects).length, 6);
    assert.equal(getProjectTagSuggestions(projects, "", [], 3).length, 3);
});
