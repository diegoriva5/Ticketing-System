const crypto = require('crypto');

function hashPassword(password) {
  // Generate a salt (16 bytes is a common length)
  const salt = crypto.randomBytes(16).toString('hex');

  // Hash the password with the generated salt synchronously
  const derivedKey = crypto.scryptSync(password, salt, 32); // Use 64 if your target key length is 64 bytes

  // Convert the derived key to a hex string for storage
  const hashedPassword = derivedKey.toString('hex');

  // Print the salt and hashed password
  console.log({ salt, hashedPassword });
}

// Example usage
hashPassword('pwd');
hashPassword('pwd');
hashPassword('pwd');
hashPassword('pwd');
hashPassword('pwd');
hashPassword('pwd');
