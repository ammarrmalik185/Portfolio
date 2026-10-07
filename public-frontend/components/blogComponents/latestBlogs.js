import styles from "../../styles/Home.module.css";
import ModernBlogCard from "./ModernBlogCard";
import {useEffect, useState} from "react";
import {firestore} from "../../services/firebaseService";


export function LatestBlogs({ excludeId }){
    const [blogs, setBlogs] = useState([]);
    useEffect(() => {
        let isMounted = true;
        firestore.collection("blogs").orderBy("date", "desc").limit(4).get().then(snapshot => {
            if (isMounted) {
                setBlogs(snapshot.docs
                    .map(doc => ({ ...doc.data(), id: doc.id }))
                    .filter(blog => blog.id !== excludeId)
                    .slice(0, 3));
            }
        });

        return () => {
            isMounted = false;
        };
    }, [excludeId]);

    if (blogs.length === 0) return null;

    return(<section className={styles.relatedArticles}>
        <div className={styles.relatedArticlesHeading}>
            <p className={styles.portfolioEyebrow}>Keep reading</p>
            <h2>More articles</h2>
        </div>
        <div className={styles.blogGrid}>
            {blogs.map(blog => <ModernBlogCard key={blog.id} blog={blog} />)}
        </div>
    </section>);
}
