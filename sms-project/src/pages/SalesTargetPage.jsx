import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/Layout/MainLayout.jsx';
import { FUNNEL_STAGES, FUNNEL_ORDER, FUNNEL_COLORS, PRIORITY_LEVELS, PRIORITY_COLORS, REGIONS } from '../types/clinic.js';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * 퍼널 통계 카드 컴포넌트
 */
const FunnelCard = ({ stage, count, total, onClick, isActive }) => {
  const colors = FUNNEL_COLORS[stage];
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isActive ? colors.bg : 'white',
        border: `2px solid ${isActive ? colors.border : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1,
        minWidth: '150px'
      }}
    >
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isActive ? colors.text : '#6b7280',
        marginBottom: '8px'
      }}>
        {stage}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: isActive ? colors.text : '#111827'
      }}>
        {count}
      </div>
      <div style={{
        fontSize: '12px',
        color: isActive ? colors.text : '#9ca3af',
        marginTop: '4px'
      }}>
        전체의 {percentage}%
      </div>
    </div>
  );
};

/**
 * 토글 스위치 컴포넌트
 */
const ToggleSwitch = ({ checked, onChange, disabled }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        backgroundColor: checked ? '#10b981' : '#d1d5db',
        border: 'none',
        padding: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
};

/**
 * 중요도 뱃지 컴포넌트
 */
const PriorityBadge = ({ priority }) => {
  const colors = PRIORITY_COLORS[priority];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: colors.bg,
      color: colors.text,
      fontWeight: '700',
      fontSize: '12px',
      border: `1px solid ${colors.border}`
    }}>
      {priority}
    </span>
  );
};

/**
 * 퍼널 뱃지 컴포넌트
 */
const FunnelBadge = ({ stage }) => {
  const colors = FUNNEL_COLORS[stage];
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '6px',
      backgroundColor: colors.bg,
      color: colors.text,
      fontWeight: '500',
      fontSize: '12px',
      border: `1px solid ${colors.border}`
    }}>
      {stage}
    </span>
  );
};

/**
 * 히스토리 모달 컴포넌트
 */
const HistoryModal = ({ clinic, onClose, onAddHistory }) => {
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    await onAddHistory(clinic.cid, newContent);
    setNewContent('');
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: '20px'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              {clinic.clinicName}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
              {clinic.directorName} | {clinic.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '4px'
            }}
          >
            &times;
          </button>
        </div>

        {/* 히스토리 목록 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
          {clinic.history && clinic.history.length > 0 ? (
            [...clinic.history].reverse().map((entry, index) => (
              <div key={entry.id || index} style={{
                padding: '12px 16px',
                backgroundColor: index === 0 ? '#f0fdf4' : '#f9fafb',
                borderRadius: '8px',
                marginBottom: '8px',
                border: index === 0 ? '1px solid #10b981' : '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    {entry.date}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {entry.author}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                  {entry.content}
                </p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              아직 히스토리가 없습니다.
            </div>
          )}
        </div>

        {/* 새 히스토리 입력 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="새 히스토리 내용을 입력하세요..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newContent.trim() || isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: newContent.trim() ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: newContent.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              {isSubmitting ? '저장중...' : '히스토리 추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 메인 영업 타겟 페이지
 */
const SalesTargetPage = () => {
  const [clinics, setClinics] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 필터 상태
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 담당자 목록
  const [assignees, setAssignees] = useState([]);

  // 히스토리 모달
  const [historyModalClinic, setHistoryModalClinic] = useState(null);

  // 토큰 가져오기
  const getToken = () => sessionStorage.getItem('leandiet_token');

  // 데이터 조회
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getToken();

      // 통계 조회
      const statsRes = await fetch(`${API_BASE}/api/clinics/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error('통계 조회 실패');
      const statsData = await statsRes.json();
      setStats(statsData.data);

      // 클리닉 목록 조회
      let url = `${API_BASE}/api/clinics`;
      const params = new URLSearchParams();
      if (selectedFunnel) params.append('funnelStage', selectedFunnel);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedAssignee) params.append('assignee', selectedAssignee);
      if (selectedRegion) params.append('region', selectedRegion);
      if (params.toString()) url += `?${params.toString()}`;

      const clinicsRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!clinicsRes.ok) throw new Error('목록 조회 실패');
      const clinicsData = await clinicsRes.json();
      setClinics(clinicsData.data);

      // 담당자 목록 조회
      const assigneesRes = await fetch(`${API_BASE}/api/assignees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assigneesRes.ok) {
        const assigneesData = await assigneesRes.json();
        setAssignees(assigneesData.data);
      }

      setError(null);
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFunnel, selectedPriority, selectedAssignee, selectedRegion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 토글 업데이트
  const handleToggle = async (cid, field, value) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/clinics/${cid}/toggles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field, value })
      });

      if (!res.ok) throw new Error('업데이트 실패');

      // 로컬 상태 업데이트
      setClinics(prev => prev.map(c =>
        c.cid === cid ? { ...c, [field]: value } : c
      ));
    } catch (err) {
      console.error('토글 업데이트 오류:', err);
      alert('업데이트에 실패했습니다.');
    }
  };

  // 히스토리 추가
  const handleAddHistory = async (cid, content) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/clinics/${cid}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('히스토리 추가 실패');

      const { data: newEntry } = await res.json();

      // 로컬 상태 업데이트
      setClinics(prev => prev.map(c =>
        c.cid === cid
          ? { ...c, history: [...c.history, newEntry], lastContactDate: newEntry.date }
          : c
      ));

      // 모달의 클리닉 정보도 업데이트
      if (historyModalClinic && historyModalClinic.cid === cid) {
        setHistoryModalClinic(prev => ({
          ...prev,
          history: [...prev.history, newEntry],
          lastContactDate: newEntry.date
        }));
      }
    } catch (err) {
      console.error('히스토리 추가 오류:', err);
      alert('히스토리 추가에 실패했습니다.');
    }
  };

  // 필터링된 클리닉 목록
  const filteredClinics = clinics.filter(clinic => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        clinic.clinicName.toLowerCase().includes(term) ||
        clinic.directorName.toLowerCase().includes(term) ||
        clinic.phone.includes(term)
      );
    }
    return true;
  });

  // 필터 초기화
  const clearFilters = () => {
    setSelectedFunnel(null);
    setSelectedPriority(null);
    setSelectedAssignee(null);
    setSelectedRegion(null);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedFunnel || selectedPriority || selectedAssignee || selectedRegion || searchTerm;

  if (isLoading && !stats) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>데이터를 불러오는 중...</p>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>오류가 발생했습니다</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            다시 시도
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 헤더 */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
            영업 타겟 관리
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            한의원 영업 진행 현황을 관리합니다.
          </p>
        </div>

        {/* 퍼널 통계 카드 */}
        {stats && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            {FUNNEL_ORDER.map(stage => (
              <FunnelCard
                key={stage}
                stage={stage}
                count={stats.byFunnel[stage] || 0}
                total={stats.total}
                isActive={selectedFunnel === stage}
                onClick={() => setSelectedFunnel(selectedFunnel === stage ? null : stage)}
              />
            ))}
          </div>
        )}

        {/* 필터 영역 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 검색 */}
            <input
              type="text"
              placeholder="한의원명, 원장명, 전화번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '250px'
              }}
            />

            {/* 중요도 필터 */}
            <select
              value={selectedPriority || ''}
              onChange={(e) => setSelectedPriority(e.target.value || null)}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">모든 중요도</option>
              {Object.keys(PRIORITY_LEVELS).map(p => (
                <option key={p} value={p}>{p}등급</option>
              ))}
            </select>

            {/* 담당자 필터 */}
            <select
              value={selectedAssignee || ''}
              onChange={(e) => setSelectedAssignee(e.target.value || null)}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">모든 담당자</option>
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* 지역 필터 */}
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">모든 지역</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* 필터 초기화 */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                필터 초기화
              </button>
            )}

            {/* 결과 수 */}
            <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
              총 {filteredClinics.length}개 한의원
            </span>
          </div>
        </div>

        {/* 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={thStyle}>중요도</th>
                  <th style={thStyle}>퍼널 단계</th>
                  <th style={thStyle}>한의원명</th>
                  <th style={thStyle}>원장명</th>
                  <th style={thStyle}>연락처</th>
                  <th style={thStyle}>지역</th>
                  <th style={thStyle}>담당자</th>
                  <th style={thStyle}>마지막 컨택</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>린영업</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>경영세션</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>수멤버스</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>개원세션</th>
                  <th style={thStyle}>히스토리</th>
                </tr>
              </thead>
              <tbody>
                {filteredClinics.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                      조건에 맞는 한의원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map(clinic => (
                    <tr key={clinic.cid} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tdStyle}>
                        <PriorityBadge priority={clinic.priority} />
                      </td>
                      <td style={tdStyle}>
                        <FunnelBadge stage={clinic.funnelStage} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: '#111827' }}>
                        {clinic.clinicName}
                      </td>
                      <td style={tdStyle}>{clinic.directorName}</td>
                      <td style={tdStyle}>{clinic.phone}</td>
                      <td style={tdStyle}>{clinic.region}</td>
                      <td style={tdStyle}>{clinic.assignee}</td>
                      <td style={tdStyle}>{clinic.lastContactDate || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ToggleSwitch
                          checked={clinic.isLeanTarget}
                          onChange={(v) => handleToggle(clinic.cid, 'isLeanTarget', v)}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ToggleSwitch
                          checked={clinic.hasManagementSession}
                          onChange={(v) => handleToggle(clinic.cid, 'hasManagementSession', v)}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ToggleSwitch
                          checked={clinic.usesSooMembers}
                          onChange={(v) => handleToggle(clinic.cid, 'usesSooMembers', v)}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ToggleSwitch
                          checked={clinic.hasOpeningSession}
                          onChange={(v) => handleToggle(clinic.cid, 'hasOpeningSession', v)}
                        />
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => setHistoryModalClinic(clinic)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f0fdf4',
                            color: '#059669',
                            border: '1px solid #10b981',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>📝</span>
                          <span>{clinic.history?.length || 0}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 히스토리 모달 */}
      {historyModalClinic && (
        <HistoryModal
          clinic={historyModalClinic}
          onClose={() => setHistoryModalClinic(null)}
          onAddHistory={handleAddHistory}
        />
      )}
    </MainLayout>
  );
};

// 테이블 스타일
const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: '#374151',
  whiteSpace: 'nowrap'
};

export default SalesTargetPage;
