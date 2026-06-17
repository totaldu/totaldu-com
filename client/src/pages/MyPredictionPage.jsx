// client/src/pages/MyPredictionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';

const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const LEAGUE_IDS = [
  '98767991310872058',  // LCK
  '98767991314006698',  // LPL
  '98767991302996019',  // LEC
  '98767991299243165',  // LCS
  '98767991325878492',  // MSI
  '107898214974993351', // LCP
  '98767991332355509',  // CBLOL
].join(',');

const STORAGE_KEY = 'lol_my_predictions';

const loadPredictions = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};

const savePredictions = (p) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
};

const fmt = (iso) => new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

const MatchCard = ({ match, pick, onPick }) => {
  const { id, state, league, blockName, strategy, teams, startTime } = match;
  const isCompleted = state === 'completed';
  const isLive = state === 'inProgress';
  const winner = isCompleted ? teams.find(t => t.result?.outcome === 'win') : null;
  const isCorrect = isCompleted && pick && winner?.code === pick;
  const isWrong = isCompleted && pick && winner && winner.code !== pick;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* 매치 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
      >
        <span className="text-xs text-white/40 truncate">{league} · {blockName}</span>
        <div className="flex items-center gap-2 shrink-0">
          {strategy && <span className="text-xs text-white/25">{strategy}</span>}
          {isLive && (
            <span className="text-xs font-black text-[#FBBF24] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
              LIVE
            </span>
          )}
          {!isCompleted && !isLive && (
            <span className="text-xs text-white/30">{fmt(startTime)}</span>
          )}
          {isCompleted && pick && (
            isCorrect
              ? <span className="text-[#34D399] text-xs font-black flex items-center gap-1"><CheckCircle size={12} /> 적중</span>
              : <span className="text-[#F87171] text-xs font-black flex items-center gap-1"><XCircle size={12} /> 실패</span>
          )}
          {isCompleted && !pick && (
            <span className="text-xs text-white/25">미예측</span>
          )}
        </div>
      </div>

      {/* 팀 선택 */}
      <div className="flex">
        {teams.map((t, i) => {
          const isPicked = pick === t.code;
          const isWinner = winner?.code === t.code;
          const isLoser = isCompleted && winner && winner.code !== t.code;

          let bg = 'transparent';
          if (isPicked && !isCompleted) bg = 'rgba(200,150,62,0.18)';
          else if (isPicked && isCorrect) bg = 'rgba(52,211,153,0.15)';
          else if (isPicked && isWrong) bg = 'rgba(248,113,113,0.15)';
          else if (isWinner && isCompleted && !pick) bg = 'rgba(52,211,153,0.07)';

          return (
            <button
              key={t.code}
              className={`flex-1 flex flex-col items-center gap-2 py-5 px-3 transition-all select-none ${
                isCompleted ? 'cursor-default' : 'cursor-pointer active:scale-95'
              } ${i > 0 ? 'border-l border-white/5' : ''}`}
              style={{
                backgroundColor: bg,
                opacity: isLoser && !isPicked ? 0.35 : 1,
              }}
              onClick={() => !isCompleted && onPick(id, t.code)}
              disabled={isCompleted}
            >
              {t.image ? (
                <img
                  src={t.image}
                  alt={t.code}
                  className="w-12 h-12 object-contain"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 text-xs font-bold">
                  {t.code}
                </div>
              )}
              <span className={`text-sm font-black ${isPicked ? 'text-white' : 'text-white/75'}`}>
                {t.code}
              </span>
              {isCompleted && t.result?.gameWins != null && (
                <span className={`text-xs font-bold ${isWinner ? 'text-[#34D399]' : 'text-white/30'}`}>
                  {t.result.gameWins}승
                </span>
              )}
              {isPicked && !isCompleted && (
                <span className="text-[10px] text-[#C8963E] font-black">내 예측</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MyPredictionPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(loadPredictions);
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'history'

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=ko-KR&leagueId=${LEAGUE_IDS}`,
      { headers: { 'x-api-key': API_KEY }, signal: controller.signal }
    )
      .then(r => r.json())
      .then(data => {
        const events = data?.data?.schedule?.events ?? [];
        const parsed = events
          .filter(e => e.type === 'match')
          .map(e => ({
            id: e.match.id,
            startTime: e.startTime,
            state: e.state,         // 'unstarted' | 'inProgress' | 'completed'
            league: e.league.name,
            leagueSlug: e.league.slug,
            blockName: e.blockName ?? '',
            strategy: e.match.strategy?.type === 'bestOf' ? `Bo${e.match.strategy.count}` : '',
            teams: e.match.teams.map(t => ({
              code: t.code,
              name: t.name,
              image: t.image,
              result: t.result ?? null,
            })),
          }));
        setMatches(parsed);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('경기 일정을 불러오지 못했습니다.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const handlePick = useCallback((matchId, teamCode) => {
    setPredictions(prev => {
      const next = { ...prev, [matchId]: teamCode };
      savePredictions(next);
      return next;
    });
  }, []);

  // 탭별 경기 분리
  const upcoming = matches.filter(m => m.state !== 'completed');
  const history = matches.filter(m => m.state === 'completed' && predictions[m.id] != null);

  // 통계
  const correct = history.filter(m => {
    const winner = m.teams.find(t => t.result?.outcome === 'win');
    return winner && predictions[m.id] === winner.code;
  });
  const accuracy = history.length > 0 ? Math.round((correct.length / history.length) * 100) : null;

  const groupByDate = (list) => list.reduce((acc, m) => {
    const d = fmtDate(m.startTime);
    (acc[d] = acc[d] || []).push(m);
    return acc;
  }, {});

  const activeList = tab === 'upcoming' ? upcoming : history;
  const grouped = groupByDate(activeList);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1428] via-[#1e2328] to-[#0a1428] p-6 md:p-12 text-white">
      <div className="max-w-xl mx-auto">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/lol/prediction')}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors text-sm font-bold mb-8"
        >
          <ChevronLeft size={16} /> 승부예측
        </button>

        {/* 페이지 헤더 */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-[#C8963E] rounded-xl flex items-center justify-center shrink-0">
            <Target color="white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">나만의 승부예측</h1>
            <p className="text-xs text-white/35">진행 중인 대회의 경기 결과를 예측해보세요</p>
          </div>
        </div>

        {/* 통계 배너 */}
        {history.length > 0 && (
          <div
            className="flex items-center gap-8 mt-6 mb-4 rounded-2xl px-6 py-4"
            style={{ backgroundColor: 'rgba(200,150,62,0.1)', border: '1px solid rgba(200,150,62,0.2)' }}
          >
            <div className="text-center">
              <div className="text-2xl font-black text-[#C8963E]">{accuracy}%</div>
              <div className="text-[11px] text-white/40 mt-0.5">적중률</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{correct.length}</div>
              <div className="text-[11px] text-white/40 mt-0.5">적중</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{history.length - correct.length}</div>
              <div className="text-[11px] text-white/40 mt-0.5">실패</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{history.length}</div>
              <div className="text-[11px] text-white/40 mt-0.5">총 예측</div>
            </div>
          </div>
        )}

        {/* 탭 전환 */}
        <div className="flex gap-2 mt-6 mb-6">
          {[
            { key: 'upcoming', label: `예정·진행중 (${upcoming.length})` },
            { key: 'history', label: `결과 확인 (${history.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${
                tab === t.key
                  ? 'bg-[#C8963E] border-[#C8963E] text-[#1e2328]'
                  : 'text-white/50 border-white/10 hover:border-white/30 hover:text-white/75 bg-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="py-24 text-center text-white/35">
            <Clock size={28} className="mx-auto mb-3 animate-spin opacity-50" />
            경기 일정 불러오는 중...
          </div>
        )}
        {error && (
          <div className="py-20 text-center text-white/35">{error}</div>
        )}

        {/* 경기 카드 목록 */}
        {!loading && !error && (
          <>
            {activeList.length === 0 ? (
              <div className="py-20 text-center">
                <Trophy size={32} className="mx-auto text-white/15 mb-4" />
                <p className="text-white/35 text-sm">
                  {tab === 'upcoming' ? '현재 예정된 경기가 없습니다' : '예측한 완료 경기가 없습니다'}
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, dayMatches]) => (
                <div key={date} className="mb-8">
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-3">{date}</p>
                  <div className="flex flex-col gap-3">
                    {dayMatches.map(m => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        pick={predictions[m.id] ?? null}
                        onPick={handlePick}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        <p className="text-white/15 text-[10px] text-center mt-8 pb-4">
          예측 결과는 이 기기에 저장됩니다 · 출처: lolesports.com
        </p>
      </div>
    </div>
  );
};

export default MyPredictionPage;
