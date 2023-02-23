import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'
import List from '@editorjs/list';
import InlineImage from 'editorjs-inline-image';
const RawTool = require('@editorjs/raw');
import Table from '@editorjs/table';
// import Table from 'editorjs-table';
const Paragraph = require('editorjs-paragraph-with-alignment');
import Quote from '@editorjs/quote';
const Delimiter = require('@editorjs/delimiter');
const CodeTool = require('@editorjs/code');

import styles from '../../styles/Home.module.css'

const editor = new EditorJS({
    holder: 'editorHolder',
    tools: {
        paragraph: Paragraph,
        header: Header,
        delimiter: Delimiter,
        code: CodeTool,
        table: {
            class: Table,
            inlineToolbar: [],
        },
        raw: RawTool,
        list: List,
        image: {
            class: InlineImage,
            inlineToolbar: true,
            config: {
                embed: {
                    display: true,
                },
                unsplash:{
                    appName: 'Portfolio Website',
                    clientId: 'za5eB4XR4uyOZDGTF3CD1Kcp8xlC96gKFs4tBo1BoXY'
                }
            }
        },
        quote: {
            class: Quote,
            config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
            },
        },

    },
    data:{
        blocks:[
            {
                type: "paragraph",
                data:{
                    text: "Start Writing"
                }
            }
        ]
    }
});

export default function CustomHtmlEditor({ data , onEditor }) {
    if(data !== undefined){
        editor.blocks = data;
    }
    onEditor(editor);
    return(
        <div className={styles.editorHolder}>
            <div id='editorHolder' className='bg-gray'/>
        </div>
    )
}


