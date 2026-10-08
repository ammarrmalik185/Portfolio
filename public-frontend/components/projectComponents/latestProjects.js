import styles from "../../styles/Home.module.css";
import ProjectCard from "./projectCard";
import {useEffect, useState} from "react";
import {firestore} from "../../services/firebaseService";
import {sortProjects} from "../../services/collectionOrdering";


export function LatestProjects(){
    const [projects, setProjects] = useState([]);
    const [isInit, setIsInit] = useState(false);
    useEffect(() => {
        if(!isInit) {
            firestore.collection("projects").get().then((querySnapshot) => {
                let newProjects = [];
                querySnapshot.forEach((doc) => {
                    newProjects.push({...doc.data(), id: doc.id})
                });
                setProjects(sortProjects(newProjects).slice(0, 3))
            });
            setIsInit(true);
        }
    }, [])
    return(<div>
        {projects && <div>
            <div>
                <p className={styles.title}>
                    Latest Projects
                </p>
            </div>
            <div className={styles.projectsContainer}>
                {projects.map(portfolio => <ProjectCard key={portfolio.id} title={portfolio.title} author={portfolio.user} image={portfolio.image} id={portfolio.id}/>)}
            </div>
        </div>}
    </div>);
}
