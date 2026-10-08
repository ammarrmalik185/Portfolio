import { firestore } from "../../services/firebaseService";
import ModernBlogCard from '../../components/blogComponents/ModernBlogCard';
import CollectionLoading from '../../components/basicComponents/CollectionLoading';
import Pagination from "../../components/basicComponents/Pagination";
import { paginateItems } from "../../services/pagination";
import styles from '../../styles/Home.module.css';
import { useEffect, useRef, useState } from "react";
export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const collectionRef = useRef(null);
  const pagination = paginateItems(blogs, page);
  const changePage = nextPage => {
    setPage(nextPage);
    collectionRef.current?.scrollIntoView({ block: "start" });
  };
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
           {!isLoading && <section ref={collectionRef} className={styles.blogGrid}>
              {pagination.items.map(blog => <ModernBlogCard key={blog.id} blog={blog} />)}
              {blogs.length === 0 && <p className={styles.emptyCollection}>No articles have been published yet.</p>}
           </section>}
           {!isLoading && <Pagination pagination={pagination} label="articles" onPageChange={changePage} />}
      </main>
    </div>
  )
}
