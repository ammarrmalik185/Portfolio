import { useEffect, useRef, useState } from "react";
import { firestore } from "../../services/firebaseService";
import { sortExperiences } from "../../services/collectionOrdering";
import ExperienceCard from "../../components/experienceComponents/experienceCard";
import CollectionLoading from "../../components/basicComponents/CollectionLoading";
import Pagination from "../../components/basicComponents/Pagination";
import { paginateItems } from "../../services/pagination";
import styles from "../../styles/Home.module.css";

export default function Experiences() {
    const [experiences, setExperiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const collectionRef = useRef(null);
    const pagination = paginateItems(experiences, page);
    const changePage = nextPage => {
        setPage(nextPage);
        collectionRef.current?.scrollIntoView({ block: "start" });
    };

    useEffect(() => {
        let isMounted = true;

        firestore.collection("experiences").get().then(snapshot => {
            if (isMounted) {
                setExperiences(sortExperiences(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
            }
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
                    <p className={styles.portfolioEyebrow}>Work and education</p>
                    <h1>Experience</h1>
                    <p>Work, university, and college experience, with the latest start date first.</p>
                </section>
                {isLoading && <CollectionLoading label="experience" variant="timeline" />}
                {!isLoading && <section ref={collectionRef} className={styles.experienceList}>
                    {pagination.items.map(experience => <ExperienceCard key={experience.id} experience={experience} />)}
                    {experiences.length === 0 && <p className={styles.emptyCollection}>No experience entries have been published yet.</p>}
                </section>}
                {!isLoading && <Pagination pagination={pagination} label="experience entries" onPageChange={changePage} />}
            </main>
        </div>
    );
}
