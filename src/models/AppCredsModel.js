module.exports = (sequelize, Sequelize) => {
    const AppCredsModel = sequelize.define("app_creds", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        db_name: {
            type: Sequelize.STRING(30),
            allowNull: true
        },
        password: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        host_name: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        app_name: {
                type: Sequelize.STRING(30),
                allowNull: true
            },
        everypoint_api_key: {
            type: Sequelize.STRING(100),
            allowNull: true
        }
        });
    return AppCredsModel;
};