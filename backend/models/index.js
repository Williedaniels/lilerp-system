const sequelize = require("../config/database");
const User = require("./User");
const Incident = require("./Incident");
const Response = require("./Response");

// Associations
User.hasMany(Incident, { foreignKey: "reporter_id", as: "reported_incidents" });
Incident.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });

User.hasMany(Response, { foreignKey: "responder_id", as: "responses" });
Response.belongsTo(User, { foreignKey: "responder_id", as: "responder" });

Incident.hasMany(Response, { foreignKey: "incident_id", as: "responses" });
Response.belongsTo(Incident, { foreignKey: "incident_id", as: "incident" });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
  }
};

module.exports = {
  sequelize,
  User,
  Incident,
  Response,
  syncDatabase,
};

