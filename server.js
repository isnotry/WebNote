const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 8080;

const NOTES_DIR = path.join(__dirname, 'notes');
const EXPIRY_DAYS = 7;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由应该在静态文件中间件之前定义
app.get('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const notePath = path.join(NOTES_DIR, `${noteId}.json`);
    
    try {
      const data = await fs.readFile(notePath, 'utf-8');
      const note = JSON.parse(data);
      
      const now = Date.now();
      const expiryDate = new Date(note.expiresAt).getTime();
      
      if (now > expiryDate) {
        await fs.unlink(notePath);
        return res.status(404).json({ error: 'Note has expired' });
      }
      
      res.json(note);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Note not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error retrieving note data:', error);
    res.status(500).json({ error: 'Failed to retrieve note' });
  }
});

// 静态文件中间件
app.use(express.static('public'));

const forbiddenWords = [
  '暴力',
  '色情',
  '赌博',
  '毒品',
  '诈骗',
  '黑客',
  '攻击',
  '炸弹',
  '恐怖',
  '极端',
  '邪教',
  '分裂',
  '颠覆',
  '反动',
  '违禁',
  '非法',
  '犯罪',
  '洗钱',
  '走私'
];

function checkForbiddenWords(content) {
  const foundWords = [];
  
  for (const word of forbiddenWords) {
    if (content.includes(word)) {
      foundWords.push(word);
    }
  }
  
  return foundWords;
}

async function ensureNotesDir() {
  try {
    await fs.mkdir(NOTES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating notes directory:', error);
  }
}

async function cleanExpiredNotes() {
  try {
    const files = await fs.readdir(NOTES_DIR);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(NOTES_DIR, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;
      const maxAge = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      if (age > maxAge) {
        await fs.unlink(filePath);
        console.log(`Deleted expired note: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning expired notes:', error);
  }
}

setInterval(cleanExpiredNotes, 60 * 60 * 1000);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/notes', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }
    
    const foundWords = checkForbiddenWords(content);
    if (foundWords.length > 0) {
      return res.status(400).json({ 
        error: `内容包含违禁词：${foundWords.join('、')}`,
        forbiddenWords: foundWords
      });
    }
    
    const noteId = uuidv4();
    const notePath = path.join(NOTES_DIR, `${noteId}.json`);
    
    const noteData = {
      id: noteId,
      content: content,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
    
    await fs.writeFile(notePath, JSON.stringify(noteData, null, 2));
    
    res.json({ 
      id: noteId,
      url: `/note/${noteId}`,
      expiresAt: noteData.expiresAt
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/note/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // 验证 noteId 是否为有效的 UUID 格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(noteId)) {
      return res.status(404).sendFile(path.join(__dirname, 'public', 'notfound.html'));
    }
    
    const notePath = path.join(NOTES_DIR, `${noteId}.json`);
    
    try {
      const data = await fs.readFile(notePath, 'utf-8');
      const note = JSON.parse(data);
      
      const now = Date.now();
      const expiryDate = new Date(note.expiresAt).getTime();
      
      if (now > expiryDate) {
        await fs.unlink(notePath);
        return res.status(404).sendFile(path.join(__dirname, 'public', 'expired.html'));
      }
      
      res.sendFile(path.join(__dirname, 'public', 'note.html'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).sendFile(path.join(__dirname, 'public', 'notfound.html'));
      }
      throw error;
    }
  } catch (error) {
    console.error('Error retrieving note:', error);
    res.status(500).json({ error: 'Failed to retrieve note' });
  }
});

async function startServer() {
  await ensureNotesDir();
  await cleanExpiredNotes();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
