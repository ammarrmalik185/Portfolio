import Link from "next/link";
import styles from "../../styles/Home.module.css";
import { FaArrowRight } from "react-icons/fa";

export default function ShowcaseCard({ item, type, href, fallbackImage }) {
    const metadata = item.project || {};
    const tags = Array.isArray(metadata.skills)
        ? metadata.skills.slice(0, 4)
        : typeof item.tags === "string"
            ? item.tags.split(/[,\s]+/).filter(Boolean).slice(0, 4)
            : [];

    return (
        <article className={styles.showcaseCard}>
            {fallbackImage && <>
                {/* Project images are author-managed external URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.showcaseImage} src={metadata.image || item.image || fallbackImage} alt="" />
            </>}
            <div className={styles.showcaseCardContent}>
                <p className={styles.showcaseType}>{type}</p>
                <h3>{item.title || "Untitled"}</h3>
                {metadata.summary && <p className={styles.showcaseSummary}>{metadata.summary}</p>}
                {tags.length > 0 && <div className={styles.showcaseTags}>
                    {tags.map(tag => <span key={tag}>{tag}</span>)}
                </div>}
                <Link href={{ pathname: href, query: { id: item.id } }}>
                    <a className={styles.showcaseLink}>View details <FaArrowRight aria-hidden="true" /></a>
                </Link>
            </div>
        </article>
    );
}
