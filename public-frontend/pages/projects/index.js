import { firestore } from "../../services/firebaseService";
import ShowcaseCard from '../../components/portfolioComponents/showcaseCard'
import CollectionLoading from '../../components/basicComponents/CollectionLoading';
import styles from '../../styles/Home.module.css'
import { useEffect, useState } from "react";
import staticData from "../../staticData.json";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    firestore.collection("projects").orderBy("date", "desc").get().then(snapshot => {
      if (isMounted) setProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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
          <p className={styles.portfolioEyebrow}>Selected work</p>
          <h1>Projects</h1>
          <p>Products, experiments, and client work built with care.</p>
        </section>
        {isLoading && <CollectionLoading label="projects" />}
        {!isLoading && <section className={styles.showcaseGrid}>
          {projects.map(project => <ShowcaseCard key={project.id} item={project} type="Project" href="/projects/post" fallbackImage={staticData.defaults.projectPicture} />)}
          {projects.length === 0 && <p className={styles.emptyCollection}>No projects have been published yet.</p>}
        </section>}
      </main>
    </div>
  )
}
