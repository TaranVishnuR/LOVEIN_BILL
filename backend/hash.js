const bcrypt = require("bcryptjs");

async function run() {
  console.log(
    await bcrypt.hash("lovein@123", 10)
  );

  console.log(
    await bcrypt.hash("cashier@123", 10)
  );

  console.log(
    await bcrypt.hash("inventory@123", 10)
  );
}

run();