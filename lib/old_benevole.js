exports.benevoleIsValid = (record) => {
    return record.get('Email') !== undefined;
};