const Sequelize = require("sequelize");
module.exports = (sequelize, Sequelize) => {
	const AdminModel = sequelize.define("admin_logins", {
        id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: Sequelize.STRING(20),
			allowNull: true
		},
		password: {
			type: Sequelize.STRING(255),
			allowNull: true
		}
    });
    return AdminModel;
}