import { useId, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getProjectTagCounts, getProjectTagSuggestions } from "../../services/projectTags";
import styles from "../../styles/Home.module.css";

export default function ProjectSearch({ projects, query, selectedTags, onQueryChange, onTagsChange, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsId = useId();
    const suggestions = getProjectTagSuggestions(projects, query, selectedTags);
    const tagsByKey = new Map(getProjectTagCounts(projects).map(tag => [tag.key, tag]));
    const showSuggestions = isOpen && !disabled && suggestions.length > 0;
    const activeIndex = activeSuggestion < suggestions.length ? activeSuggestion : -1;

    const addTag = tag => {
        if (disabled || selectedTags.includes(tag.key)) return;
        onTagsChange([...selectedTags, tag.key]);
        onQueryChange("");
        setActiveSuggestion(-1);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = key => {
        onTagsChange(selectedTags.filter(tag => tag !== key));
        setActiveSuggestion(-1);
    };

    const handleKeyDown = event => {
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveSuggestion(event.key === "ArrowDown"
                ? (activeIndex + 1) % suggestions.length
                : activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1);
        } else if (event.key === "Enter") {
            event.preventDefault();
            const tag = showSuggestions && activeIndex >= 0
                ? suggestions[activeIndex]
                : suggestions.find(suggestion => suggestion.key === query.trim().toLowerCase());
            if (tag) addTag(tag);
            else setIsOpen(false);
        } else if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            setActiveSuggestion(-1);
        } else if (event.key === "Backspace" && !query && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className={styles.projectSearch} onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsOpen(false);
                setActiveSuggestion(-1);
            }
        }}>
            <label htmlFor={`${suggestionsId}-input`} className={styles.projectSearchLabel}>Search projects</label>
            <div className={styles.projectSearchBox}>
                {selectedTags.length > 0 && <div className={styles.projectFilterTags} role="group" aria-label="Selected tags">
                    {selectedTags.map(key => {
                        const tag = tagsByKey.get(key);
                        return <button key={key} type="button" className={`${styles.projectFilterTag} ${styles.projectFilterTagActive}`} aria-label={`Remove ${tag?.label || key} filter`} disabled={disabled} onClick={() => removeTag(key)}>
                            {tag?.label || key} {tag && <span className={styles.projectFilterCount}>{tag.count}</span>} <FaTimes aria-hidden="true" />
                        </button>;
                    })}
                </div>}
                <div className={styles.projectSearchInputRow}>
                    <FaSearch aria-hidden="true" />
                    <input ref={inputRef} id={`${suggestionsId}-input`} type="search" role="combobox" aria-autocomplete="list" aria-expanded={showSuggestions} aria-controls={showSuggestions ? suggestionsId : undefined} aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${suggestionsId}-${activeIndex}` : undefined} autoComplete="off" placeholder="Search names, descriptions, or tags..." value={query} disabled={disabled} onFocus={() => setIsOpen(true)} onChange={event => {
                        onQueryChange(event.target.value);
                        setActiveSuggestion(-1);
                        setIsOpen(true);
                    }} onKeyDown={handleKeyDown} />
                    {(query || selectedTags.length > 0) && <button type="button" className={styles.projectSearchClear} disabled={disabled} onClick={() => {
                        onQueryChange("");
                        onTagsChange([]);
                        setIsOpen(false);
                        setActiveSuggestion(-1);
                    }}>Clear all</button>}
                </div>
            </div>
            {showSuggestions && <div className={styles.projectSearchSuggestions}>
                <p>Suggested tags <span>Select a tag to add a filter</span></p>
                <div id={suggestionsId} role="listbox" aria-label="Suggested tags">
                    {suggestions.map((tag, index) => <button key={tag.key} id={`${suggestionsId}-${index}`} type="button" role="option" tabIndex={-1} aria-selected={activeIndex === index} className={activeIndex === index ? styles.projectSearchSuggestionActive : ""} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => addTag(tag)}>
                        <span>{tag.label}</span><span className={styles.projectFilterCount}>{tag.count}</span>
                    </button>)}
                </div>
            </div>}
            <p className={styles.projectSearchHint}>Type to search, or choose suggested tags. Projects must match every selected tag.</p>
        </div>
    );
}
