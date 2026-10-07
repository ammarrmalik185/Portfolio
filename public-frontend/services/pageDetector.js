const staticData = require("../staticData.json")
const pagesData = staticData.pathingData.pageEnum;
export function detectPage(pathname) {

    if (pathname.split("?")[0].endsWith("/blogs")) return pagesData.blogs;
    if (pathname.split("?")[0].endsWith("/blogs/edit")) return pagesData.blogEdit;
    if (pathname.split("?")[0].endsWith("/blogs/post")) return pagesData.blogSingle;

    if (pathname.split("?")[0].endsWith("/projects")) return pagesData.projects;
    if (pathname.split("?")[0].endsWith("/projects/edit")) return pagesData.projectEdit;
    if (pathname.split("?")[0].endsWith("/projects/post")) return pagesData.projectSingle;

    if (pathname.split("?")[0].endsWith("/experiences")) return pagesData.experiences;
    if (pathname.split("?")[0].endsWith("/experiences/edit")) return pagesData.experienceEdit;
    if (pathname.split("?")[0].endsWith("/experiences/post")) return pagesData.experienceSingle;

    if (pathname.split("?")[0].endsWith("/login")) return pagesData.login;
    if (pathname.split("?")[0].endsWith("/signup")) return pagesData.signup;

    if (pathname.split("?")[0].endsWith("/")) return pagesData.home;
    if (pathname.split("?")[0].endsWith("/edit")) return pagesData.homeEdit;

    return pagesData.notFound;
}
