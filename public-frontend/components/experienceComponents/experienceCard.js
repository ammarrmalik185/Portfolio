import Link from "next/link";
import styles from "../../styles/Home.module.css";
import { FaArrowRight } from "react-icons/fa";

export default function ExperienceCard({ experience }) {
    const metadata = experience.experience || {};
    const tags = Array.isArray(metadata.skills)
        ? metadata.skills
        : typeof experience.tags === "string"
            ? experience.tags.split(/[,\s]+/).filter(Boolean)
            : [];

    return (
        <article className={styles.experienceCard}>
            <p className={styles.showcaseType}>Experience</p>
            <h2>{experience.title || "Untitled role"}</h2>
            {metadata.company && <p className={styles.experienceCompany}>{metadata.company}{metadata.employmentType && ` · ${metadata.employmentType}`}</p>}
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
