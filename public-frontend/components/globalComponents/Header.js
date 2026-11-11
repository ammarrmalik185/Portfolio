import basePath from "../../services/basePath";
import styles from "../../styles/Home.module.css";
import { auth } from "../../services/firebaseService";
import { useRouter } from "next/router";
import { detectPage } from "../../services/pageDetector";
import { useAuthState } from 'react-firebase-hooks/auth';
const staticData = require("../../staticData.json");

const primaryLinks = [
    { label: "Home", href: "/", page: "home" },
    { label: "Projects", href: "/projects", page: "projects" },
    { label: "Experience", href: "/experiences", page: "experiences" },
    { label: "Writing", href: "/blogs", page: "blogs" }
];

export default function Header() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const currentPage = detectPage(router.pathname);
    const isLogged = Boolean(user) && !loading;
    const isAdmin = isLogged && staticData.adminData.adminIds.includes(user.uid);
    const linkClassName = page => {
        const relatedPages = {
            projects: ["projects", "projectEdit", "projectSingle"],
            experiences: ["experiences", "experienceEdit", "experienceSingle"],
            blogs: ["blogs", "blogEdit", "blogSingle"]
        };
        const pageIds = relatedPages[page] || [page];
        const isActive = pageIds.some(pageId => currentPage === staticData.pathingData.pageEnum[pageId]);
        return `${styles.navigationLink} ${isActive ? styles.navigationLinkActive : ""}`;
    };

    return (
        <nav className={styles.floatingNavigation} aria-label="Primary navigation">
            <div className={styles.navigationLinks}>
                {primaryLinks.map(link => (
                    <a key={link.href} href={`${basePath}${link.href}`} className={linkClassName(link.page)}>
                        {link.label}
                    </a>
                ))}
            </div>
            <div className={styles.navigationAccount}>
                {(isAdmin || isLogged) && <details className={styles.navigationMenu}>
                    <summary>Manage</summary>
                    <div className={styles.navigationMenuPanel}>
                        {isAdmin && <a href={`${basePath}/edit`}>Edit portfolio</a>}
                        {isLogged && <>
                            <a href={`${basePath}/projects/edit`}>New project</a>
                            <a href={`${basePath}/experiences/edit`}>New experience</a>
                            <a href={`${basePath}/blogs/edit`}>New post</a>
                        </>}
                    </div>
                </details>}
                {isLogged
                    ? <button type="button" className={styles.navigationAccountButton} onClick={() => auth.signOut()}>Sign out</button>
                    : <a className={styles.navigationAccountButton} href={`${basePath}/login`}>Sign in</a>}
            </div>
        </nav>
    );
}
