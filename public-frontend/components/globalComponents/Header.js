import { Navbar, Nav, Container } from 'react-bootstrap';
import styles from "../../styles/Home.module.css";
import { auth } from "../../services/firebaseService"
import { useRouter } from "next/router";
import { detectPage } from "../../services/pageDetector";
import { useAuthState } from 'react-firebase-hooks/auth';
const staticData = require("../../staticData.json")
import firebase from "firebase";

export default function Header() {
    const router = useRouter();
    const [user, loading, error] = useAuthState(firebase.auth());
    const currentPage = detectPage(router.pathname);
    let isLogged = false;
    let isAdmin = false;

    if (loading || error || !user) {
        isLogged = false;
    }else{
        isLogged = true;
        isAdmin = staticData.adminData.adminIds.includes(user.uid)
    }

    return (
        <Navbar className={styles.header} expand="lg">
            <Container>
                <Navbar.Brand className={styles.headerBrand}>{staticData.websiteData.title}</Navbar.Brand>

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/"} active={currentPage === staticData.pathingData.pageEnum.home}>Home</Nav.Link>
                        <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/blogs"} active={currentPage === staticData.pathingData.pageEnum.blogs}>Blogs</Nav.Link>
                        <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/projects"} active={currentPage === staticData.pathingData.pageEnum.projects}>Projects</Nav.Link>
                        <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/portfolios"} active={currentPage === staticData.pathingData.pageEnum.portfolios}>Portfolios</Nav.Link>
                        {isAdmin && <Nav className="me-auto">
                            <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/edit"} active={currentPage === staticData.pathingData.pageEnum.homeEdit}>Edit Main Portfolio</Nav.Link>
                         </Nav>}
                        {isLogged && <Nav className="me-auto">
                            <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/blogs/edit"} active={currentPage === staticData.pathingData.pageEnum.blogEdit}>Create Blog</Nav.Link>
                            <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/projects/edit"} active={currentPage === staticData.pathingData.pageEnum.projectEdit}>Create Project</Nav.Link>
                            <Nav.Link className={styles.headerNavLink} href={staticData.pathingData.baseUrl + "/portfolios/edit"} active={currentPage === staticData.pathingData.pageEnum.portfolioEdit}>Create Portfolio</Nav.Link>
                        </Nav>}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Text className={styles.headerText}>
                    {isLogged && <a className={styles.headerText} onClick={() => auth.signOut()}>Signout</a>}
                    {!isLogged && <a className={styles.headerText} href={staticData.pathingData.baseUrl + "/user/login"}>Login</a>}
                </Navbar.Text>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
            </Container>
        </Navbar>
    );
}
