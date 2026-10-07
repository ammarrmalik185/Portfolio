import { useEffect, useState } from "react";
import { firestore } from "../../services/firebaseService";
import ExperienceCard from "../../components/experienceComponents/experienceCard";
import CollectionLoading from "../../components/basicComponents/CollectionLoading";
import styles from "../../styles/Home.module.css";

export default function Experiences() {
    const [experiences, setExperiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        firestore.collection("experiences").orderBy("date", "desc").get().then(snapshot => {
            if (isMounted) {
                setExperiences(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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
                    <p className={styles.portfolioEyebrow}>Career journey</p>
                    <h1>Experience</h1>
                    <p>Roles, responsibilities, and the work that shaped how I build.</p>
                </section>
                {isLoading && <CollectionLoading label="experience" variant="timeline" />}
                {!isLoading && <section className={styles.experienceList}>
                    {experiences.map(experience => <ExperienceCard key={experience.id} experience={experience} />)}
                    {experiences.length === 0 && <p className={styles.emptyCollection}>No experience entries have been published yet.</p>}
                </section>}
            </main>
        </div>
    );
}
