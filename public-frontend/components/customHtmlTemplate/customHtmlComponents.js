import styles from "../../styles/Home.module.css";
import Parser from "html-react-parser";

export const CustomHtmlHeader = ({block}) => {
    switch (block.data.level) {
        case 1:
            return (
                <h1 className={styles.customHtmlHeading}>{block.data.text}</h1>
            )
        case 2:
            return (
                <h2 className={styles.customHtmlHeading}>{block.data.text}</h2>
            )
        case 3:
            return (
                <h3 className={styles.customHtmlHeading}>{block.data.text}</h3>
            )
        case 4:
            return (
                <h4 className={styles.customHtmlHeading}>{block.data.text}</h4>
            )
        case 5:
            return (
                <h5 className={styles.customHtmlHeading}>{block.data.text}</h5>
            )
        case 6:
            return (
                <h6 className={styles.customHtmlHeading}>{block.data.text}</h6>
            )
        default:
            return (
                <h1 className={styles.customHtmlHeading}>{block.data.text}</h1>
            )
    }
}

export const CustomHtmlParagraph = ({block}) => {
    return (
        <p className={styles.customHtmlParagraph} style={{textAlign: block.data.alignment}}>{block.data.text}</p>
    )
}

export const CustomHtmlDelimiter = ({block}) => {
    return (
        <div className={styles.customHtmlDelimiter} aria-hidden="true">
            <span />
            <p>✦</p>
            <span />
        </div>
    )
}

export const CustomHtmlList = ({block}) => {
    const items = block.data.items || [];
    if (block.data.style === "unordered") {
        return (
            <ul className={styles.customHtmlUnorderedList}>
                {
                    items.map((li, i) => <li key={i} className={styles.customHtmlUnorderedListItem}>{li}</li>)
                }
            </ul>
        );

    } else if (block.data.style === "ordered") {
        return (
            <ol className={styles.customHtmlOrderedList}>
                {
                    items.map((li, i) => <li key={i} className={styles.customHtmlUnorderedListItem}>{li}</li>)
                }
            </ol>
        );
    }
}

export const CustomHtmlImage = ({block}) => {
    const imageUrl = block.data.url || block.data.file?.url;
    if (!imageUrl) return null;

    return (
        <figure className={styles.customHtmlFigure}>
            {/* Editor.js images are author-provided URLs or Firestore data URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.customHtmlImage} src={imageUrl} title={block.data.caption || ""} alt={block.data.caption || "Article image"}/>
            {block.data.caption && <figcaption className={styles.customHtmlImageCaption}>{block.data.caption}</figcaption>}
        </figure>
    )
}

export const CustomHtmlRaw = ({block}) => {
    return (
        <div className={styles.customHtmlRawHtml}>{Parser(block.data.html)}</div>
    )
}

export const CustomHtmlCode = ({block}) => {
    return <pre className={styles.customHtmlCode}><code>{block.data.code || ""}</code></pre>
}

export const CustomHtmlTable = ({block}) => {
    const rows = (block.data.content || []).map(row => row.row || row);
    const [headerRow, ...bodyRows] = rows;

    return (
        <div className={styles.customHtmlTableWrapper}>
            <table className={styles.customHtmlTable}>
                {block.data.withHeadings && headerRow && <thead><tr>{headerRow.map((cell, index) => <th key={index} className={styles.customHtmlTableHeader}>{cell}</th>)}</tr></thead>}
                <tbody>{(block.data.withHeadings ? bodyRows : rows).map((row, rowIndex) => <tr key={rowIndex} className={styles.customHtmlTableRow}>{row.map((cell, cellIndex) => <td key={cellIndex} className={styles.customHtmlTableData}>{cell}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}

export const CustomHtmlQuote = ({block}) => {
    return (
        <blockquote className={styles.customHtmlBlockquote}>
            <p style={{textAlign: block.data.alignment}}>{block.data.text}</p>
            {block.data.caption && <footer className={styles.customHtmlBlockquoteFooter}><cite>{block.data.caption}</cite></footer>}
        </blockquote>
    )
}
