export const apiVersioning = ({ version = 'v1', sunset = null } = {}) => (req, res, next) => {
    res.setHeader('X-API-Version', version);

    if (sunset) {
        res.setHeader('Sunset', sunset);
    }

    next();
};
