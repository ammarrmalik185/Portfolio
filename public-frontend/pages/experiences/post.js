import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../services/firebaseService";
import styles from "../../styles/Home.module.css";
import staticData from "../../staticData.json";
import EntryManagementActions from "../../components/basicComponents/EntryManagementActions";
import { getExperienceDetails } from "../../services/experienceDetails";

const CustomHtmlViewer = dynamic(
    () => import("../../components/customHtmlTemplate/customHtmlViewer"),
    { ssr: false }
);

export default function ExperiencePost() {
    const router = useRouter();
    const [experience, setExperience] = useState(null);
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (!router.query.id) return;
        let isMounted = true;

        firestore.collection("experiences").doc(router.query.id).get().then(snapshot => {
            if (!snapshot.exists) {
                router.replace("/experiences");
            } else if (isMounted) {
                setExperience({ ...snapshot.data(), id: snapshot.id });
            }
        });

        return () => {
            isMounted = false;
        };
    }, [router, router.query.id]);

    if (!experience) return null;

    const metadata = experience.experience || {};
    const details = getExperienceDetails(metadata);
    const skills = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof experience.tags === "string" ? experience.tags.split(/[,\s]+/).filter(Boolean) : [];
    const canManage = user && (user.uid === experience.user || staticData.adminData.adminIds.includes(user.uid));

    return (
        <div className={styles.portfolioPage}>
            <main className={styles.portfolioShell}>
                <article className={styles.experiencePost}>
                    <p className={styles.portfolioEyebrow}>{details.typeLabel}</p>
                    <h1>{experience.title}</h1>
                    {details.organization && <p className={styles.experienceCompany}>{details.organization}{details.subtitle && ` · ${details.subtitle}`}</p>}
                    {(metadata.startDate || metadata.endDate) && <p className={styles.experienceMeta}>{metadata.startDate} - {metadata.endDate || "Present"}{metadata.location && ` · ${metadata.location}`}</p>}
                    {metadata.summary && <p className={styles.projectSummary}>{metadata.summary}</p>}
                    {skills.length > 0 && <div className={styles.showcaseTags}>{skills.map(skill => <span key={skill}>{skill}</span>)}</div>}
                    {canManage && <EntryManagementActions
                        editHref={{ pathname: "/experiences/edit", query: { id: experience.id } }}
                        editLabel="Edit experience"
                        deleteLabel="experience"
                        onDelete={() => firestore.collection("experiences").doc(experience.id).delete().then(() => router.replace("/experiences"))}
                    />}
                    {metadata.showDetails !== false && <div className={styles.portfolioDetailsContent}>
                        <CustomHtmlViewer contentBlocks={experience.content?.blocks || []} />
                    </div>}
                </article>
            </main>
        </div>
    );
}
