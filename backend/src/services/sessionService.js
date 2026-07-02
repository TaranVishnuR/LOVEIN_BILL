const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const createSession = async ({ email, status, result, ip }) => {
  const sessionId = uuidv4();

  // Optimized: Removed the old sequential UPDATE statement to allow true multi-device concurrent operations safely
  await pool.query(
    `
    INSERT INTO user_sessions (id, user_email, login_time, session_status, login_result, ip_address)
    VALUES ($1, $2, NOW(), $3, $4, $5);
    `,
    [sessionId, email, status, result, ip]
  );

  return sessionId;
};

const logoutSession = async (sessionId) => {
  await pool.query(
    `
    UPDATE user_sessions
    SET logout_time = CURRENT_TIMESTAMP, session_status = 'LOGGED_OUT'
    WHERE id = $1 AND session_status = 'ACTIVE';
    `,
    [sessionId]
  );
};

const getSessions = async () => {
  const result = await pool.query(`
    SELECT id, user_email, login_time, logout_time, session_status, login_result, ip_address
    FROM user_sessions
    ORDER BY login_time DESC;
  `);
  return result.rows;
};

module.exports = {
  createSession,
  logoutSession,
  getSessions,
};
