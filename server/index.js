// server/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS 설정 (GitHub Pages + 로컬 개발 모두 허용)
app.use(cors({
  origin: [
    'https://downup17.github.io',  // 배포된 프론트엔드
    'http://localhost:5173'         // 로컬 개발용
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// --- 설정값 ---
const ADMIN_PASSWORD = "admin123";
const JWT_SECRET = "my_secret_key_12345";

// --- 임시 데이터베이스 ---
let wikiArticles = [
  { id: 1, title: '위키 시작하기', content: '이곳은 지식 정리 플랫폼입니다.', updatedAt: new Date() },
  { id: 2, title: '정부 디자인 가이드', content: '상단 바는 군청색(#005596)을 사용합니다.', updatedAt: new Date() }
];
let nextId = 3;

// --- 관리자 인증 미들웨어 ---
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "권한이 없습니다." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') next();
  } catch (err) {
    res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

// --- API 라우트 ---

// 1. 관리자 로그인
app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ message: "비밀번호가 틀렸습니다." });
});

// 2. 전체 문서 목록 (공개)
app.get('/api/articles', (req, res) => res.json(wikiArticles));

// 3. 문서 검색 (공개)
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  const filtered = wikiArticles.filter(a => a.title.toLowerCase().includes(query));
  res.json(filtered);
});

// 4. 새 문서 작성 (관리자 전용)
app.post('/api/articles', verifyAdmin, (req, res) => {
  const newArticle = { id: nextId++, ...req.body, updatedAt: new Date() };
  wikiArticles.push(newArticle);
  res.status(201).json(newArticle);
});

// Vercel 배포용 export
module.exports = app;

// 로컬 실행용 (Vercel에서는 무시됨)
if (require.main === module) {
  app.listen(4000, () => console.log('서버 실행 중: http://localhost:4000'));
}
