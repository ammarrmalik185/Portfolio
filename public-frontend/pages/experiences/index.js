import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../services/firebaseService";
import { sortExperiences, sortProjects } from "../../services/collectionOrdering";
import ExperienceCard from "../../components/experienceComponents/experienceCard";
import ExperienceAiExport from "../../components/experienceComponents/ExperienceAiExport";
import CollectionLoading from "../../components/basicComponents/CollectionLoading";
import Pagination from "../../components/basicComponents/Pagination";
import { paginateItems } from "../../services/pagination";
import styles from "../../styles/Home.module.css";

export default function Experiences() {
    const [experiences, setExperiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [areProjectsLoading, setAreProjectsLoading] = useState(true);
    const [user, authLoading] = useAuthState(auth);
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

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setProjects([]);
            setAreProjectsLoading(false);
            return;
        }

        let isMounted = true;
        setAreProjectsLoading(true);

        firestore.collection("projects").get().then(snapshot => {
            if (isMounted) {
                setProjects(sortProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
            }
        }).finally(() => {
            if (isMounted) setAreProjectsLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [authLoading, user]);

    return (
        <div className={styles.portfolioPage}>
            <main className={styles.portfolioShell}>
                <section className={styles.collectionHero}>
                    <p className={styles.portfolioEyebrow}>Work and education</p>
                    <h1>Experience</h1>
                    <p>Work, university, and college experience, with the latest start date first.</p>
                </section>
                {isLoading && <CollectionLoading label="experience" variant="timeline" />}
                {!isLoading && <>
                    {user && !authLoading && !areProjectsLoading && experiences.length > 0 && <ExperienceAiExport experiences={experiences} projects={projects} />}
                    <section ref={collectionRef} className={styles.experienceList}>
                        {pagination.items.map(experience => <ExperienceCard key={experience.id} experience={experience} />)}
                        {experiences.length === 0 && <p className={styles.emptyCollection}>No experience entries have been published yet.</p>}
                    </section>
                    <Pagination pagination={pagination} label="experience entries" onPageChange={changePage} />
                </>}
            </main>
        </div>
    );
}
