import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../services/firebaseService";
import styles from "../../styles/Home.module.css";
import staticData from "../../staticData.json";
import EntryManagementActions from "../../components/basicComponents/EntryManagementActions";

const CustomHtmlViewer = dynamic(
    () => import("../../components/customHtmlTemplate/customHtmlViewer"),
    { ssr: false }
);

export default function ProjectPost() {
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (!router.query.id) return;
        let isMounted = true;

        firestore.collection("projects").doc(router.query.id).get().then(snapshot => {
            if (!snapshot.exists) {
                router.replace("/projects");
            } else if (isMounted) {
                setProject({ ...snapshot.data(), id: snapshot.id });
            }
        });

        return () => {
            isMounted = false;
        };
    }, [router, router.query.id]);

    if (!project) return null;

    const metadata = project.project || {};
    const skills = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof project.tags === "string" ? project.tags.split(/[,\s]+/).filter(Boolean) : [];
    const image = metadata.image || project.image || staticData.defaults.projectPicture;
    const canManage = user && (user.uid === project.user || staticData.adminData.adminIds.includes(user.uid));

    return (
        <div className={styles.portfolioPage}>
            <main className={styles.portfolioShell}>
                <article className={styles.projectPost}>
                    <div className={styles.projectPostCopy}>
                        <p className={styles.portfolioEyebrow}>Project</p>
                        <h1>{project.title}</h1>
                        {metadata.summary && <p className={styles.projectSummary}>{metadata.summary}</p>}
                        {skills.length > 0 && <div className={styles.showcaseTags}>
                            {skills.map(skill => <span key={skill}>{skill}</span>)}
                        </div>}
                        <div className={styles.projectLinks}>
                            {metadata.liveUrl && <a className={styles.portfolioPrimaryAction} href={metadata.liveUrl} target="_blank" rel="noreferrer">Visit project <FaExternalLinkAlt aria-hidden="true" /></a>}
                            {metadata.repositoryUrl && <a className={styles.portfolioSecondaryAction} href={metadata.repositoryUrl} target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" /> View repository</a>}
                        </div>
                        {canManage && <EntryManagementActions
                            editHref={{ pathname: "/projects/edit", query: { id: project.id } }}
                            editLabel="Edit project"
                            deleteLabel="project"
                            onDelete={() => firestore.collection("projects").doc(project.id).delete().then(() => router.replace("/projects"))}
                        />}
                    </div>
                    {/* Project images are author-managed external URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.projectPostImage} src={image} alt={`${project.title} preview`} />
                </article>
                {metadata.showDetails !== false && <section className={styles.projectDetails}>
                    <p className={styles.portfolioEyebrow}>Case study</p>
                    <CustomHtmlViewer contentBlocks={project.content?.blocks || []} />
                </section>}
            </main>
        </div>
    );
}
