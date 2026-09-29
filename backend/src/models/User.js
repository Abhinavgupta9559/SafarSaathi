const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

/**
 * User model (repository pattern over lowdb).
 * Fields stored: id, name, email, passwordHash, phone, preferredLanguage,
 * createdAt. Passwords are NEVER stored in plain text (see authController).
 */
class User {
  static findByEmail(email) {
    return db
      .get("users")
      .find({ email: email.toLowerCase().trim() })
      .value();
  }

  static findById(id) {
    return db.get("users").find({ id }).value();
  }

  static create({ name, email, passwordHash, phone }) {
    const user = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone || null,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };
    db.get("users").push(user).write();
    return user;
  }

  static updateLanguage(id, language) {
    return db
      .get("users")
      .find({ id })
      .assign({ preferredLanguage: language })
      .write();
  }

  /** Strip sensitive fields before sending user data to the client. */
  static toPublicJSON(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

module.exports = User;
