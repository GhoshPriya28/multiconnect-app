exports.getDataFromQuery = async (queryString, sequelize) => {
    return new Promise((resolve, reject) => {
        sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT }).then(queryData => {
            resolve(queryData)
        }).catch(error => {
            console.log('Query Data Error', error)
            reject(error)
        })
    })
}
