const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { createOrAccessChat, fetchChats, createGroup, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatController')

const router = express.Router()

router.post('/', requireAuth, createOrAccessChat)
router.get('/', requireAuth, fetchChats)
router.post('/group', requireAuth, createGroup)
router.put('/rename', requireAuth, renameGroup)
router.put('/groupadd', requireAuth, addToGroup)
router.put('/groupremove', requireAuth, removeFromGroup)

module.exports = router