import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import styles from "../../styles/Home.module.css";
import FallbackImage from "../basicComponents/FallbackImage";

export default function ModernBlogCard({ blog }) {
    const metadata = blog.blog || {};
    const tags = Array.isArray(metadata.tags)
        ? metadata.tags.slice(0, 3)
        : typeof blog.tags === "string"
            ? blog.tags.split(/[\s,]+/).filter(Boolean).slice(0, 3)
            : [];

    return (
        <article className={styles.blogCard}>
            <FallbackImage className={styles.blogCardImage} src={metadata.image} legacySrc={blog.image} kind="blog" />
            <div className={styles.blogCardContent}>
                <p className={styles.blogCardMeta}>
                    {metadata.category || "Article"}{metadata.readingTime && <><span aria-hidden="true">·</span>{metadata.readingTime}</>}
                </p>
                <h2>{blog.title || "Untitled article"}</h2>
                {metadata.summary && <p className={styles.blogCardSummary}>{metadata.summary}</p>}
                {tags.length > 0 && <div className={styles.showcaseTags}>
                    {tags.map(tag => <span key={tag}>{tag}</span>)}
                </div>}
                <Link href={{ pathname: "/blogs/post", query: { id: blog.id } }}>
                    <a className={styles.blogCardLink}>Read article <FaArrowRight aria-hidden="true" /></a>
                </Link>
            </div>
        </article>
    );
}
