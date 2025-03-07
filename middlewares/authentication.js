const getTokenSecret = () => {
    return process.env.TOKEN_SECRET || 'UFOOD_TOKEN_SECRET'
}

const retrieveToken = req => {
    return (req.headers['authorization'] || req.headers['Authorization'] || '').replace('Bearer ', '')
}

module.exports = { getTokenSecret, retrieveToken }