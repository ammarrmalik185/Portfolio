import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../services/firebaseService";
import CustomHtmlViewer from "../customHtmlTemplate/customHtmlViewer";
import { LatestBlogs } from "./latestBlogs";
import EntryManagementActions from "../basicComponents/EntryManagementActions";
import styles from "../../styles/Home.module.css";
import staticData from "../../staticData.json";
import FallbackImage from "../basicComponents/FallbackImage";

export default function ModernBlogPost() {
    const router = useRouter();
    const [currentUser] = useAuthState(auth);
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const { id } = router.query;
        if (!id) {
            router.replace("/blogs");
            return;
        }

        let isMounted = true;
        firestore.collection("blogs").doc(id).get().then(snapshot => {
            if (!isMounted) return;
            if (!snapshot.exists) {
                setLoadError(true);
                return;
            }
            setArticle({ ...snapshot.data(), id: snapshot.id });
        }).catch(() => {
            if (isMounted) setLoadError(true);
        }).finally(() => {
            if (isMounted) setIsLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [router, router.isReady, router.query]);

    if (isLoading) {
        return <div className={styles.portfolioPage}><main className={styles.blogReadingShell}><p className={styles.emptyCollection}>Loading article...</p></main></div>;
    }

    if (loadError || !article) {
        return <div className={styles.portfolioPage}><main className={styles.blogReadingShell}><p className={styles.emptyCollection}>This article is unavailable.</p></main></div>;
    }

    const metadata = article.blog || {};
    const tags = Array.isArray(metadata.tags)
        ? metadata.tags
        : typeof article.tags === "string"
            ? article.tags.split(/[\s,]+/).filter(Boolean)
            : [];
    const canManage = currentUser && (currentUser.uid === article.user || staticData.adminData.adminIds.includes(currentUser.uid));

    return (
        <div className={styles.portfolioPage}>
            <main className={styles.blogReadingShell}>
                <article className={styles.blogArticle}>
                    <Link href="/blogs"><a className={styles.blogBackLink}>← All articles</a></Link>
                    <header className={styles.blogArticleHeader}>
                        <p className={styles.blogCardMeta}>
                            {metadata.category || "Article"}{metadata.readingTime && <><span aria-hidden="true">·</span>{metadata.readingTime}</>}
                        </p>
                        <h1>{article.title || "Untitled article"}</h1>
                        {metadata.summary && <p className={styles.blogArticleSummary}>{metadata.summary}</p>}
                        {tags.length > 0 && <div className={styles.showcaseTags}>
                            {tags.map(tag => <span key={tag}>{tag}</span>)}
                        </div>}
                        {canManage && <EntryManagementActions
                            editHref={{ pathname: "/blogs/edit", query: { id: article.id } }}
                            editLabel="Edit article"
                            deleteLabel="article"
                            onDelete={() => firestore.collection("blogs").doc(article.id).delete().then(() => router.replace("/blogs"))}
                        />}
                    </header>
                    <FallbackImage className={styles.blogArticleCover} src={metadata.image} legacySrc={article.image} kind="blog" />
                    {metadata.showDetails !== false && <div className={styles.blogArticleBody}>
                        <CustomHtmlViewer contentBlocks={article.content?.blocks || []} />
                    </div>}
                </article>
                <LatestBlogs excludeId={article.id} />
            </main>
        </div>
    );
}
