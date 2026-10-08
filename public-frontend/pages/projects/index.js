import { auth, firestore } from "../../services/firebaseService";
import { useAuthState } from "react-firebase-hooks/auth";
import { sortProjects } from "../../services/collectionOrdering";
import { searchProjects } from "../../services/projectTags";
import ProjectSearch from "../../components/projectComponents/projectSearch";
import Pagination from "../../components/basicComponents/Pagination";
import { PAGE_SIZE, paginateItems } from "../../services/pagination";
import ShowcaseCard from '../../components/portfolioComponents/showcaseCard'
import CollectionLoading from '../../components/basicComponents/CollectionLoading';
import styles from '../../styles/Home.module.css'
import { useEffect, useRef, useState } from "react";
import staticData from "../../staticData.json";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const isAdmin = !authLoading && user && staticData.adminData.adminIds.includes(user.uid);
  const [draftProjects, setDraftProjects] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderError, setOrderError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const collectionRef = useRef(null);
  const isReordering = Boolean(isAdmin && draftProjects);
  const visibleProjects = isReordering ? draftProjects : searchProjects(projects, searchQuery, selectedTags);
  const pagination = paginateItems(visibleProjects, page);

  const changePage = nextPage => {
    setPage(nextPage);
    collectionRef.current?.scrollIntoView({ block: "start" });
  };

  useEffect(() => {
    let isMounted = true;
    firestore.collection("projects").get().then(snapshot => {
      if (isMounted) setProjects(sortProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const moveProject = (index, direction) => {
    const nextIndex = index + direction;
    if (!draftProjects || isSavingOrder || nextIndex < 0 || nextIndex >= draftProjects.length) return;
    const reordered = [...draftProjects];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setDraftProjects(reordered);
    const nextPage = Math.floor(nextIndex / PAGE_SIZE) + 1;
    if (nextPage !== pagination.page) changePage(nextPage);
    setOrderError("");
  };

  const saveOrder = async () => {
    if (!isAdmin || !draftProjects || isSavingOrder) return;
    setIsSavingOrder(true);
    setOrderError("");
    try {
      const batch = firestore.batch();
      const orderedProjects = draftProjects.map((project, order) => ({ ...project, order }));
      orderedProjects.forEach(project => {
        if (projects.find(saved => saved.id === project.id)?.order !== project.order) {
          batch.update(firestore.collection("projects").doc(project.id), { order: project.order });
        }
      });
      await batch.commit();
      setProjects(orderedProjects);
      setDraftProjects(null);
      setOrderStatus("Project order saved.");
    } catch (error) {
      setOrderError("Unable to save project order. Please try again.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className={styles.portfolioPage}>
      <main className={styles.portfolioShell}>
        <section className={styles.collectionHero}>
          <p className={styles.portfolioEyebrow}>Selected work</p>
          <h1>Projects</h1>
          <p>Products, experiments, and client work built with care.</p>
        </section>
        {!isLoading && projects.length > 0 && <section className={styles.projectFilters} aria-label="Search and filter projects">
          <ProjectSearch projects={projects} query={searchQuery} selectedTags={selectedTags} onQueryChange={query => { setSearchQuery(query); setPage(1); }} onTagsChange={tags => { setSelectedTags(tags); setPage(1); }} disabled={isReordering} />
          <p className={styles.projectFilterSummary} role="status">{visibleProjects.length} of {projects.length} projects match</p>
        </section>}
        {isAdmin && !isLoading && projects.length > 1 && <div className={styles.projectOrderToolbar}>
          {draftProjects ? <>
            <p>Move projects up or down, then save. This order also appears on your homepage.</p>
            <button type="button" onClick={saveOrder} disabled={isSavingOrder}>{isSavingOrder ? "Saving..." : "Save order"}</button>
            <button type="button" disabled={isSavingOrder} onClick={() => { setDraftProjects(null); setOrderError(""); }}>Cancel</button>
          </> : <button type="button" onClick={() => { setSearchQuery(""); setSelectedTags([]); setPage(1); setDraftProjects([...projects]); setOrderStatus(""); }}>Reorder projects</button>}
        </div>}
        {isAdmin && orderStatus && <p role="status">{orderStatus}</p>}
        {isAdmin && orderError && <p className={styles.editorSaveError} role="alert">{orderError}</p>}
        {isLoading && <CollectionLoading label="projects" />}
        {!isLoading && <section ref={collectionRef} className={styles.showcaseGrid}>
          {pagination.items.map((project, index) => {
            const projectIndex = pagination.startIndex + index;
            return <div key={project.id} className={styles.projectOrderItem}>
            <ShowcaseCard item={project} type="Project" href="/projects/post" fallbackImage={staticData.defaults.projectPicture} />
            {isAdmin && draftProjects && <div className={styles.projectOrderControls}>
              <span>{projectIndex + 1} of {visibleProjects.length}</span>
              <button type="button" aria-label={`Move ${project.title || "Untitled project"} up`} disabled={isSavingOrder || projectIndex === 0} onClick={() => moveProject(projectIndex, -1)}>Move up</button>
              <button type="button" aria-label={`Move ${project.title || "Untitled project"} down`} disabled={isSavingOrder || projectIndex === visibleProjects.length - 1} onClick={() => moveProject(projectIndex, 1)}>Move down</button>
            </div>}
          </div>;
          })}
          {projects.length === 0 && <p className={styles.emptyCollection}>No projects have been published yet.</p>}
          {projects.length > 0 && visibleProjects.length === 0 && <p className={styles.emptyCollection}>No projects match your search. Try another term or clear your filters.</p>}
        </section>}
        {!isLoading && <Pagination pagination={pagination} label="projects" onPageChange={changePage} disabled={isSavingOrder} />}
      </main>
    </div>
  )
}
