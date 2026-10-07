import styles from '../styles/Home.module.css'
import { useEffect, useState } from "react";
import { firestore } from "../services/firebaseService";
import dynamic from "next/dynamic";
import { FaArrowRight, FaEnvelope, FaGithub, FaLinkedinIn, FaMapMarkerAlt } from "react-icons/fa";
import ShowcaseCard from "../components/portfolioComponents/showcaseCard";
const staticData = require("../staticData.json");

const CustomHtmlViewer = dynamic(
    () => import("../components/customHtmlTemplate/customHtmlViewer"),
    { ssr: false }
);

const portfolioCacheKey = "portfolio:ammarRashidMalik";

function readCachedPortfolio() {
    try {
        const cachedPortfolio = window.localStorage.getItem(portfolioCacheKey);
        return cachedPortfolio ? JSON.parse(cachedPortfolio) : null;
    } catch (error) {
        return null;
    }
}

function cachePortfolio(portfolio) {
    try {
        window.localStorage.setItem(portfolioCacheKey, JSON.stringify(portfolio));
    } catch (error) {
        // Rendering the portfolio does not depend on local storage being available.
    }
}

function getProfile(portfolio) {
    const savedProfile = portfolio.profile || {};

    return {
        name: savedProfile.name || portfolio.title || staticData.websiteData.email.title,
        headline: savedProfile.headline || "Developer and product builder",
        summary: savedProfile.summary || "",
        image: savedProfile.image || staticData.defaults.profilePicture,
        location: savedProfile.location || "",
        availability: savedProfile.availability || "",
        skills: Array.isArray(savedProfile.skills) ? savedProfile.skills : [],
        primaryActionLabel: savedProfile.primaryActionLabel || "Get in touch",
        primaryActionUrl: savedProfile.primaryActionUrl || `mailto:${staticData.websiteData.email.address}`,
        secondaryActionLabel: savedProfile.secondaryActionLabel || "View GitHub",
        secondaryActionUrl: savedProfile.secondaryActionUrl || staticData.websiteData.github.url,
        linkedinUrl: savedProfile.linkedinUrl || "",
        showDetails: savedProfile.showDetails !== false
    };
}

export default function Blogpost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState({});
    const [portfolio, setPortfolio] = useState({});
    const [projects, setProjects] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const cachedPortfolio = readCachedPortfolio();

        if (cachedPortfolio && isMounted) {
            setTitle(cachedPortfolio.title || "");
            setContent(cachedPortfolio.content || {});
            setPortfolio(cachedPortfolio);
            setIsLoading(false);
        }

        firestore.collection("portfolios").doc("ammarRashidMalik").get()
            .then(snapshot => {
                if (!isMounted) return;

                if (snapshot.exists) {
                    const data = snapshot.data();
                    setTitle(data.title || "");
                    setContent(data.content || {});
                    setPortfolio(data);
                    cachePortfolio(data);
                } else {
                    console.log("No such document!");
                    setLoadError(true);
                }
            })
            .catch(() => {
                if (isMounted && !cachedPortfolio) {
                    setLoadError(true);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadCollection = (collection, setItems) => {
            firestore.collection(collection).orderBy("date", "desc").limit(6).get()
                .then(snapshot => {
                    if (isMounted) {
                        setItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                    }
                })
                .catch(() => {
                    // The profile is still useful when a showcase collection is unavailable.
                });
        };

        loadCollection("projects", setProjects);
        loadCollection("experiences", setExperiences);

        return () => {
            isMounted = false;
        };
    }, []);

    const profile = getProfile(portfolio);

    return (
        <div className={styles.portfolioPage}>
            <main className={styles.portfolioShell}>
                {isLoading && !title && <section className={styles.portfolioLoading} role="status" aria-live="polite">
                    <span className={styles.loadingSpinner} aria-hidden="true" />
                    <p>Loading portfolio...</p>
                    <div className={styles.loadingTitle} />
                    <div className={styles.loadingLine} />
                    <div className={styles.loadingLine} />
                </section>}

                {loadError && !title && <section className={styles.portfolioLoading} role="alert">
                    <p>Unable to load the portfolio right now. Please refresh and try again.</p>
                </section>}

                {title && <>
                    <section className={styles.portfolioHero}>
                        <div className={styles.portfolioHeroContent}>
                            <div className={styles.portfolioAvatarFrame}>
                                {/* External image URLs are author-managed in the portfolio profile. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={profile.image} alt={`${profile.name} profile`} className={styles.portfolioAvatar} />
                            </div>
                            <div className={styles.portfolioHeroCopy}>
                                <p className={styles.portfolioEyebrow}>Portfolio</p>
                                <h1 title={profile.name}>{profile.name}</h1>
                                <p className={styles.portfolioHeadline}>{profile.headline}</p>
                                {profile.skills.length > 0 && <div className={styles.portfolioSkills}>
                                    {profile.skills.map(skill => <span key={skill}>{skill}</span>)}
                                </div>}
                                <p className={styles.portfolioSummary}>{profile.summary}</p>
                                <div className={styles.portfolioMeta}>
                                    {profile.location && <span><FaMapMarkerAlt aria-hidden="true" />{profile.location}</span>}
                                    {profile.availability && <span className={styles.portfolioAvailability}>{profile.availability}</span>}
                                </div>
                                <div className={styles.portfolioActions}>
                                    <a className={styles.portfolioPrimaryAction} href={profile.primaryActionUrl}>
                                        {profile.primaryActionLabel}<FaArrowRight aria-hidden="true" />
                                    </a>
                                    <a className={styles.portfolioSecondaryAction} href={profile.secondaryActionUrl}>
                                        {profile.secondaryActionLabel}
                                    </a>
                                </div>
                                <div className={styles.portfolioSocials} aria-label="Contact links">
                                    <a href={`mailto:${staticData.websiteData.email.address}`} aria-label="Email"><FaEnvelope /></a>
                                    <a href={staticData.websiteData.github.url} target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
                                    {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>}
                                </div>
                            </div>
                        </div>
                    </section>
                    {profile.showDetails && <section className={styles.portfolioDetails}>
                        <div className={styles.portfolioDetailsHeading}>
                            <p className={styles.portfolioEyebrow}>More about me</p>
                            <h2>Selected experience and work</h2>
                        </div>
                        <div className={styles.portfolioDetailsContent}>
                            <CustomHtmlViewer contentBlocks={content.blocks || []} />
                        </div>
                    </section>}
                    {(projects.length > 0 || experiences.length > 0) && <section className={styles.portfolioShowcase}>
                        {projects.length > 0 && <div className={styles.showcaseSection}>
                            <div className={styles.showcaseHeading}>
                                <div>
                                    <p className={styles.portfolioEyebrow}>Selected work</p>
                                    <h2>Projects</h2>
                                </div>
                                <a href={`${staticData.pathingData.baseUrl}/projects`} className={styles.showcaseAllLink}>View all projects <FaArrowRight aria-hidden="true" /></a>
                            </div>
                            <div className={styles.showcaseGrid}>
                                {projects.map(project => <ShowcaseCard key={project.id} item={project} type="Project" href="/projects/post" fallbackImage={staticData.defaults.projectPicture} />)}
                            </div>
                        </div>}
                        {experiences.length > 0 && <div className={styles.showcaseSection}>
                            <div className={styles.showcaseHeading}>
                                <div>
                                    <p className={styles.portfolioEyebrow}>Career journey</p>
                                    <h2>Experience</h2>
                                </div>
                                <a href={`${staticData.pathingData.baseUrl}/experiences`} className={styles.showcaseAllLink}>View all experience <FaArrowRight aria-hidden="true" /></a>
                            </div>
                            <div className={styles.showcaseGrid}>
                                {experiences.map(experience => <ShowcaseCard key={experience.id} item={experience} type="Experience" href="/experiences/post" />)}
                            </div>
                        </div>}
                    </section>}
                </>}
            </main>
        </div>
    )
}
