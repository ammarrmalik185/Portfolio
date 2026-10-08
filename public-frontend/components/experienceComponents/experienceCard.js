import Link from "next/link";
import styles from "../../styles/Home.module.css";
import { FaArrowRight } from "react-icons/fa";
import { getExperienceDetails } from "../../services/experienceDetails";

export default function ExperienceCard({ experience }) {
    const metadata = experience.experience || {};
    const details = getExperienceDetails(metadata);
    const tags = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof experience.tags === "string"
            ? experience.tags.split(/[,\s]+/).filter(Boolean)
            : [];

    return (
        <article className={styles.experienceCard}>
            <p className={styles.showcaseType}>{details.typeLabel}</p>
            <h2>{experience.title || (details.isEducation ? "Untitled qualification" : "Untitled role")}</h2>
            {details.organization && <p className={styles.experienceCompany}>{details.organization}{details.subtitle && ` · ${details.subtitle}`}</p>}
            {(metadata.startDate || metadata.endDate) && <p className={styles.experienceDates}>{metadata.startDate} - {metadata.endDate || "Present"}</p>}
            {metadata.summary && <p className={styles.showcaseSummary}>{metadata.summary}</p>}
            {tags.length > 0 && <div className={styles.showcaseTags}>
                {tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>}
            <Link href={{ pathname: "/experiences/post", query: { id: experience.id } }}>
                <a className={styles.showcaseLink}>Read experience <FaArrowRight aria-hidden="true" /></a>
            </Link>
        </article>
    );
}
