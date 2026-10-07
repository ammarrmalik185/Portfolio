import { Container } from "react-bootstrap";
import styles from "../../styles/Home.module.css";
import Parser from "html-react-parser";
const staticData = require("../../staticData.json")

export default function Footer(){
    const { websiteData } = staticData;

    return(
        <footer className={styles.footer}>
            <Container className={styles.footerContainer}>
                <div className={styles.footerTop}>
                    <section className={styles.footerIntroduction}>
                        <p className={styles.footerEyebrow}>Let&apos;s work together</p>
                        <h2>Have an idea worth building?</h2>
                        <p>Get in touch to discuss products, platforms, and thoughtful digital experiences.</p>
                        <a className={styles.footerCta} href={`mailto:${websiteData.email.address}`}>Start a conversation</a>
                    </section>
                    <section className={styles.footerLinks}>
                        <h3>Contact</h3>
                        <a href={`mailto:${websiteData.email.address}`}>{websiteData.email.title}</a>
                        <a href={`tel:${websiteData.contactNo}`}>{websiteData.contactNo}</a>
                    </section>
                    <section className={styles.footerLinks}>
                        <h3>Elsewhere</h3>
                        <a href={websiteData.github.url} target="_blank" rel="noreferrer">{websiteData.github.title}</a>
                        <a href={websiteData.twitter.url} target="_blank" rel="noreferrer">{websiteData.twitter.title}</a>
                        <a href={websiteData.instagram.url} target="_blank" rel="noreferrer">{websiteData.instagram.title}</a>
                    </section>
                </div>
                <div className={styles.footerBottom}>
                    <span>© {new Date().getFullYear()} {websiteData.title}</span>
                    <span>{Parser(websiteData.credits)}</span>
                </div>
            </Container>
        </footer>
    )
}
