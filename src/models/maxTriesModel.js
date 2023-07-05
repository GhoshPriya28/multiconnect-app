module.exports = (sequelize, Sequelize) => {
    const MaxTriesModel = sequelize.define("max_tries", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        initiate_id: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        attempts: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
        });
    return MaxTriesModel;
};