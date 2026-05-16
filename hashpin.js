import bcrypt from 'bcryptjs';
console.log(bcrypt.hashSync('5678', 10));