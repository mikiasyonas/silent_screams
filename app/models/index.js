const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,  

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize; 
db.sequelize = sequelize;

db.issues = require("./issue.model.js")(sequelize, Sequelize);
db.comments = require("./comment.model.js")(sequelize, Sequelize);
db.categories = require("./category.model.js")(sequelize, Sequelize);
db.users = require('./user.model')(sequelize, Sequelize);

db.issues.hasMany(db.comments, { as: "comments" });
db.comments.belongsTo(db.issues, {
  foreignKey: "issueId",
  as: "issue",
});
db.categories.hasMany(db.issues, {
    as: "issues"
})
db.issues.belongsTo(db.categories, {
  foreignKey: "categoryId",
  as: "category"
});

db.users.hasMany(db.issues, {
  as: "issues"
});
db.issues.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user"
})

module.exports = db;