export function normaliseEditorBlocks(blocks) {
    return blocks.map(block => {
        if (block.type === "image" && block.data.unsplash === undefined) {
            return { ...block, data: { ...block.data, unsplash: "" } };
        }

        if (block.type === "table") {
            return {
                ...block,
                data: {
                    ...block.data,
                    content: block.data.content.map(value => ({ row: value }))
                }
            };
        }

        return block;
    });
}
