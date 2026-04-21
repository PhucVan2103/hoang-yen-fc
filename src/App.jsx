import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft,
  X,
  Wifi,
  Battery,
  Signal,
  Wallet,
  TrendingUp,
  TrendingDown,
  Heart,
  Church,
  ChevronLeft,
  Edit2,
  Image as ImageIcon,
  Upload,
  Lock,
  AlertCircle,
  CalendarDays,
  MapPin,
  Clock,
  Swords
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = { 
  apiKey: "AIzaSyCv2Y2oIAMUlsYj1Q-0hCJDGDLopGamskM", 
  authDomain: "hoang-yen-fc.firebaseapp.com", 
  projectId: "hoang-yen-fc", 
  storageBucket: "hoang-yen-fc.firebasestorage.app", 
  messagingSenderId: "754597692010", 
  appId: "1:754597692010:web:4b3a26965423e9ed0bc013" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const IPhone14Frame = ({ children }) => {
  return (
    <div className="md:flex md:items-center md:justify-center md:min-h-screen md:bg-slate-100 font-sans text-slate-900">
      <div className="relative w-full h-screen md:h-[844px] md:w-[390px] md:border-gray-800 md:dark:border-gray-800 md:bg-gray-800 md:border-[14px] md:rounded-[3.5rem] md:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden bg-white">
        <div className="hidden md:block h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-s-lg"></div>
        <div className="hidden md:block h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-s-lg"></div>
        <div className="hidden md:block h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-s-lg"></div>
        <div className="hidden md:block h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-e-lg"></div>

        <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 items-center justify-center">
           <div className="w-3 h-3 bg-[#0d0d0d] rounded-full ml-auto mr-4"></div>
        </div>

        <div className="hidden md:flex absolute top-0 left-0 right-0 h-12 items-center justify-between px-7 z-40 text-slate-900 drop-shadow-sm mix-blend-color-burn">
          <span className="text-[15px] font-semibold tracking-tight mt-1">9:41</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Signal size={15} strokeWidth={2.5} />
            <Wifi size={15} strokeWidth={2.5} />
            <Battery size={20} strokeWidth={2} />
          </div>
        </div>

        <div className="h-full w-full bg-[#f4f6f8] overflow-hidden md:rounded-[2.5rem] relative">
          {children}
        </div>

        <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-slate-900/40 rounded-full z-50"></div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true); 
  
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [activeMainTab, setActiveMainTab] = useState('info'); 
  const [activeFundTab, setActiveFundTab] = useState('transactions');
  const [activeInfoTab, setActiveInfoTab] = useState('matches'); // 'matches' hoặc 'standings'
  
  const [transactions, setTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]); 
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false); 
  const [modalType, setModalType] = useState('fund'); 
  const [showTournamentModal, setShowTournamentModal] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingTournament, setEditingTournament] = useState(null); 
  const [editingData, setEditingData] = useState(null); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentImage, setNewTournamentImage] = useState('');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    donorName: '',
    imageUrl: '',
    homeTeam: '',
    awayTeam: '',
    group: 'Bảng A',
    matchTime: '18:00',
    location: 'Nhà Thờ Thanh An',
    homeScore: '',
    awayScore: '',
    isCompleted: false,
    teamName: '',
    teamGroup: 'Bảng A'
  });

  const fileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const defaultTournamentImg = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop";

  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const number = val.toString().replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const parseFormattedNumber = (val) => Number(val.toString().replace(/\./g, ''));

  const sortNewestFirst = (a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
    const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
    if (dateB - dateA !== 0) return dateB - dateA;
    const timeA = new Date(a.createdAt || 0);
    const timeB = new Date(b.createdAt || 0);
    return timeB - timeA;
  };

  const sortMatches = (a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB - dateA; 
  };

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (err) { console.error(err); } };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubTrans = onSnapshot(collection(db, 'transactions'), (snap) => setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubDonations = onSnapshot(collection(db, 'donations'), (snap) => setDonations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubPhotos = onSnapshot(collection(db, 'gallery'), (snap) => setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortMatches)));
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snap) => setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snap) => setTournaments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))));
    return () => { unsubTrans(); unsubDonations(); unsubPhotos(); unsubMatches(); unsubTeams(); unsubTournaments(); };
  }, [user]);

  const currentTransactions = useMemo(() => transactions.filter(t => t.tournamentId === activeTournamentId), [transactions, activeTournamentId]);
  const currentDonations = useMemo(() => donations.filter(d => d.tournamentId === activeTournamentId), [donations, activeTournamentId]);
  const currentPhotos = useMemo(() => photos.filter(p => p.tournamentId === activeTournamentId), [photos, activeTournamentId]);
  const currentMatches = useMemo(() => matches.filter(m => m.tournamentId === activeTournamentId), [matches, activeTournamentId]);
  const currentTeams = useMemo(() => teams.filter(t => t.tournamentId === activeTournamentId), [teams, activeTournamentId]);

  // Logic Tạo Bảng Xếp Hạng Chuẩn
  const standings = useMemo(() => {
    const table = {}; 
    const teamOverrides = {}; 
    const teamIdMap = {};

    // Lấy bảng cố định của các đội đã được User lưu trong DB
    currentTeams.forEach(t => {
      teamOverrides[t.name] = t.group || 'Bảng Chung';
      teamIdMap[t.name] = t.id;
    });

    const initTeam = (group, teamName) => {
      if (!table[group]) table[group] = {};
      if (!table[group][teamName]) {
        table[group][teamName] = { 
          id: teamIdMap[teamName] || null, 
          name: teamName, 
          group: group,
          p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 
        };
      }
    };

    // 1. Khởi tạo tất cả các đội đã biết vào Bảng của họ
    currentTeams.forEach(t => {
      initTeam(teamOverrides[t.name], t.name);
    });

    // 2. Chạy qua các Trận đấu để tính điểm và tạo thêm đội nếu có đội mới
    currentMatches.forEach(m => {
      const hTeam = m.homeTeam || 'Đội 1';
      const aTeam = m.awayTeam || m.opponent || 'Đội 2';
      
      // Nếu đội đã được gán bảng trong teamOverrides thì ưu tiên dùng, nếu không thì lấy bảng từ trận đấu
      const hGroup = teamOverrides[hTeam] || m.group || 'Bảng Chung';
      const aGroup = teamOverrides[aTeam] || m.group || 'Bảng Chung';

      initTeam(hGroup, hTeam);
      initTeam(aGroup, aTeam);

      if (m.isCompleted && m.homeScore !== null && m.homeScore !== '' && m.awayScore !== null && m.awayScore !== '') {
        const hs = Number(m.homeScore);
        const as = Number(m.awayScore);

        // Cộng điểm Đội nhà
        const ht = table[hGroup][hTeam];
        ht.p += 1; ht.gf += hs; ht.ga += as; ht.gd += (hs - as);
        if (hs > as) { ht.w += 1; ht.pts += 3; }
        else if (hs === as) { ht.d += 1; ht.pts += 1; }
        else { ht.l += 1; }

        // Cộng điểm Đội khách
        const at = table[aGroup][aTeam];
        at.p += 1; at.gf += as; at.ga += hs; at.gd += (as - hs);
        if (as > hs) { at.w += 1; at.pts += 3; }
        else if (as === hs) { at.d += 1; at.pts += 1; }
        else { at.l += 1; }
      }
    });

    // 3. Sắp xếp lại danh sách
    const sortedStandings = [];
    Object.keys(table).sort().forEach(group => {
      const teamsList = Object.values(table[group]).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; // Ưu tiên điểm
        if (b.gd !== a.gd) return b.gd - a.gd;     // Ưu tiên hiệu số
        if (b.gf !== a.gf) return b.gf - a.gf;     // Ưu tiên bàn thắng
        return a.name.localeCompare(b.name);       // Theo bảng chữ cái
      });
      sortedStandings.push({ group, teams: teamsList });
    });

    return sortedStandings;
  }, [currentMatches, currentTeams]);

  const stats = useMemo(() => {
    const income = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDonations = currentDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    return { balance: income - expense + totalDonations, totalIncome: income, totalExpense: expense, totalDonations: totalDonations };
  }, [currentTransactions, currentDonations]);

  const activeTournamentName = useMemo(() => tournaments.find(t => t.id === activeTournamentId)?.name || '...', [activeTournamentId, tournaments]);

  const openConfirm = (title, message, onConfirm, type = 'danger') => setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const handleShieldClick = () => {
    if (!isAdmin) { setShowLoginModal(true); setPasswordInput(''); }
    else {
      if (isAdminView) openConfirm("Chế độ người xem", "Bạn muốn chuyển sang chế độ người xem?", () => { setIsAdminView(false); closeConfirm(); }, 'primary');
      else openConfirm("Chế độ quản lý", "Bạn muốn quay lại chế độ quản lý?", () => { setIsAdminView(true); closeConfirm(); }, 'primary');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'hoangyenfc@2026') { setIsAdmin(true); setIsAdminView(true); setShowLoginModal(false); setPasswordInput(''); }
    else alert("Mật khẩu không chính xác!");
  };

  const goToDetail = (id) => { 
    setActiveTournamentId(id); setCurrentScreen('detail'); 
    setActiveMainTab('info'); setActiveFundTab('transactions'); setActiveInfoTab('matches'); 
  };
  const goHome = () => setCurrentScreen('home');

  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024; const MAX_HEIGHT = 1024;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); 
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = async (e, setter) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); 
        const file = items[i].getAsFile();
        const compressedBase64 = await processImageFile(file);
        setter(compressedBase64);
        break;
      }
    }
  };

  const handleFileUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressedBase64 = await processImageFile(file);
    setter(compressedBase64);
  };

  const resetFormData = () => {
    setFormData({
      type: 'income', amount: '', note: '', date: new Date().toISOString().split('T')[0], donorName: '', imageUrl: '',
      homeTeam: '', awayTeam: '', group: 'Bảng A', matchTime: '18:00', location: 'Nhà Thờ Thanh An', homeScore: '', awayScore: '', isCompleted: false,
      teamName: '', teamGroup: 'Bảng A'
    });
  };

  const openEditDataModal = (item, mType, specificType) => {
    setEditingData(item);
    setModalType(mType);
    setFormData({
      type: specificType,
      amount: item.amount ? formatNumberWithDots(item.amount) : '',
      note: item.note || '',
      date: item.date || new Date().toISOString().split('T')[0],
      donorName: item.donorName || '',
      imageUrl: item.imageUrl || '',
      homeTeam: item.homeTeam || item.opponent || '', 
      awayTeam: item.awayTeam || '',
      group: item.group || 'Bảng A',
      matchTime: item.time || '18:00',
      location: item.location || 'Nhà Thờ Thanh An',
      homeScore: item.homeScore !== null && item.homeScore !== undefined ? item.homeScore : '',
      awayScore: item.awayScore !== null && item.awayScore !== undefined ? item.awayScore : '',
      isCompleted: item.isCompleted || false,
      teamName: item.name || '',
      teamGroup: item.group || 'Bảng A'
    });
    setShowAddModal(true);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    if (!isAdmin || !isAdminView) return;
    try {
      let collectionName = ''; 
      const timestamp = new Date().toISOString();
      let dataToSave = {};

      if (modalType === 'fund') {
        if (formData.type === 'income' || formData.type === 'expense') {
          collectionName = 'transactions';
          dataToSave = { type: formData.type, amount: parseFormattedNumber(formData.amount), note: formData.note, date: formData.date, tournamentId: activeTournamentId, updatedAt: timestamp };
        } else if (formData.type === 'donation') {
          collectionName = 'donations';
          dataToSave = { donorName: formData.donorName, amount: parseFormattedNumber(formData.amount), note: formData.note, date: formData.date, tournamentId: activeTournamentId, updatedAt: timestamp };
        }
      } else if (modalType === 'gallery') {
        collectionName = 'gallery';
        if (!formData.imageUrl) { alert("Vui lòng đính kèm hình ảnh!"); return; }
        dataToSave = { imageUrl: formData.imageUrl, note: formData.note, tournamentId: activeTournamentId, updatedAt: timestamp };
      } else if (modalType === 'match') {
        collectionName = 'matches';
        dataToSave = { 
          homeTeam: formData.homeTeam, awayTeam: formData.awayTeam, group: formData.group, date: formData.date, time: formData.matchTime, location: formData.location, 
          homeScore: formData.isCompleted ? Number(formData.homeScore) : null, 
          awayScore: formData.isCompleted ? Number(formData.awayScore) : null,
          isCompleted: formData.isCompleted, tournamentId: activeTournamentId, updatedAt: timestamp 
        };
      } else if (modalType === 'team') {
        collectionName = 'teams';
        dataToSave = {
          name: formData.teamName.trim(),
          group: formData.teamGroup.trim().toUpperCase(),
          tournamentId: activeTournamentId,
          updatedAt: timestamp
        };
      }

      if (editingData && editingData.id) { 
        await updateDoc(doc(db, collectionName, editingData.id), dataToSave); 
      } else { 
        await addDoc(collection(db, collectionName), { ...dataToSave, createdAt: timestamp }); 
      }
      
      setShowAddModal(false); setEditingData(null); resetFormData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteData = async (id, type) => {
    if (!isAdmin || !isAdminView) return;
    openConfirm("Xác nhận xóa", "Hành động này không thể hoàn tác.", async () => {
      try {
        const collectionName = type === 'transaction' ? 'transactions' : type === 'donation' ? 'donations' : type === 'gallery' ? 'gallery' : type === 'team' ? 'teams' : 'matches';
        await deleteDoc(doc(db, collectionName, id));
        closeConfirm();
      } catch (err) { console.error(err); }
    });
  };

  const openTournamentModal = (tournament = null) => {
    if (tournament) { setEditingTournament(tournament); setNewTournamentName(tournament.name); setNewTournamentImage(tournament.imageUrl || ''); } 
    else { setEditingTournament(null); setNewTournamentName(''); setNewTournamentImage(''); }
    setShowTournamentModal(true);
  };

  const handleSaveTournament = async (e) => {
    e.preventDefault();
    if (!isAdmin || !isAdminView || !newTournamentName.trim()) return;
    try {
      const timestamp = new Date().toISOString();
      if (editingTournament) {
        await updateDoc(doc(db, 'tournaments', editingTournament.id), { name: newTournamentName.trim(), imageUrl: newTournamentImage.trim(), updatedAt: timestamp });
      } else {
        await addDoc(collection(db, 'tournaments'), { name: newTournamentName.trim(), imageUrl: newTournamentImage.trim(), createdAt: timestamp });
      }
      setShowTournamentModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDeleteTournament = async () => {
    if (!editingTournament || !isAdmin || !isAdminView) return;
    openConfirm("Xóa giải đấu", `Bạn muốn xóa "${editingTournament.name}"?`, async () => {
      try { await deleteDoc(doc(db, 'tournaments', editingTournament.id)); setShowTournamentModal(false); closeConfirm(); } 
      catch (err) { console.error(err); }
    });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const getMatchResultColor = (home, away) => {
    if (home > away) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (home < away) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <IPhone14Frame>
      <div className="flex flex-col h-full select-none overflow-hidden relative">
        
        {/* Header */}
        <header className="pt-14 pb-4 px-6 flex justify-between items-center bg-white shrink-0 z-10 relative border-b border-slate-100">
          {currentScreen === 'home' ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-[1rem] flex items-center justify-center text-white shadow-sm">
                <Church size={22} strokeWidth={2.5} />
              </div>
              <div><h1 className="text-[17px] font-black tracking-tight leading-tight uppercase">Hoàng Yên FC</h1><p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">HỆ THỐNG QUẢN LÝ</p></div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={goHome} className="w-10 h-10 bg-slate-50 rounded-[1rem] flex items-center justify-center text-slate-700 shadow-sm border border-slate-200 active:scale-95 transition-transform">
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
              </button>
              <div><h1 className="text-[17px] font-black tracking-tight leading-tight truncate max-w-[150px] uppercase">{activeTournamentName}</h1><p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">CHI TIẾT GIẢI ĐẤU</p></div>
            </div>
          )}
          <button onClick={handleShieldClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isAdmin ? (isAdminView ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600') : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
            {isAdmin ? <ShieldCheck size={20} /> : <Lock size={18} />}
          </button>
        </header>

        {/* NỘI DUNG MÀN HÌNH CHÍNH (Danh sách giải đấu) */}
        {currentScreen === 'home' && (
          <main className="flex-1 overflow-y-auto pb-32 bg-[#f4f6f8] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 pt-5 pb-6">
              <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">Danh sách Giải đấu</h2>
              <div className="flex flex-col gap-5">
                {tournaments.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-[1.75rem] border border-slate-200 border-dashed">
                    <p className="text-sm font-medium">Chưa có giải đấu nào.</p>
                    {isAdmin && isAdminView && <p className="text-xs mt-1">Bấm dấu + ở góc dưới để thêm mới.</p>}
                  </div>
                ) : (
                  tournaments.map(t => (
                    <div key={t.id} onClick={() => goToDetail(t.id)} className="relative h-[330px] rounded-[2rem] overflow-hidden shadow-lg cursor-pointer group active:scale-[0.98] transition-transform bg-slate-200 border border-black/5">
                      <img src={t.imageUrl || defaultTournamentImg} alt={t.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/5"></div>
                      {isAdmin && isAdminView && (
                        <button onClick={(e) => { e.stopPropagation(); openTournamentModal(t); }} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white hover:bg-white/30 transition-colors z-20">
                          <Edit2 size={18} strokeWidth={2.5} />
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <div className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg inline-block mb-2 uppercase tracking-wider">MÙA GIẢI MỚI</div>
                        <h3 className="text-white font-black text-[22px] leading-tight line-clamp-2 shadow-black/50 drop-shadow-md">{t.name}</h3>
                        <p className="text-white/70 text-xs font-bold tracking-wide mt-2 flex items-center gap-1.5 uppercase"><ArrowUpRight size={14} strokeWidth={3}/> Xem chi tiết</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Nút FAB Home */}
            {isAdmin && isAdminView && (
              <button onClick={() => { setEditingData(null); openTournamentModal(); }} className="fixed bottom-10 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-30 active:scale-95 transition-transform border-4 border-white">
                <Plus size={28} strokeWidth={3} />
              </button>
            )}
          </main>
        )}

        {/* NỘI DUNG MÀN HÌNH CHI TIẾT GIẢI ĐẤU (Có 3 Tab) */}
        {currentScreen === 'detail' && (
          <main className="flex-1 overflow-y-auto pb-[100px] bg-[#f4f6f8] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* --- TAB 1: THÔNG TIN (Lịch đấu & Bảng xếp hạng) --- */}
            {activeMainTab === 'info' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5">
                
                {/* Sub-tabs cho Thông tin */}
                <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <button onClick={() => setActiveInfoTab('matches')} className={`flex-1 min-w-[120px] py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${activeInfoTab === 'matches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Lịch Đấu</button>
                  <button onClick={() => setActiveInfoTab('standings')} className={`flex-1 min-w-[120px] py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${activeInfoTab === 'standings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Bảng Xếp Hạng</button>
                </div>

                <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">
                  {activeInfoTab === 'matches' ? 'Lịch đấu & Kết quả' : 'Cập nhật điểm số'}
                </h2>

                {activeInfoTab === 'matches' ? (
                  currentMatches.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200">
                      <p className="text-sm font-medium">Chưa có trận đấu nào.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 pb-8">
                      {currentMatches.map(match => {
                        const hTeam = match.homeTeam || 'Đội 1';
                        const aTeam = match.awayTeam || match.opponent || 'Đội 2';
                        return (
                          <div key={match.id} className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                                  {match.group || 'Bảng Chung'}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                  <CalendarDays size={13}/> {match.date} <span className="text-slate-200 mx-0.5">•</span> <Clock size={13}/> {match.time}
                                </div>
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${match.isCompleted ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse'}`}>
                                {match.isCompleted ? 'Đã kết thúc' : 'Sắp diễn ra'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 mb-5">
                              {/* Đội Nhà */}
                              <div className="flex flex-col items-center gap-2.5 flex-1 w-0">
                                <div className="w-14 h-14 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg text-white font-black text-xl shrink-0">
                                  {hTeam.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-[13px] text-center line-clamp-2 px-1 leading-snug text-slate-800">{hTeam}</span>
                              </div>

                              {/* Tỉ số / VS */}
                              <div className="flex-1 flex justify-center shrink-0 px-2">
                                {match.isCompleted ? (
                                  <div className={`px-5 py-2.5 rounded-2xl border-[2.5px] flex items-center gap-3 ${getMatchResultColor(match.homeScore, match.awayScore)}`}>
                                    <span className="text-3xl font-black">{match.homeScore}</span>
                                    <span className="text-lg opacity-40 font-black">-</span>
                                    <span className="text-3xl font-black">{match.awayScore}</span>
                                  </div>
                                ) : (
                                  <div className="bg-slate-50 text-slate-400 px-4 py-2 rounded-2xl border-2 border-slate-100 font-black text-xl tracking-wider shadow-inner">
                                    {match.time}
                                  </div>
                                )}
                              </div>

                              {/* Đội Khách */}
                              <div className="flex flex-col items-center gap-2.5 flex-1 w-0">
                                <div className="w-14 h-14 bg-slate-50 border-2 border-slate-200 rounded-[1.2rem] flex items-center justify-center shadow-sm text-slate-400 font-black text-xl shrink-0">
                                  {aTeam.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-[13px] text-center line-clamp-2 px-1 leading-snug text-slate-800">{aTeam}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 truncate pr-4 uppercase tracking-wide">
                                <MapPin size={13} className="text-rose-500 shrink-0"/> <span className="truncate">{match.location || 'Nhà Thờ Thanh An'}</span>
                              </div>
                              {isAdmin && isAdminView && (
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => openEditDataModal(match, 'match', 'match')} className="p-1.5 text-slate-400 hover:text-emerald-500 bg-slate-50 rounded-lg"><Edit2 size={15} /></button>
                                  <button onClick={() => handleDeleteData(match.id, 'match')} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-lg"><Trash2 size={15} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                ) : (
                  // BẢNG XẾP HẠNG (Tự động gộp đội từ form edit)
                  <div className="flex flex-col gap-6 pb-8">
                    {standings.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200">
                        <p className="text-sm font-medium">Chưa có dữ liệu xếp hạng.</p>
                      </div>
                    ) : (
                      standings.map((groupData, idx) => (
                        <div key={idx} className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                          <div className="bg-slate-900 text-white px-5 py-3">
                            <h3 className="font-black text-[13px] uppercase tracking-wider">{groupData.group}</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[320px]">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                                  <th className="px-3 py-3 font-black">Đội Bóng</th>
                                  <th className="px-1 py-3 font-black text-center min-w-[30px]" title="Số trận">Tr</th>
                                  <th className="px-1 py-3 font-black text-center min-w-[45px]" title="Thắng - Hòa - Thua">T-H-B</th>
                                  <th className="px-1 py-3 font-black text-center min-w-[35px]" title="Hiệu số">HS</th>
                                  <th className="px-3 py-3 font-black text-center text-emerald-600 min-w-[40px]" title="Điểm số">Đ</th>
                                </tr>
                              </thead>
                              <tbody className="text-[13px]">
                                {groupData.teams.map((team, tIdx) => (
                                  <tr key={team.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-3.5 flex flex-col justify-center min-h-[55px]">
                                      <div className="flex items-center gap-2">
                                        <span className={`shrink-0 w-5 text-center text-[11px] font-black ${tIdx < 2 ? 'text-slate-900 bg-slate-100 rounded-md py-0.5' : 'text-slate-400'}`}>{tIdx + 1}</span>
                                        <span className="w-[110px] md:w-[150px] break-words line-clamp-2 text-slate-800 font-bold leading-tight">{team.name}</span>
                                      </div>
                                      {isAdmin && isAdminView && (
                                        <div className="flex items-center gap-1.5 mt-1.5 ml-7">
                                          <button onClick={() => openEditDataModal(team, 'team', 'team')} className="p-1 text-slate-400 hover:text-emerald-500 bg-slate-50 rounded-md border border-slate-100"><Edit2 size={11} /></button>
                                          {team.id && <button onClick={() => handleDeleteData(team.id, 'team')} className="p-1 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-md border border-slate-100"><Trash2 size={11} /></button>}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-1 py-3.5 font-semibold text-slate-500 text-center align-middle">{team.p}</td>
                                    <td className="px-1 py-3.5 font-semibold text-slate-500 text-center align-middle">{team.w}-{team.d}-{team.l}</td>
                                    <td className="px-1 py-3.5 font-bold text-slate-500 text-center align-middle">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                    <td className="px-3 py-3.5 font-black text-emerald-600 text-center text-[15px] align-middle">{team.pts}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB 2: THU CHI --- */}
            {activeMainTab === 'fund' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden mb-6">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 mb-2"><Wallet size={16} /><p className="text-[11px] font-bold uppercase tracking-widest">Số Dư Quỹ</p></div>
                    <h2 className="text-[32px] font-black tracking-tight mb-6">{formatCurrency(stats.balance)}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/5"><div className="flex items-center gap-1.5 text-emerald-400 mb-1"><TrendingUp size={14} strokeWidth={3} /><p className="text-[10px] font-black uppercase tracking-wider">Tổng Thu</p></div><p className="font-bold text-[15px]">+{formatCurrency(stats.totalIncome + stats.totalDonations)}</p></div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/5"><div className="flex items-center gap-1.5 text-rose-400 mb-1"><TrendingDown size={14} strokeWidth={3} /><p className="text-[10px] font-black uppercase tracking-wider">Đã Chi</p></div><p className="font-bold text-[15px]">-{formatCurrency(stats.totalExpense)}</p></div>
                    </div>
                  </div>
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-5">
                  <button onClick={() => setActiveFundTab('transactions')} className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${activeFundTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Giao Dịch</button>
                  <button onClick={() => setActiveFundTab('donations')} className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${activeFundTab === 'donations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Ủng Hộ</button>
                </div>

                <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">
                  {activeFundTab === 'transactions' ? 'Lịch sử giao dịch' : 'Danh sách ủng hộ'}
                </h2>
                
                <div className="space-y-3 pb-8">
                  {(activeFundTab === 'transactions' ? currentTransactions : currentDonations).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200"><p className="text-sm font-medium">Chưa có dữ liệu.</p></div>
                  ) : (
                    (activeFundTab === 'transactions' ? currentTransactions : currentDonations).map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100/50">
                        <div className={`shrink-0 w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-sm ${activeFundTab === 'donations' ? 'bg-amber-50 text-amber-600' : item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {activeFundTab === 'donations' ? <Heart size={24} strokeWidth={2.5} /> : item.type === 'income' ? <ArrowUpRight size={24} strokeWidth={2.5} /> : <ArrowDownLeft size={24} strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] truncate text-slate-900">{activeFundTab === 'donations' ? item.donorName : item.note}</p>
                          {activeFundTab === 'donations' && item.note && <p className="text-[11px] text-slate-500 mt-0.5 truncate pr-2 font-medium">"{item.note}"</p>}
                          <p className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-widest">{item.date}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className={`font-black text-[15px] tracking-tight ${activeFundTab === 'donations' ? 'text-amber-600' : item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {activeFundTab === 'donations' || item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </p>
                          {isAdmin && isAdminView && (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openEditDataModal(item, 'fund', activeFundTab === 'donations' ? 'donation' : item.type)} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 rounded-lg"><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteData(item.id, activeFundTab === 'donations' ? 'donation' : 'transaction')} className="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 rounded-lg"><Trash2 size={13} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* --- TAB 3: KỈ NIỆM --- */}
            {activeMainTab === 'gallery' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5 pb-8">
                <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">Thư viện hình ảnh</h2>
                {currentPhotos.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200"><p className="text-sm font-medium">Chưa có hình ảnh nào.</p></div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {currentPhotos.map(photo => (
                      <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="relative h-[300px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] border border-slate-100 bg-slate-200 group cursor-pointer active:scale-[0.98] transition-transform">
                        <img src={photo.imageUrl} alt={photo.note || "Ảnh kỉ niệm"} className="w-full h-full object-cover" />
                        {photo.note && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-5 pt-10">
                            <p className="text-white text-[13px] font-medium line-clamp-2 drop-shadow-sm">{photo.note}</p>
                          </div>
                        )}
                        {isAdmin && isAdminView && (
                          <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditDataModal(photo, 'gallery', 'gallery'); }} className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/40 transition-colors"><Edit2 size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteData(photo.id, 'gallery'); }} className="bg-rose-500/80 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-rose-600 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Nút FAB Detail */}
            {isAdmin && isAdminView && (
              <button onClick={() => { 
                resetFormData(); 
                setEditingData(null); 
                
                let targetModalType = activeMainTab;
                if (activeMainTab === 'info') {
                  targetModalType = activeInfoTab === 'standings' ? 'team' : 'match';
                }
                setModalType(targetModalType);

                if (targetModalType === 'match') setFormData(prev => ({...prev, type: 'match'}));
                else if (targetModalType === 'team') setFormData(prev => ({...prev, type: 'team'}));
                else if (targetModalType === 'gallery') setFormData(prev => ({...prev, type: 'gallery'}));
                else setFormData(prev => ({...prev, type: activeFundTab === 'transactions' ? 'income' : 'donation'}));
                
                setShowAddModal(true);
              }} className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center z-30 active:scale-95 transition-transform border-4 border-white">
                <Plus size={28} strokeWidth={3} />
              </button>
            )}
          </main>
        )}

        {/* --- BOTTOM NAVIGATION BAR --- */}
        {currentScreen === 'detail' && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-6 pt-3 z-40 rounded-b-[2.5rem]">
            <button onClick={() => setActiveMainTab('info')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'info' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'info' ? 'bg-slate-100' : ''}`}><Swords size={22} strokeWidth={activeMainTab === 'info' ? 2.5 : 2} /></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'info' ? 'opacity-100' : 'opacity-0'}`}>Thông tin</span>
            </button>
            <button onClick={() => setActiveMainTab('fund')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'fund' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'fund' ? 'bg-slate-100' : ''}`}><Wallet size={22} strokeWidth={activeMainTab === 'fund' ? 2.5 : 2} /></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'fund' ? 'opacity-100' : 'opacity-0'}`}>Thu Chi</span>
            </button>
            <button onClick={() => setActiveMainTab('gallery')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'gallery' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'gallery' ? 'bg-slate-100' : ''}`}><ImageIcon size={22} strokeWidth={activeMainTab === 'gallery' ? 2.5 : 2} /></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'gallery' ? 'opacity-100' : 'opacity-0'}`}>Kỉ Niệm</span>
            </button>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* Modal Thêm/Sửa Đa Năng */}
        {showAddModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-[2rem] p-6 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-[17px] font-black tracking-tight text-slate-900 uppercase">
                  {editingData && editingData.id ? 'Cập Nhật' : 'Thêm Mới'} {modalType === 'fund' ? (formData.type === 'donation' ? 'Ủng Hộ' : 'Giao Dịch') : modalType === 'match' ? 'Trận Đấu' : modalType === 'team' ? 'Đội Bóng' : 'Hình Ảnh'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingData(null); resetFormData(); }} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveData} className="space-y-4">
                
                {/* 1. Form THU CHI */}
                {modalType === 'fund' && (
                  <>
                    <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-4 relative">
                      {editingData && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'income'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Thu</button>
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'expense'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Chi</button>
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'donation'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'donation' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Ủng Hộ</button>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">{formData.type === 'donation' ? 'Tên Người Ủng Hộ' : 'Nội Dung'}</label>
                      <input type="text" required placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.type === 'donation' ? formData.donorName : formData.note} onChange={(e) => formData.type === 'donation' ? setFormData({...formData, donorName: e.target.value}) : setFormData({...formData, note: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Số Tiền (VNĐ)</label>
                        <input type="text" required placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none text-emerald-600" value={formData.amount} onChange={(e) => setFormData({...formData, amount: formatNumberWithDots(e.target.value)})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Ngày</label>
                        <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                      </div>
                    </div>
                    {formData.type === 'donation' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Ghi chú thêm (Tùy chọn)</label>
                        <input type="text" placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                      </div>
                    )}
                  </>
                )}

                {/* 2. Form THƯ VIỆN ẢNH */}
                {modalType === 'gallery' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 flex items-center gap-1 uppercase tracking-wider"><ImageIcon size={13} /> Link Hoặc Dán Ảnh</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://... hoặc Ctrl+V" className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-medium focus:border-slate-900 focus:outline-none" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} onPaste={(e) => handlePasteImage(e, (val) => setFormData({...formData, imageUrl: val}))} />
                        <button type="button" onClick={() => galleryFileInputRef.current?.click()} className="shrink-0 bg-slate-100 text-slate-600 px-4 rounded-[1.2rem] border border-slate-200 flex items-center justify-center active:bg-slate-200"><Upload size={18} strokeWidth={2.5} /></button>
                        <input type="file" accept="image/*" ref={galleryFileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, (val) => setFormData({...formData, imageUrl: val}))} />
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-3 h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Chú thích ảnh (Tùy chọn)</label>
                      <input type="text" placeholder="Khoảnh khắc nâng cúp..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                    </div>
                  </>
                )}

                {/* 3. Form TRẬN ĐẤU */}
                {modalType === 'match' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Bảng đấu / Vòng đấu</label>
                      <input type="text" required placeholder="VD: Bảng A, Bán kết..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none uppercase" value={formData.group} onChange={(e) => setFormData({...formData, group: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Đội 1 (Chủ nhà)</label>
                        <input type="text" required placeholder="Tên đội..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none" value={formData.homeTeam} onChange={(e) => setFormData({...formData, homeTeam: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Đội 2 (Khách)</label>
                        <input type="text" required placeholder="Tên đội..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none" value={formData.awayTeam} onChange={(e) => setFormData({...formData, awayTeam: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Ngày đá</label>
                        <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Giờ đá</label>
                        <input type="time" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.matchTime} onChange={(e) => setFormData({...formData, matchTime: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Sân thi đấu</label>
                      <input type="text" required placeholder="Tên sân..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" checked={formData.isCompleted} onChange={(e) => setFormData({...formData, isCompleted: e.target.checked})} />
                        <span className="font-bold text-slate-700">Trận đấu đã kết thúc (Nhập tỉ số)</span>
                      </label>

                      {formData.isCompleted && (
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex-1 text-center">
                            <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase truncate">{formData.homeTeam || 'ĐỘI 1'}</label>
                            <input type="number" required={formData.isCompleted} placeholder="0" className="w-full bg-white border border-slate-200 rounded-[1.2rem] p-3 text-3xl text-center font-black focus:border-slate-900 focus:outline-none" value={formData.homeScore} onChange={(e) => setFormData({...formData, homeScore: e.target.value})} />
                          </div>
                          <div className="font-black text-slate-300 text-2xl pt-4">-</div>
                          <div className="flex-1 text-center">
                            <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase truncate">{formData.awayTeam || 'ĐỘI 2'}</label>
                            <input type="number" required={formData.isCompleted} placeholder="0" className="w-full bg-white border border-slate-200 rounded-[1.2rem] p-3 text-3xl text-center font-black focus:border-slate-900 focus:outline-none" value={formData.awayScore} onChange={(e) => setFormData({...formData, awayScore: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 4. Form ĐỘI BÓNG (Dùng để định danh Bảng cho đội) */}
                {modalType === 'team' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Tên Đội Bóng</label>
                      <input type="text" required placeholder="VD: Hoàng Yên FC..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none" value={formData.teamName} onChange={(e) => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Thuộc Bảng Đấu</label>
                      <input type="text" required placeholder="VD: Bảng A, Bảng B..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none uppercase" value={formData.teamGroup} onChange={(e) => setFormData({...formData, teamGroup: e.target.value})} />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 italic px-1 mt-2 leading-relaxed">
                      * Mẹo: Việc chỉnh sửa bảng đấu tại đây sẽ tự động mang toàn bộ điểm số của đội chuyển sang bảng mới.
                    </p>
                  </>
                )}

                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-transform mt-6 tracking-widest uppercase">
                  Lưu Thông Tin
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Thêm/Sửa Giải Đấu (Admin Home) */}
        {showTournamentModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-[2rem] p-6 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-[17px] font-black tracking-tight text-slate-900 uppercase">{editingTournament ? 'Cập Nhật Giải' : 'Tạo Giải Mới'}</h2>
                <button onClick={() => setShowTournamentModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 active:bg-slate-200 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveTournament} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Tên Giải Đấu</label>
                  <input type="text" required placeholder="VD: Giải mùa hè 2026..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={newTournamentName} onChange={(e) => setNewTournamentName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 flex items-center gap-1 uppercase tracking-wider"><ImageIcon size={13} /> Ảnh bìa giải đấu</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="https://... hoặc Ctrl+V để dán" className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-medium focus:border-slate-900 focus:outline-none" value={newTournamentImage} onChange={(e) => setNewTournamentImage(e.target.value)} onPaste={(e) => handlePasteImage(e, setNewTournamentImage)} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 bg-slate-100 text-slate-600 px-4 rounded-[1.2rem] border border-slate-200 flex items-center justify-center active:bg-slate-200"><Upload size={18} strokeWidth={2.5} /></button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, setNewTournamentImage)} />
                  </div>
                  {newTournamentImage && <div className="mt-3 h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"><img src={newTournamentImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = defaultTournamentImg; }} /></div>}
                </div>
                <div className="pt-4 flex gap-3">
                  {editingTournament && <button type="button" onClick={handleDeleteTournament} className="py-4 px-5 bg-rose-50 text-rose-600 rounded-2xl font-bold shadow-sm active:scale-95 transition-transform"><Trash2 size={20} /></button>}
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-widest shadow-lg active:scale-[0.98] transition-transform uppercase">{editingTournament ? 'Lưu Thay Đổi' : 'Tạo Giải Đấu'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Đăng Nhập Admin */}
        {showLoginModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl"><Lock size={24} strokeWidth={2.5} /></div>
                  <h2 className="text-[17px] font-black tracking-tight uppercase">Bảo Mật</h2>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Mật khẩu Quản trị</label>
                  <input type="password" required autoFocus placeholder="Nhập mật khẩu..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[15px] font-black focus:border-slate-900 focus:outline-none tracking-widest text-center" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg active:scale-[0.98] transition-transform tracking-widest uppercase">Đăng Nhập</button>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirm Modal */}
        {confirmModal.isOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center border-4 border-white">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <AlertCircle size={36} strokeWidth={3} />
              </div>
              <h2 className="text-[17px] font-black text-slate-900 mb-3 uppercase tracking-wide">{confirmModal.title}</h2>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8 px-2">{confirmModal.message}</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmModal.onConfirm} className={`w-full py-4 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-transform tracking-widest uppercase ${confirmModal.type === 'danger' ? 'bg-rose-500' : 'bg-slate-900'}`}>Xác Nhận</button>
                <button onClick={closeConfirm} className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 bg-slate-50 active:scale-95 transition-transform uppercase tracking-wider text-[13px]">Hủy Bỏ</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Xem Ảnh Full màn hình */}
        {selectedPhoto && (
          <div className="absolute inset-0 bg-black/95 z-[110] flex items-center justify-center animate-in fade-in duration-200">
            <button onClick={() => setSelectedPhoto(null)} className="absolute top-10 right-6 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 active:scale-95 transition-all z-50">
              <X size={24} strokeWidth={2.5} />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <img src={selectedPhoto.imageUrl} alt={selectedPhoto.note || "Xem ảnh"} className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
              {selectedPhoto.note && <p className="text-white/90 text-[15px] mt-6 text-center px-4 font-bold leading-relaxed">{selectedPhoto.note}</p>}
            </div>
          </div>
        )}

      </div>
    </IPhone14Frame>
  );
}