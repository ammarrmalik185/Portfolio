import Link from "next/link";
import styles from "../../styles/Home.module.css";
import { FaArrowRight } from "react-icons/fa";
import { getProjectTags } from "../../services/projectTags";
import FallbackImage from "../basicComponents/FallbackImage";

export default function ShowcaseCard({ item, type, href, fallbackImage }) {
    const metadata = item.project || {};
    const tags = getProjectTags(item).slice(0, 4);

    return (
        <article className={styles.showcaseCard}>
            <FallbackImage className={styles.showcaseImage} src={metadata.image} legacySrc={item.image} fallbackSrc={fallbackImage} kind="project" />
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
