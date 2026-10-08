import { useState } from "react";
import staticData from "../../staticData.json";

export default function FallbackImage({ src, legacySrc, fallbackSrc, kind = "project", alt = "", ...props }) {
    const [failedSources, setFailedSources] = useState([]);
    const baseUrl = staticData.pathingData.baseUrl;
    const localDefault = `${baseUrl}/images/default-${kind}.svg`;
    const resolveSource = source => {
        if (typeof source !== "string" || !source.trim()) return null;
        const value = source.trim();
        return baseUrl && value.startsWith("/") && !value.startsWith("//") && !value.startsWith(`${baseUrl}/`)
            ? `${baseUrl}${value}`
            : value;
    };
    const sources = [...new Set([src, legacySrc, fallbackSrc, staticData.defaults[`${kind}Picture`], localDefault]
        .map(resolveSource).filter(Boolean))];
    const image = sources.find(source => !failedSources.includes(source)) || localDefault;

    // Covers support author-managed URLs, data URLs, and local fallback assets.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={image} alt={alt} onError={() => {
        if (image === localDefault) return;
        setFailedSources(current => current.includes(image) ? current : [...current, image]);
    }} />;
}
