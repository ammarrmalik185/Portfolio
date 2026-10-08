function getExperienceDetails(metadata = {}) {
    const isEducation = metadata.type === "university" || metadata.type === "college";
    return {
        isEducation,
        typeLabel: metadata.type === "university" ? "University" : metadata.type === "college" ? "College" : "Work experience",
        organization: isEducation ? metadata.institution : metadata.company,
        subtitle: isEducation ? metadata.fieldOfStudy : metadata.employmentType
    };
}

module.exports = { getExperienceDetails };
