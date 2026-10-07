import styles from '../../styles/Home.module.css';
const { ViewerConfig } = require('./customHTMLConfig');

export default function CustomHtmlViewer({ contentBlocks = [] }) {
    return (
        <div className={styles.editorContent}>
            <section>
                {contentBlocks.map((block, index) => ViewerConfig.AutoRenderer({ ...block, id: block.id || `${block.type}-${index}` }))}
            </section>
        </div>
    );
}
