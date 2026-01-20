const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'vendor', 'customer']),
    vendorId: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
