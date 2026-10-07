import { firestore } from "../../services/firebaseService";
import ModernBlogCard from '../../components/blogComponents/ModernBlogCard';
import CollectionLoading from '../../components/basicComponents/CollectionLoading';
import styles from '../../styles/Home.module.css';
import { useEffect, useState } from "react";
export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
      let isMounted = true;
      firestore.collection("blogs").orderBy("date", "desc").get().then(snapshot => {
          if (isMounted) setBlogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }).finally(() => {
          if (isMounted) setIsLoading(false);
      });

      return () => {
          isMounted = false;
      };
  }, []);
  return (
    <div className={styles.portfolioPage}>
       <main className={styles.portfolioShell}>
           <section className={styles.collectionHero}>
               <p className={styles.portfolioEyebrow}>Notes and ideas</p>
               <h1>Writing</h1>
               <p>Thoughts on building useful products, engineering, and the work behind the work.</p>
           </section>
           {isLoading && <CollectionLoading label="articles" />}
           {!isLoading && <section className={styles.blogGrid}>
              {blogs.map(blog => <ModernBlogCard key={blog.id} blog={blog} />)}
              {blogs.length === 0 && <p className={styles.emptyCollection}>No articles have been published yet.</p>}
           </section>}
      </main>
    </div>
  )
}
