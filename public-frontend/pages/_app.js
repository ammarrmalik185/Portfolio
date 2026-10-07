import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "../components/globalComponents/Header";
import Footer from "../components/globalComponents/Footer";
import Head from "next/head";
const staticData = require("../staticData.json")
import styles from "../styles/Home.module.css"

function MyApp({ Component, pageProps }) {
  return <div>
    <Head>
      <title>{staticData.websiteData.title}</title>
      {staticData.websiteData.description && <meta name="description" content={staticData.websiteData.description} />}
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header/>
    <Component className={styles.mainBody} {...pageProps} />
    <Footer/>
  </div>
}

export default MyApp
