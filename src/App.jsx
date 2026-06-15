import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where
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
  Receipt,
  PieChart,
  Download,
  Eye,
  FileText,
  Tag,
  Trophy,
  List,
  Crown,
  Medal,
  BarChart3,
  Users
} from 'lucide-react';

// --- Firebase Configuration (Cấu hình thật của Hoàng Yên FC) ---
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

const getLocalDateString = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

// Email "Chìa khóa vạn năng" (Không bao giờ bị xóa, dùng để phòng hờ)
const MASTER_ADMIN_EMAIL = 'phucvan20241108@gmail.com';

const hashString = async (str) => {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const EventAuthModal = ({ isOpen, onClose, event, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (isOpen) { setPassword(''); setError(''); } }, [isOpen]);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputHash = await hashString(password);
    if (inputHash === event?.passwordHash || password === event?.password) {
      onSuccess(event.id);
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-700 shadow-inner"><Lock size={28} strokeWidth={2.5} /></div>
        <h2 className="text-[17px] font-black tracking-tight text-slate-900 text-center uppercase mb-1">Sự Kiện Riêng Tư</h2>
        <p className="text-center text-[12px] font-bold text-slate-500 mb-6 truncate px-2">{event?.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input type="password" required autoFocus placeholder="Nhập mật khẩu..." className={`w-full bg-slate-50 border ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'} rounded-[1.2rem] p-4 text-[15px] font-black focus:outline-none tracking-widest text-center transition-colors`} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
            {error && <p className="text-rose-500 text-[11px] font-bold text-center mt-1">{error}</p>}
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-transform tracking-widest uppercase">Mở Khóa</button>
            <button type="button" onClick={onClose} className="w-full py-3.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl font-bold active:scale-95 transition-colors uppercase tracking-wider text-[12px]">Hủy Bỏ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminManagerModal = ({ isOpen, onClose, adminEmails, onAdd, onDelete }) => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  useEffect(() => { if (isOpen) setNewAdminEmail(''); }, [isOpen]);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newAdminEmail);
    setNewAdminEmail('');
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-xl shadow-inner shrink-0"><Users size={20} strokeWidth={2.5} /></div>
            <div>
              <h2 className="text-[17px] font-black tracking-tight text-slate-900 uppercase">Quản Lý Admin</h2>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Thêm/bớt quyền quản trị</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} strokeWidth={2.5} /></button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[13px] font-bold text-slate-700 truncate mr-2">{MASTER_ADMIN_EMAIL}</span>
            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md shrink-0">Mặc định</span>
          </div>
          {adminEmails.filter(email => email !== MASTER_ADMIN_EMAIL).map(email => (
            <div key={email} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[13px] font-bold text-slate-700 truncate mr-2">{email}</span>
              <button onClick={() => onDelete(email)} className="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 rounded-lg shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="shrink-0 pt-4 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="email" required placeholder="Nhập Gmail mới..." className="flex-1 w-0 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] font-bold focus:border-indigo-500 focus:outline-none" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
            <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl font-black text-[13px] hover:bg-indigo-700 active:scale-95 transition-all shadow-md shrink-0">Thêm</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true);
  
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [activeMainTab, setActiveMainTab] = useState('fund'); 
  const [activeFundTab, setActiveFundTab] = useState('transactions');
  
  const [adminEmails, setAdminEmails] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false); 
  const [modalType, setModalType] = useState('fund'); 
  const [showTournamentModal, setShowTournamentModal] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [editingTournament, setEditingTournament] = useState(null); 
  const [editingData, setEditingData] = useState(null); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentImage, setNewTournamentImage] = useState('');
  const [newTournamentTarget, setNewTournamentTarget] = useState('');
  const [newTournamentCategory, setNewTournamentCategory] = useState('Quyên góp');
  const [newTournamentPassword, setNewTournamentPassword] = useState('');
  const [isPrivateEvent, setIsPrivateEvent] = useState(false);
  const [newTournamentTicketPrice, setNewTournamentTicketPrice] = useState('');
  const [newTournamentTicketTarget, setNewTournamentTicketTarget] = useState('');
  const [unlockedEvents, setUnlockedEvents] = useState({});
  const [selectedTeamDetailName, setSelectedTeamDetailName] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [eventAuthModal, setEventAuthModal] = useState({ isOpen: false, event: null, password: '', error: '' });
  const [showReportPreview, setShowReportPreview] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    note: '',
    date: getLocalDateString(),
    donorName: '',
    imageUrl: '',
    category: 'Tài trợ',
    ticketQuantity: '',
    ticketPrice: '',
    teamName: '',
    teamMembers: '',
    teamTicketQuota: ''
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

  const activeTournament = useMemo(() => tournaments.find(t => t.id === activeTournamentId) || null, [activeTournamentId, tournaments]);
  const activeTournamentName = activeTournament?.name || '...';

  // Tự động điều hướng nếu có eventId trong URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    if (eventId) {
      setActiveTournamentId(eventId);
      setCurrentScreen('detail');
    }
  }, []);

  // Chặn người dùng nếu họ truy cập bằng link trực tiếp vào sự kiện có mật khẩu
  useEffect(() => {
    if (currentScreen === 'detail' && activeTournament && !isAdmin && (activeTournament.passwordHash || activeTournament.password) && !unlockedEvents[activeTournament.id]) {
      setEventAuthModal({ isOpen: true, event: activeTournament, password: '', error: '' });
      setCurrentScreen('home'); 
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [currentScreen, activeTournament, isAdmin, unlockedEvents]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && !user.isAnonymous && user.email) {
      setIsAdmin(user.email === MASTER_ADMIN_EMAIL || adminEmails.includes(user.email));
    } else {
      setIsAdmin(false);
    }
  }, [user, adminEmails]);

  // Tự động đăng xuất sau 30 phút không hoạt động
  const logoutTimerRef = useRef(null);
  useEffect(() => {
    const autoLogoutTime = 30 * 60 * 1000; // 30 phút (tính bằng mili-giây)

    const logoutAdmin = async () => {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        await signOut(auth);
        setIsAdminView(true);
        alert("Hệ thống đã tự động đăng xuất để bảo mật do không có thao tác nào trong 30 phút.");
      }
    };

    const resetTimer = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (isAdmin) {
        logoutTimerRef.current = setTimeout(logoutAdmin, autoLogoutTime);
      }
    };

    const handleActivity = () => resetTimer();
    // Lắng nghe các thao tác cơ bản của người dùng
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    if (isAdmin) {
      resetTimer();
      events.forEach(e => window.addEventListener(e, handleActivity));
    }

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!user) return;
    const unsubAdmins = onSnapshot(collection(db, 'admins'), (snap) => setAdminEmails(snap.docs.map(doc => doc.id)));
    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snap) => setTournaments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))));
    return () => { unsubAdmins(); unsubTournaments(); };
  }, [user]);

  // CHỈ tải dữ liệu chi tiết khi người dùng truy cập vào một Sự kiện cụ thể
  useEffect(() => {
    if (!user || !activeTournamentId) {
      setTransactions([]); setDonations([]); setPhotos([]); setTeams([]);
      return;
    }
    
    const unsubTrans = onSnapshot(query(collection(db, 'transactions'), where('tournamentId', '==', activeTournamentId)), (snap) => setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubDonations = onSnapshot(query(collection(db, 'donations'), where('tournamentId', '==', activeTournamentId)), (snap) => setDonations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubPhotos = onSnapshot(query(collection(db, 'gallery'), where('tournamentId', '==', activeTournamentId)), (snap) => setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort(sortNewestFirst)));
    const unsubTeams = onSnapshot(query(collection(db, 'teams'), where('tournamentId', '==', activeTournamentId)), (snap) => setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => { unsubTrans(); unsubDonations(); unsubPhotos(); unsubTeams(); };
  }, [user, activeTournamentId]);

  const currentTransactions = useMemo(() => transactions, [transactions]);
  const currentDonations = useMemo(() => donations, [donations]);
  const currentTeams = useMemo(() => teams, [teams]);
  const currentPhotos = useMemo(() => photos, [photos]);

  const stats = useMemo(() => {
    const income = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDonations = currentDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    let totalTicketsSold = 0;
    const ticketsByDateMap = {};
    
    const expensesByCategory = {};
    currentTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Khác';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(t.amount);
    });
    currentTransactions.filter(t => t.type === 'income').forEach(t => {
      if (t.category === 'Bán vé') {
        const qty = Number(t.ticketQuantity || 0);
        totalTicketsSold += qty;
        const d = t.date || 'Không rõ';
        ticketsByDateMap[d] = (ticketsByDateMap[d] || 0) + qty;
      }
    });

    const ticketsByDate = Object.entries(ticketsByDateMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));

    return { balance: income - expense + totalDonations, totalIncome: income, totalExpense: expense, totalDonations: totalDonations, expensesByCategory, totalTicketsSold, ticketsByDate };
  }, [currentTransactions, currentDonations]);

  const reportData = useMemo(() => {
    const currentAll = [
      ...currentTransactions.map(t => ({
        id: t.id,
        date: t.date || '',
        type: t.type === 'income' ? 'Thu Quỹ' : 'Chi Quỹ',
        category: t.category || 'Khác',
        note: t.note + (t.ticketQuantity ? ` (${t.ticketQuantity} vé${t.ticketPrice ? ` x ${formatNumberWithDots(t.ticketPrice)}đ` : ''})` : '') + (t.teamName ? ` - Đội: ${t.teamName}` : ''),
        amount: t.type === 'expense' ? -Number(t.amount) : Number(t.amount)
      })),
      ...currentDonations.map(d => ({
        id: d.id,
        date: d.date || '',
        type: 'Ủng Hộ',
        category: 'Dâng cúng',
        note: d.donorName + (d.note ? ` - ${d.note}` : ''),
        amount: Number(d.amount)
      }))
    ];
    return currentAll.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [currentTransactions, currentDonations]);

  const teamLeaderboard = useMemo(() => {
    const teamsMap = {};
    currentTeams.forEach(t => {
      teamsMap[t.name] = { id: t.id, name: t.name, members: t.members || '', ticketQuota: t.ticketQuota || 0, tickets: 0, revenue: 0, ticketsByDateMap: {} };
    });
    currentTransactions.filter(t => t.type === 'income' && t.category === 'Bán vé' && t.teamName).forEach(t => {
      const name = t.teamName;
      if (!teamsMap[name]) teamsMap[name] = { id: null, name, members: '', ticketQuota: 0, tickets: 0, revenue: 0, ticketsByDateMap: {} };
      const qty = Number(t.ticketQuantity || 0);
      teamsMap[name].tickets += qty;
      teamsMap[name].revenue += Number(t.amount || 0);
      
      const d = t.date || 'Không rõ';
      teamsMap[name].ticketsByDateMap[d] = (teamsMap[name].ticketsByDateMap[d] || 0) + qty;
    });
    return Object.values(teamsMap).map(team => ({
      ...team,
      ticketsByDate: Object.entries(team.ticketsByDateMap).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    })).sort((a, b) => b.tickets - a.tickets || a.name.localeCompare(b.name));
  }, [currentTransactions, currentTeams]);

  const selectedTeamDetail = useMemo(() => teamLeaderboard.find(t => t.name === selectedTeamDetailName) || null, [teamLeaderboard, selectedTeamDetailName]);

  const tournamentStats = useMemo(() => {
    const statsMap = {};
    tournaments.forEach(t => {
      // Ưu tiên đọc số dư đã lưu sẵn trên Database (Tối ưu cho Trang chủ)
      statsMap[t.id] = { balance: t.balance || 0, totalTicketsSold: t.totalTicketsSold || 0 };
    });
    
    // Với sự kiện đang được mở, reset lại 0 để cộng dồn trực tiếp từ Real-time
    if (activeTournamentId && statsMap[activeTournamentId]) {
      statsMap[activeTournamentId].balance = 0;
      statsMap[activeTournamentId].totalTicketsSold = 0;
    }

    transactions.forEach(tx => {
      if (statsMap[tx.tournamentId] && tx.tournamentId === activeTournamentId) {
        statsMap[tx.tournamentId].balance += tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
        if (tx.type === 'income' && tx.category === 'Bán vé') {
          statsMap[tx.tournamentId].totalTicketsSold += Number(tx.ticketQuantity || 0);
        }
      }
    });
    donations.forEach(d => {
      if (statsMap[d.tournamentId] && d.tournamentId === activeTournamentId) {
        statsMap[d.tournamentId].balance += Number(d.amount);
      }
    });
    return statsMap;
  }, [tournaments, transactions, donations, activeTournamentId]);

  const openConfirm = (title, message, onConfirm, type = 'danger') => setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const handleShieldClick = () => {
    if (!isAdmin) { setShowLoginModal(true); }
    else {
      if (isAdminView) openConfirm("Chế độ người xem", "Bạn muốn chuyển sang chế độ người xem?", () => { setIsAdminView(false); closeConfirm(); }, 'primary');
      else openConfirm("Chế độ quản lý", "Bạn muốn quay lại chế độ quản lý?", () => { setIsAdminView(true); closeConfirm(); }, 'primary');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ép hệ thống luôn hiển thị bảng chọn tài khoản Gmail
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email === MASTER_ADMIN_EMAIL || adminEmails.includes(result.user.email)) {
        setIsAdminView(true);
        setShowLoginModal(false);
      } else {
        alert(`Tài khoản "${result.user.email}" không có quyền quản trị viên!\nVui lòng sử dụng tài khoản đã được cấp phép.`);
        await signOut(auth); // Đăng xuất ngay nếu không có quyền
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        console.log("Người dùng đã tự đóng cửa sổ đăng nhập.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        alert("Yêu cầu đăng nhập bị hủy vì có một cửa sổ đăng nhập khác đang mở. Vui lòng kiểm tra lại hoặc tải lại trang.");
      } else if (err.code === 'auth/unauthorized-domain') {
        alert("Tên miền Vercel này chưa được cấp phép. Bạn cần vào Firebase Console -> Authentication -> Settings -> Authorized Domains để thêm tên miền vào.");
      } else {
        alert(`Lỗi bảo mật (${err.code}).\n\nNếu bạn đang mở link bằng Zalo/Messenger hoặc Tab Ẩn danh, vui lòng mở lại bằng Chrome/Safari bình thường để đăng nhập.`);
      }
    }
  };

  const handleAddAdmin = async (email) => {
    if (!email || !email.trim() || !isAdmin) return;
    try {
      await setDoc(doc(db, 'admins', email.trim().toLowerCase()), { addedAt: new Date().toISOString(), addedBy: user?.email });
    } catch (err) { console.error(err); alert("Lỗi! Đảm bảo bạn có quyền Thêm Admin."); }
  };

  const handleDeleteAdmin = async (email) => {
    if (!isAdmin) return;
    openConfirm("Xóa Admin", `Thu hồi quyền quản trị của "${email}"?`, async () => {
      try { await deleteDoc(doc(db, 'admins', email)); closeConfirm(); } 
      catch (err) { console.error(err); }
    });
  };

  const goToDetail = (id) => { 
    window.history.pushState({}, '', '?eventId=' + id);
    setActiveTournamentId(id); setCurrentScreen('detail'); 
    setActiveMainTab('fund'); setActiveFundTab('transactions');
  };
  const goHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setCurrentScreen('home');
  };

  const handleEventClick = (t) => {
    if (isAdmin || !(t.passwordHash || t.password) || unlockedEvents[t.id]) {
      goToDetail(t.id);
    } else {
      setEventAuthModal({ isOpen: true, event: t, password: '', error: '' });
    }
  };

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
      type: 'income', amount: '', note: '', date: getLocalDateString(), donorName: '', imageUrl: '', category: 'Tài trợ', ticketQuantity: '', ticketPrice: '', teamName: '', teamMembers: '', teamTicketQuota: ''
    });
  };

  const openEditDataModal = (item, mType, specificType) => {
    setEditingData(item);
    setModalType(mType);
    setFormData({
      type: specificType,
      amount: item.amount ? formatNumberWithDots(item.amount) : '',
      note: item.note || '',
      date: item.date || getLocalDateString(),
      donorName: item.donorName || '',
      imageUrl: item.imageUrl || '',
      category: item.category || 'Khác',
      ticketQuantity: item.ticketQuantity || '',
      ticketPrice: item.ticketPrice ? formatNumberWithDots(item.ticketPrice) : '',
      teamName: item.teamName || item.name || '',
      teamMembers: item.teamMembers || item.members || '',
      teamTicketQuota: item.ticketQuota || ''
    });
    setShowAddModal(true);
  };

  const openQuickAddTicket = (teamName) => {
    setEditingData(null);
    setModalType('quick_ticket');
    setFormData({
      type: 'income',
      amount: '',
      note: 'Báo cáo vé bán',
      date: getLocalDateString(),
      donorName: '',
      imageUrl: '',
      category: 'Bán vé',
      ticketQuantity: '',
      ticketPrice: activeTournament?.ticketPrice ? formatNumberWithDots(activeTournament.ticketPrice) : '',
      teamName: teamName,
      teamMembers: '',
      teamTicketQuota: ''
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
          dataToSave = { type: formData.type, amount: parseFormattedNumber(formData.amount), note: formData.note, date: formData.date, category: formData.category || 'Khác', ticketQuantity: (formData.category === 'Bán vé' && activeTournament?.category === 'Xổ số') ? Number(formData.ticketQuantity) || 0 : 0, ticketPrice: (formData.category === 'Bán vé' && activeTournament?.category === 'Xổ số') ? (parseFormattedNumber(formData.ticketPrice) || 0) : 0, teamName: (formData.category === 'Bán vé' && activeTournament?.category === 'Xổ số') ? formData.teamName.trim() : '', tournamentId: activeTournamentId, updatedAt: timestamp };
        } else if (formData.type === 'donation') {
          collectionName = 'donations';
          dataToSave = { donorName: formData.donorName, amount: parseFormattedNumber(formData.amount), note: formData.note, date: formData.date, tournamentId: activeTournamentId, updatedAt: timestamp };
        }
      } else if (modalType === 'quick_ticket') {
        collectionName = 'transactions';
        dataToSave = { type: 'income', amount: parseFormattedNumber(formData.amount), note: formData.note, date: formData.date, category: 'Bán vé', ticketQuantity: Number(formData.ticketQuantity) || 0, ticketPrice: activeTournament?.ticketPrice ? Number(activeTournament.ticketPrice) : 0, teamName: formData.teamName, tournamentId: activeTournamentId, updatedAt: timestamp };
      } else if (modalType === 'team') {
        collectionName = 'teams';
        dataToSave = { name: formData.teamName.trim(), members: formData.teamMembers, ticketQuota: Number(formData.teamTicketQuota) || 0, tournamentId: activeTournamentId, updatedAt: timestamp };
      } else if (modalType === 'gallery') {
        collectionName = 'gallery';
        if (!formData.imageUrl) { alert("Vui lòng đính kèm hình ảnh!"); return; }
        dataToSave = { imageUrl: formData.imageUrl, note: formData.note, tournamentId: activeTournamentId, updatedAt: timestamp };
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
        const collectionName = type === 'transaction' ? 'transactions' : type === 'donation' ? 'donations' : type === 'gallery' ? 'gallery' : 'teams';
        await deleteDoc(doc(db, collectionName, id));
        closeConfirm();
      } catch (err) { console.error(err); }
    });
  };

  const openTournamentModal = (tournament = null) => {
    if (tournament) { 
      setEditingTournament(tournament); setNewTournamentName(tournament.name); setNewTournamentImage(tournament.imageUrl || ''); setNewTournamentTarget(tournament.targetAmount ? formatNumberWithDots(tournament.targetAmount) : ''); setNewTournamentCategory(tournament.category || 'Quyên góp'); setNewTournamentTicketPrice(tournament.ticketPrice ? formatNumberWithDots(tournament.ticketPrice) : ''); setNewTournamentTicketTarget(tournament.ticketTarget ? formatNumberWithDots(tournament.ticketTarget) : ''); 
      setIsPrivateEvent(!!tournament.passwordHash || !!tournament.password);
      setNewTournamentPassword('');
    } else { 
      setEditingTournament(null); setNewTournamentName(''); setNewTournamentImage(''); setNewTournamentTarget(''); setNewTournamentCategory('Quyên góp'); setNewTournamentTicketPrice(''); setNewTournamentTicketTarget(''); 
      setIsPrivateEvent(false);
      setNewTournamentPassword('');
    }
    setShowTournamentModal(true);
  };

  const handleSaveTournament = async (e) => {
    e.preventDefault();
    if (!isAdmin || !isAdminView || !newTournamentName.trim()) return;
    try {
      const timestamp = new Date().toISOString();
      const targetVal = parseFormattedNumber(newTournamentTarget) || 0;
      const ticketPriceVal = parseFormattedNumber(newTournamentTicketPrice) || 0;
      const ticketTargetVal = parseFormattedNumber(newTournamentTicketTarget) || 0;
      
      let finalPasswordHash = null;
      let finalPassword = null;
      if (isPrivateEvent) {
        if (newTournamentPassword.trim()) {
          finalPasswordHash = await hashString(newTournamentPassword.trim());
        } else {
          finalPasswordHash = editingTournament?.passwordHash || null;
          finalPassword = editingTournament?.password || null;
          if (!finalPasswordHash && !finalPassword && !editingTournament) { alert("Vui lòng nhập mật khẩu cho sự kiện!"); return; }
        }
      }

      if (editingTournament) {
        await updateDoc(doc(db, 'tournaments', editingTournament.id), { name: newTournamentName.trim(), imageUrl: newTournamentImage.trim(), targetAmount: targetVal, category: newTournamentCategory, passwordHash: finalPasswordHash, password: finalPassword, ticketPrice: newTournamentCategory === 'Xổ số' ? ticketPriceVal : 0, ticketTarget: newTournamentCategory === 'Xổ số' ? ticketTargetVal : 0, updatedAt: timestamp });
      } else {
        await addDoc(collection(db, 'tournaments'), { name: newTournamentName.trim(), imageUrl: newTournamentImage.trim(), targetAmount: targetVal, category: newTournamentCategory, passwordHash: finalPasswordHash, password: finalPassword, ticketPrice: newTournamentCategory === 'Xổ số' ? ticketPriceVal : 0, ticketTarget: newTournamentCategory === 'Xổ số' ? ticketTargetVal : 0, createdAt: timestamp });
      }
      setShowTournamentModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDeleteTournament = async () => {
    if (!editingTournament || !isAdmin || !isAdminView) return;
    openConfirm("Xóa sự kiện", `Bạn muốn xóa "${editingTournament.name}"?`, async () => {
      try { await deleteDoc(doc(db, 'tournaments', editingTournament.id)); setShowTournamentModal(false); closeConfirm(); } 
      catch (err) { console.error(err); }
    });
  };

  const handleExportExcel = () => {
    if (!isAdmin || !isAdminView) return;
    const rows = [
      ['Ngày', 'Phân Loại', 'Danh Mục', 'Nội Dung', 'Số Tiền (VNĐ)']
    ];

    reportData.forEach(item => {
      rows.push([ item.date, item.type, item.category, `"${item.note.replace(/"/g, '""')}"`, item.amount ]);
    });

    rows.push(['', '', '', '', '']);
    rows.push(['', 'Tổng Thu Quỹ:', '', '', stats.totalIncome]);
    rows.push(['', 'Tổng Ủng Hộ:', '', '', stats.totalDonations]);
    rows.push(['', 'Tổng Chi Quỹ:', '', '', stats.totalExpense]);
    rows.push(['', 'SỐ DƯ HIỆN TẠI:', '', '', stats.balance]);

    const csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_Cao_${activeTournamentName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const getMatchResultColor = (home, away) => {
    if (home > away) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (home < away) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleDeleteTicketsByDate = async (teamName, date) => {
    if (!isAdmin || !isAdminView) return;
    openConfirm("Xóa dữ liệu ngày", `Bạn có chắc chắn muốn xóa toàn bộ giao dịch bán vé ngày ${date} của đội "${teamName}"?`, async () => {
      try {
        const toDelete = transactions.filter(t => t.tournamentId === activeTournamentId && t.teamName === teamName && t.date === date && t.type === 'income' && t.category === 'Bán vé');
        await Promise.all(toDelete.map(t => deleteDoc(doc(db, 'transactions', t.id))));
        closeConfirm();
      } catch (err) { console.error(err); }
    });
  };

  return (
    <div className="md:flex md:items-center md:justify-center md:min-h-screen md:bg-slate-100 font-sans text-slate-900">
      <div className="w-full h-screen md:h-[844px] md:w-[390px] bg-[#f4f6f8] overflow-hidden md:rounded-[2.5rem] md:shadow-2xl flex flex-col select-none relative">
        
        {/* Header */}
        <header className="pt-14 pb-4 px-6 flex justify-between items-center bg-white shrink-0 z-10 relative border-b border-slate-100">
          {currentScreen === 'home' ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-[1rem] flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-0.5">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div><h1 className="text-[17px] font-black tracking-tight leading-tight uppercase">Giáo Xứ Hoàng Yên</h1><p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">TÀI CHÍNH SỰ KIỆN</p></div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={goHome} className="w-10 h-10 bg-slate-50 rounded-[1rem] flex items-center justify-center text-slate-700 shadow-sm border border-slate-200 active:scale-95 transition-transform">
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
              </button>
              <div><h1 className="text-[17px] font-black tracking-tight leading-tight truncate max-w-[150px] uppercase">{activeTournamentName}</h1><p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">CHI TIẾT SỰ KIỆN</p></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {isAdmin && isAdminView && (
              <button onClick={() => setShowAdminModal(true)} title="Quản lý Admin" className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm bg-indigo-100 text-indigo-600 hover:bg-indigo-200 active:scale-95">
                <Users size={18} strokeWidth={2.5} />
              </button>
            )}
            <button 
              onClick={handleShieldClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isAdmin ? (isAdminView ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600') : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {isAdmin ? <ShieldCheck size={20} /> : <Lock size={18} />}
            </button>
          </div>
        </header>

        {/* NỘI DUNG MÀN HÌNH CHÍNH (Danh sách sự kiện) */}
        {currentScreen === 'home' && (
          <main className="flex-1 overflow-y-auto pb-32 bg-[#f4f6f8] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 pt-5 pb-6">
              <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">Danh sách Sự kiện</h2>
              <div className="flex flex-col gap-5">
                {tournaments.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-[1.75rem] border border-slate-200 border-dashed">
                    <p className="text-sm font-medium">Chưa có sự kiện nào.</p>
                    {isAdmin && isAdminView && <p className="text-xs mt-1">Bấm dấu + ở góc dưới để thêm mới.</p>}
                  </div>
                ) : (
                  tournaments.map(t => {
                    const tStats = tournamentStats[t.id] || { balance: 0 };
                    const progressPercent = t.targetAmount ? Math.max(0, Math.min(Math.round((tStats.balance / t.targetAmount) * 100), 100)) : 0;
                    return (
                      <div key={t.id} onClick={() => handleEventClick(t)} className="relative h-[330px] rounded-[2rem] overflow-hidden shadow-lg cursor-pointer group active:scale-[0.98] transition-transform bg-slate-200 border border-black/5">
                        <img src={t.imageUrl || defaultTournamentImg} alt={t.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/5"></div>
                        {isAdmin && isAdminView && (
                          <button onClick={(e) => { e.stopPropagation(); openTournamentModal(t); }} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white hover:bg-white/30 transition-colors z-20">
                            <Edit2 size={18} strokeWidth={2.5} />
                          </button>
                        )}
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                          <div className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1 mb-2 uppercase tracking-wider">
                            {(t.passwordHash || t.password) && <Lock size={10} strokeWidth={3} />} {t.category || 'SỰ KIỆN'}
                          </div>
                          <h3 className="text-white font-black text-[22px] leading-tight line-clamp-2 shadow-black/50 drop-shadow-md">{t.name}</h3>
                          {t.targetAmount > 0 && (
                            <div className="mt-3 bg-black/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                              <div className="flex justify-between text-white/90 text-[10px] font-bold mb-1.5">
                                <span>Đã đạt: {formatCurrency(tStats.balance)}</span>
                                <span>Mục tiêu: {formatCurrency(t.targetAmount)}</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>
                          )}
                          <p className="text-white/70 text-[11px] font-bold tracking-wide mt-3 flex items-center gap-1.5 uppercase"><ArrowUpRight size={14} strokeWidth={3}/> Xem chi tiết</p>
                        </div>
                      </div>
                    )
                  })
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

        <AdminManagerModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} adminEmails={adminEmails} onAdd={handleAddAdmin} onDelete={handleDeleteAdmin} />

        {/* NỘI DUNG MÀN HÌNH CHI TIẾT SỰ KIỆN */}
        {currentScreen === 'detail' && (
          <main className="flex-1 overflow-y-auto pb-[100px] bg-[#f4f6f8] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* --- TAB 2: THU CHI --- */}
            {activeMainTab === 'fund' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden mb-6">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 mb-2"><Wallet size={16} /><p className="text-[11px] font-bold uppercase tracking-widest">Số Dư Quỹ</p></div>
                    <h2 className="text-[32px] font-black tracking-tight mb-6">{formatCurrency(stats.balance)}</h2>
                    
                    {activeTournament?.targetAmount > 0 && (
                      <div className={`${activeTournament?.category === 'Xổ số' && activeTournament?.ticketTarget > 0 ? 'mb-3' : 'mb-6'} bg-white/5 p-4 rounded-2xl border border-white/10`}>
                        <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                          <span>Tiến độ: {Math.max(0, Math.min(Math.round((stats.balance / activeTournament.targetAmount) * 100), 100))}%</span>
                          <span>Mục tiêu: {formatCurrency(activeTournament.targetAmount)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                          <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(Math.round((stats.balance / activeTournament.targetAmount) * 100), 100))}%` }}></div>
                        </div>
                      </div>
                    )}

                    {activeTournament?.category === 'Xổ số' && activeTournament?.ticketTarget > 0 && (
                      <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                          <span className="flex items-center gap-1.5"><Tag size={12}/> Tiến độ vé: {Math.max(0, Math.min(Math.round((stats.totalTicketsSold / activeTournament.ticketTarget) * 100), 100))}%</span>
                          <span>Đã bán: {formatNumberWithDots(stats.totalTicketsSold)} / {formatNumberWithDots(activeTournament.ticketTarget)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                          <div className="bg-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(Math.round((stats.totalTicketsSold / activeTournament.ticketTarget) * 100), 100))}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/5"><div className="flex items-center gap-1.5 text-emerald-400 mb-1"><TrendingUp size={14} strokeWidth={3} /><p className="text-[10px] font-black uppercase tracking-wider">Tổng Thu</p></div><p className="font-bold text-[15px]">+{formatCurrency(stats.totalIncome + stats.totalDonations)}</p></div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/5"><div className="flex items-center gap-1.5 text-rose-400 mb-1"><TrendingDown size={14} strokeWidth={3} /><p className="text-[10px] font-black uppercase tracking-wider">Đã Chi</p></div><p className="font-bold text-[15px]">-{formatCurrency(stats.totalExpense)}</p></div>
                    </div>
                  </div>
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-5">
                  <button onClick={() => setActiveFundTab('transactions')} className={`flex-1 py-2.5 text-[12px] font-bold rounded-xl transition-all duration-200 ${activeFundTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Giao Dịch</button>
                  <button onClick={() => setActiveFundTab('donations')} className={`flex-1 py-2.5 text-[12px] font-bold rounded-xl transition-all duration-200 ${activeFundTab === 'donations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Ủng Hộ</button>
                  <button onClick={() => setActiveFundTab('stats')} className={`flex-1 py-2.5 text-[12px] font-bold rounded-xl transition-all duration-200 ${activeFundTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Thống Kê</button>
                </div>

                <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">
                  {activeFundTab === 'transactions' ? 'Lịch sử giao dịch' : activeFundTab === 'donations' ? 'Danh sách ủng hộ' : 'Thống kê tổng quan'}
                </h2>
                
                <div className="space-y-3 pb-8">
                  {activeFundTab === 'stats' ? (
                    (() => {
                      const totalVolume = stats.totalIncome + stats.totalDonations + stats.totalExpense;
                      const incomePercent = totalVolume > 0 ? ((stats.totalIncome + stats.totalDonations) / totalVolume) * 100 : 0;
                      const expensePercent = totalVolume > 0 ? (stats.totalExpense / totalVolume) * 100 : 0;
                      return (
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col items-center">
                          {totalVolume === 0 ? (
                            <p className="text-slate-400 text-sm font-medium py-10">Chưa có dữ liệu thống kê.</p>
                          ) : (
                            <>
                              <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-8 mt-2 shadow-[0_0_20px_rgba(0,0,0,0.05)]" style={{ background: `conic-gradient(#34d399 0% ${incomePercent}%, #fb7185 ${incomePercent}% 100%)` }}>
                                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                  <PieChart size={24} className="text-slate-300 mb-1" strokeWidth={2} />
                                </div>
                              </div>
                              <div className="w-full flex gap-3">
                                <div className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
                                  <div className="flex items-center gap-1.5 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm"></div><span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Tổng Thu</span></div>
                                  <div className="text-[17px] font-black text-emerald-700">{incomePercent.toFixed(1)}%</div>
                                  <div className="text-[11px] font-bold text-emerald-600/60 mt-0.5">{formatCurrency(stats.totalIncome + stats.totalDonations)}</div>
                                </div>
                                <div className="flex-1 bg-rose-50 rounded-2xl p-4 border border-rose-100/50">
                                  <div className="flex items-center gap-1.5 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm"></div><span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Tổng Chi</span></div>
                                  <div className="text-[17px] font-black text-rose-700">{expensePercent.toFixed(1)}%</div>
                                  <div className="text-[11px] font-bold text-rose-600/60 mt-0.5">{formatCurrency(stats.totalExpense)}</div>
                                </div>
                              </div>
                              {Object.keys(stats.expensesByCategory).length > 0 && (
                                <div className="w-full mt-6 pt-6 border-t border-slate-100/50">
                                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 text-left w-full">Chi tiết hạng mục Chi</h3>
                                  <div className="space-y-3 w-full">
                                    {Object.entries(stats.expensesByCategory)
                                      .sort((a,b) => b[1] - a[1])
                                      .map(([cat, amount]) => (
                                      <div key={cat} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                          <span className="text-[13px] font-bold text-slate-700">{cat}</span>
                                        </div>
                                        <span className="text-[13px] font-black text-rose-600">-{formatCurrency(amount)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {activeTournament?.category === 'Xổ số' && (
                                <>
                                  <div className="w-full mt-3 bg-amber-50 rounded-2xl p-4 border border-amber-100/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Tag size={16} strokeWidth={2.5}/></div>
                                      <span className="text-[13px] font-bold text-amber-800">Tổng Số Vé Bán Ra</span>
                                    </div>
                                    <span className="text-[20px] font-black text-amber-600">{formatNumberWithDots(stats.totalTicketsSold)} vé</span>
                                  </div>
                                  {stats.ticketsByDate?.length > 0 && (
                                    <div className="w-full mt-4 pt-4 border-t border-slate-100/50">
                                      <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3 text-left w-full">Tiến độ bán vé theo ngày</h3>
                                      <div className="space-y-2.5 w-full">
                                        {stats.ticketsByDate.map(([date, qty]) => (
                                          <div key={date} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                              <span className="text-[12px] font-bold text-slate-600">{date}</span>
                                            </div>
                                            <span className="text-[13px] font-black text-amber-600">+{formatNumberWithDots(qty)} vé</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              {isAdmin && isAdminView && (
                                <button onClick={() => setShowReportPreview(true)} className="w-full mt-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all">
                                  <Eye size={16} strokeWidth={2.5} /> Xem Trước Báo Cáo
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (() => {
                    let displayList = [];
                    if (activeFundTab === 'transactions') {
                      const regular = currentTransactions.filter(t => t.type !== 'ticket_receive' && !(t.type === 'income' && t.category === 'Bán vé' && t.teamName));
                      const teamTickets = currentTransactions.filter(t => t.type === 'income' && t.category === 'Bán vé' && t.teamName);
                      displayList = [...regular];
                      if (teamTickets.length > 0) {
                        const totalQty = teamTickets.reduce((sum, t) => sum + Number(t.ticketQuantity || 0), 0);
                        const totalAmt = teamTickets.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                        displayList.unshift({
                          id: 'virtual_team_tickets',
                          type: 'income',
                          category: 'Bán vé',
                          note: 'Thi Đua',
                          amount: totalAmt,
                          ticketQuantity: totalQty,
                          date: '',
                          isVirtual: true
                        });
                      }
                    } else {
                      displayList = currentDonations;
                    }
                    if (displayList.length === 0) return <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200"><p className="text-sm font-medium">Chưa có dữ liệu.</p></div>;
                    return displayList.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100/50">
                        <div className={`shrink-0 w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-sm ${activeFundTab === 'donations' ? 'bg-amber-50 text-amber-600' : item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {activeFundTab === 'donations' ? <Heart size={24} strokeWidth={2.5} /> : item.type === 'income' ? <ArrowUpRight size={24} strokeWidth={2.5} /> : <ArrowDownLeft size={24} strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] truncate text-slate-900">{activeFundTab === 'donations' ? item.donorName : item.note}</p>
                          {activeFundTab === 'donations' && item.note && <p className="text-[11px] text-slate-500 mt-0.5 truncate pr-2 font-medium">"{item.note}"</p>}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-1.5">
                            {activeFundTab !== 'donations' && item.category && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 max-w-[160px]">
                                <Tag size={10} className="shrink-0" />
                                <span className="truncate">{item.category} {item.ticketQuantity ? `(${formatNumberWithDots(item.ticketQuantity)} vé)` : ''}</span>
                              </span>
                            )}
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className={`font-black text-[15px] tracking-tight ${activeFundTab === 'donations' ? 'text-amber-600' : item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {activeFundTab === 'donations' || item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </p>
                          {isAdmin && isAdminView && !item.isVirtual && (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openEditDataModal(item, 'fund', activeFundTab === 'donations' ? 'donation' : item.type)} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 rounded-lg"><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteData(item.id, activeFundTab === 'donations' ? 'donation' : 'transaction')} className="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 rounded-lg"><Trash2 size={13} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* --- TAB THI ĐUA (CHỈ DÀNH CHO XỔ SỐ) --- */}
            {activeMainTab === 'competition' && activeTournament?.category === 'Xổ số' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5 pb-8">
                <div className="flex items-center gap-3 mb-6 bg-amber-50 p-4 rounded-2xl border border-amber-100/50 shadow-sm relative">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-xl shadow-inner shrink-0">
                    <Trophy size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[15px] font-black tracking-tight text-amber-900 uppercase">Bảng Xếp Hạng</h2>
                    <p className="text-[11px] font-bold text-amber-700/70 mt-0.5">Các đội bán vé xuất sắc nhất</p>
                  </div>
                  <button 
                    onClick={() => setShowChartModal(true)} 
                    className="p-2.5 bg-amber-200/50 text-amber-700 rounded-xl hover:bg-amber-200 active:scale-95 transition-all shadow-sm"
                    title="Xem biểu đồ"
                  >
                    <BarChart3 size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {teamLeaderboard.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200">
                    <p className="text-sm font-medium">Chưa có dữ liệu thi đua.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {teamLeaderboard.map((team, index) => {
                      let rankContent = index + 1;
                      let rankColor = 'bg-slate-100 text-slate-400 border-2 border-transparent';
                      let cardStyle = 'border-slate-100 shadow-sm bg-white';
                      let rankContainerStyle = 'w-11 h-11 text-[15px] font-black shrink-0 self-start mt-0.5 z-10';
                      
                      if (index === 0) {
                        rankContent = <Trophy size={28} strokeWidth={2.5} className="drop-shadow-lg text-yellow-50" />;
                        rankColor = 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 text-white shadow-[0_0_25px_rgba(251,191,36,0.8)] border-2 border-yellow-200 ring-4 ring-yellow-400/30';
                        cardStyle = 'border-amber-400 shadow-[0_12px_30px_-5px_rgba(251,191,36,0.6)] bg-gradient-to-br from-amber-50 via-yellow-100/90 to-amber-50 scale-[1.04] relative overflow-hidden z-30';
                        rankContainerStyle = 'w-14 h-14 shrink-0 self-start z-10';
                      } else if (index === 1) {
                        rankContent = <Medal size={24} strokeWidth={2.5} className="drop-shadow-lg text-slate-50" />;
                        rankColor = 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-white shadow-[0_0_20px_rgba(148,163,184,0.6)] border-2 border-slate-100 ring-4 ring-slate-400/30';
                        cardStyle = 'border-slate-400 shadow-[0_10px_25px_-5px_rgba(148,163,184,0.5)] bg-gradient-to-br from-slate-50 via-gray-200/80 to-slate-50 scale-[1.02] relative overflow-hidden z-20';
                        rankContainerStyle = 'w-12 h-12 shrink-0 self-start z-10 mt-0.5';
                      } else if (index === 2) {
                        rankContent = <Medal size={24} strokeWidth={2.5} className="drop-shadow-lg text-orange-50" />;
                        rankColor = 'bg-gradient-to-br from-orange-300 via-orange-500 to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] border-2 border-orange-200 ring-4 ring-orange-500/30';
                        cardStyle = 'border-orange-400 shadow-[0_10px_25px_-5px_rgba(249,115,22,0.5)] bg-gradient-to-br from-orange-50 via-orange-200/80 to-orange-50 scale-[1.01] relative overflow-hidden z-10';
                        rankContainerStyle = 'w-12 h-12 shrink-0 self-start z-10 mt-0.5';
                      }
                      
                      return (
                        <div key={team.name} className={`rounded-2xl p-4 flex items-center gap-4 border transition-all duration-300 ${cardStyle}`}>
                          {index === 0 && <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-400/30 rounded-full blur-3xl pointer-events-none"></div>}
                          {index === 1 && <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-400/20 rounded-full blur-3xl pointer-events-none"></div>}
                          {index === 2 && <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>}
                          <div className={`rounded-full flex items-center justify-center ${rankContainerStyle} ${rankColor}`}>{rankContent}</div>
                          <div className="flex-1 min-w-0 z-10">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-[15px] text-slate-900 truncate">{team.name}</p>
                                {team.members && <p className="text-[10px] font-medium text-slate-500 mt-0.5 line-clamp-1">{team.members}</p>}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                                <button onClick={() => setSelectedTeamDetailName(team.name)} className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                  <List size={13} strokeWidth={3} />
                                </button>
                                {isAdmin && isAdminView && team.id && (
                                  <>
                                    <button onClick={() => openEditDataModal(team, 'team', 'team')} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 border border-slate-100 rounded-lg"><Edit2 size={13} /></button>
                                    <button onClick={() => handleDeleteData(team.id, 'team')} className="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 border border-slate-100 rounded-lg"><Trash2 size={13} /></button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-2">
                              <div className="flex justify-between text-[11px] font-black text-slate-500 mb-1.5">
                                <span>ĐÃ BÁN: <span className="text-emerald-600">{formatNumberWithDots(team.tickets)}</span> / {formatNumberWithDots(team.ticketQuota)} vé</span>
                                <span className="text-amber-600">{team.ticketQuota > 0 ? Math.round((team.tickets / team.ticketQuota) * 100) : 0}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${team.ticketQuota > 0 ? Math.min(100, (team.tickets / team.ticketQuota) * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Doanh thu</span>
                              <span className="text-emerald-600 font-black text-[13px]">{formatCurrency(team.revenue)}</span>
                            </div>
                            

                            {isAdmin && isAdminView && (
                              <button onClick={() => openQuickAddTicket(team.name)} className="w-full mt-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all text-[11px] uppercase tracking-wider">
                                <Plus size={14} strokeWidth={3} /> Cập nhật vé bán
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB 3: KỈ NIỆM --- */}
            {activeMainTab === 'gallery' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-5 pt-5 pb-8">
                <h2 className="text-xs font-black text-slate-400 mb-4 px-1 uppercase tracking-widest">Thư viện & Chứng từ</h2>
                {currentPhotos.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-[1.5rem] border border-slate-200"><p className="text-sm font-medium">Chưa có hình ảnh nào.</p></div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {currentPhotos.slice(0, displayLimit).map(photo => (
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
                    {currentPhotos.length > displayLimit && (
                      <button onClick={() => setDisplayLimit(prev => prev + 50)} className="w-full mt-2 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-colors shadow-sm">
                        Xem thêm hình ảnh
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Nút FAB Detail */}
            {isAdmin && isAdminView && (
              <button onClick={() => { 
                resetFormData(); 
                setEditingData(null); 
                
                if (activeMainTab === 'gallery') {
                  setModalType('gallery');
                  setFormData(prev => ({...prev, type: 'gallery'}));
                } else if (activeMainTab === 'competition') {
                  setModalType('team');
                  setFormData(prev => ({...prev, type: 'team'}));
                } else {
                  setModalType('fund');
                  setFormData(prev => ({...prev, type: activeFundTab === 'donations' ? 'donation' : 'income'}));
                }
                
                setShowAddModal(true);
              }} className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center z-30 active:scale-95 transition-transform border-4 border-white">
                <Plus size={28} strokeWidth={3} />
              </button>
            )}
          </main>
        )}

        {/* Modal Biểu Đồ Thống Kê Thi Đua */}
        {showChartModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center rounded-xl shadow-inner shrink-0">
                    <BarChart3 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black tracking-tight text-slate-900 uppercase">Biểu Đồ Vé Bán</h2>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Thống kê số lượng theo đội</p>
                  </div>
                </div>
                <button onClick={() => setShowChartModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} strokeWidth={2.5} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {teamLeaderboard.length === 0 ? (
                  <p className="text-center text-slate-400 text-[12px] py-4">Chưa có dữ liệu.</p>
                ) : (
                  (() => {
                    const maxTickets = Math.max(...teamLeaderboard.map(t => t.tickets), 1);
                    return teamLeaderboard.map((team, index) => {
                      const percentage = (team.tickets / maxTickets) * 100;
                      let barColor = "bg-emerald-400";
                      if (index === 0) barColor = "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]";
                      else if (index === 1) barColor = "bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]";
                      else if (index === 2) barColor = "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]";

                      return (
                        <div key={team.name} className="flex flex-col gap-2">
                          <div className="flex justify-between items-end text-[12px]">
                            <span className="font-bold text-slate-700 truncate max-w-[70%]">{index + 1}. {team.name}</span>
                            <span className="font-black text-slate-900">{formatNumberWithDots(team.tickets)} vé</span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- BOTTOM NAVIGATION BAR --- */}
        {currentScreen === 'detail' && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-6 pt-3 z-40 rounded-b-[2.5rem]">
            <button onClick={() => setActiveMainTab('fund')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'fund' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'fund' ? 'bg-slate-100' : ''}`}><Wallet size={22} strokeWidth={activeMainTab === 'fund' ? 2.5 : 2} /></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'fund' ? 'opacity-100' : 'opacity-0'}`}>Thu Chi</span>
            </button>
            {activeTournament?.category === 'Xổ số' && (
              <button onClick={() => setActiveMainTab('competition')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'competition' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'competition' ? 'bg-slate-100' : ''}`}><Trophy size={22} strokeWidth={activeMainTab === 'competition' ? 2.5 : 2} /></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'competition' ? 'opacity-100' : 'opacity-0'}`}>Thi Đua</span>
              </button>
            )}
            <button onClick={() => setActiveMainTab('gallery')} className={`flex flex-col items-center gap-1.5 w-20 transition-colors ${activeMainTab === 'gallery' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <div className={`p-1.5 rounded-[1rem] ${activeMainTab === 'gallery' ? 'bg-slate-100' : ''}`}><Receipt size={22} strokeWidth={activeMainTab === 'gallery' ? 2.5 : 2} /></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeMainTab === 'gallery' ? 'opacity-100' : 'opacity-0'}`}>Chứng Từ</span>
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
                  {editingData && editingData.id ? 'Cập Nhật' : 'Thêm Mới'} {modalType === 'fund' ? (formData.type === 'donation' ? 'Ủng Hộ' : 'Giao Dịch') : modalType === 'team' ? 'Đội Bán Vé' : modalType === 'quick_ticket' ? 'Vé Bán' : 'Chứng Từ'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingData(null); resetFormData(); }} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveData} className="space-y-4">
                
                {/* 1. Form THU CHI */}
                {modalType === 'fund' && (
                  <>
                    <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-4 relative">
                      {editingData && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'income', category: 'Tài trợ'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Thu</button>
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'expense', category: 'Trang trí'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Chi</button>
                      <button type="button" onClick={() => !editingData && setFormData({...formData, type: 'donation'})} className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-all ${formData.type === 'donation' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'} ${editingData ? 'opacity-50' : ''}`}>Ủng Hộ</button>
                    </div>
                    {formData.type !== 'donation' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Danh Mục {formData.type === 'income' ? 'Thu' : 'Chi'}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none appearance-none" value={formData.category} onChange={(e) => {
                          const newCat = e.target.value;
                          const updatedForm = { ...formData, category: newCat };
                          if (formData.type === 'income' && newCat === 'Bán vé' && activeTournament?.category === 'Xổ số') {
                            updatedForm.ticketPrice = activeTournament?.ticketPrice ? formatNumberWithDots(activeTournament.ticketPrice) : '';
                          }
                          setFormData(updatedForm);
                        }}>
                          {formData.type === 'income' ? (
                            <>
                              <option value="Tài trợ">Tài trợ / Ân nhân</option>
                              <option value="Bán vé">Bán vé / Gian hàng</option>
                              <option value="Khác">Khác</option>
                            </>
                          ) : (
                            <>
                              <option value="Trang trí">Trang trí</option>
                              <option value="Âm thanh/Ánh sáng">Âm thanh / Ánh sáng</option>
                              <option value="Ẩm thực">Ẩm thực / Ăn uống</option>
                              <option value="Hậu cần">Hậu cần / Di chuyển</option>
                              <option value="Quà tặng">Phần thưởng / Quà tặng</option>
                              <option value="Khác">Khác</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">{formData.type === 'donation' ? 'Tên Người Ủng Hộ' : 'Nội Dung'}</label>
                      <input type="text" required placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={formData.type === 'donation' ? formData.donorName : formData.note} onChange={(e) => formData.type === 'donation' ? setFormData({...formData, donorName: e.target.value}) : setFormData({...formData, note: e.target.value})} />
                    </div>
                    {formData.type === 'income' && formData.category === 'Bán vé' && activeTournament?.category === 'Xổ số' && (
                      <div className="space-y-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Số lượng vé</label>
                            <input type="number" min="0" placeholder="VD: 50" className="w-full bg-white border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-amber-400 focus:outline-none text-emerald-600" value={formData.ticketQuantity} onChange={(e) => {
                              const val = e.target.value;
                              const qty = Number(val) || 0;
                              const price = parseFormattedNumber(formData.ticketPrice) || 0;
                              setFormData({...formData, ticketQuantity: val, amount: (qty > 0 && price > 0) ? formatNumberWithDots(qty * price) : formData.amount});
                            }} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Giá 1 vé</label>
                            <input type="text" placeholder="VD: 10.000" className="w-full bg-white border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-amber-400 focus:outline-none text-emerald-600" value={formData.ticketPrice} onChange={(e) => {
                              const val = formatNumberWithDots(e.target.value);
                              const price = parseFormattedNumber(val) || 0;
                              const qty = Number(formData.ticketQuantity) || 0;
                              setFormData({...formData, ticketPrice: val, amount: (qty > 0 && price > 0) ? formatNumberWithDots(qty * price) : formData.amount});
                            }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider flex items-center gap-1"><Trophy size={11} className="text-amber-500" /> Đội / Nhóm bán vé</label>
                          <select className="w-full bg-white border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-amber-400 focus:outline-none appearance-none" value={formData.teamName} onChange={(e) => setFormData({...formData, teamName: e.target.value})}>
                            <option value="">-- Không chọn --</option>
                            {currentTeams.map(t => (
                              <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
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

                {/* Form NHẬP VÉ NHANH */}
                {modalType === 'quick_ticket' && (
                  <>
                    <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-[1.2rem] mb-4 font-black text-center border border-emerald-100 flex items-center justify-center gap-2 uppercase tracking-wider text-[13px]">
                      <Trophy size={18} strokeWidth={2.5} /> ĐỘI: {formData.teamName}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Số lượng vé bán được</label>
                      <input type="number" min="0" required placeholder="VD: 50" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-emerald-500 focus:outline-none text-emerald-600" value={formData.ticketQuantity} onChange={(e) => {
                        const val = e.target.value;
                        const qty = Number(val) || 0;
                            const price = parseFormattedNumber(formData.ticketPrice) || 0;
                        setFormData({...formData, ticketQuantity: val, amount: (qty > 0 && price > 0) ? formatNumberWithDots(qty * price) : formData.amount});
                      }} />
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
                  </>
                )}

                {/* 3. Form ĐỘI THI ĐUA */}
                {modalType === 'team' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Tên Đội / Nhóm</label>
                      <input type="text" required placeholder="VD: Ca Đoàn, Giới Trẻ..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none" value={formData.teamName} onChange={(e) => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Danh sách thành viên (Tùy chọn)</label>
                      <textarea placeholder="VD: A.Tuấn, C.Mai, E.Hùng..." rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-medium focus:border-slate-900 focus:outline-none resize-none leading-relaxed" value={formData.teamMembers} onChange={(e) => setFormData({...formData, teamMembers: e.target.value})}></textarea>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Tổng số vé nhận (Chỉ tiêu)</label>
                      <input type="number" required min="0" placeholder="VD: 500" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-black focus:border-slate-900 focus:outline-none" value={formData.teamTicketQuota} onChange={(e) => setFormData({...formData, teamTicketQuota: e.target.value})} />
                    </div>
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
                <h2 className="text-[17px] font-black tracking-tight text-slate-900 uppercase">{editingTournament ? 'Cập Nhật Sự Kiện' : 'Tạo Sự Kiện Mới'}</h2>
                <button onClick={() => setShowTournamentModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 active:bg-slate-200 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveTournament} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Tên Sự Kiện</label>
                  <input type="text" required placeholder="VD: Lễ Giáng Sinh 2026..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={newTournamentName} onChange={(e) => setNewTournamentName(e.target.value)} />
                </div>
                {newTournamentCategory === 'Xổ số' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Giá vé (VNĐ)</label>
                      <input type="text" placeholder="VD: 10.000" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none text-emerald-600" value={newTournamentTicketPrice} onChange={(e) => setNewTournamentTicketPrice(formatNumberWithDots(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Mục tiêu (Vé)</label>
                      <input type="text" placeholder="VD: 1.000" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none text-emerald-600" value={newTournamentTicketTarget} onChange={(e) => setNewTournamentTicketTarget(formatNumberWithDots(e.target.value))} />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Phân Loại Sự Kiện</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none appearance-none" value={newTournamentCategory} onChange={(e) => setNewTournamentCategory(e.target.value)}>
                    <option value="Quyên góp">Quyên góp / Gây quỹ</option>
                    <option value="Thể thao">Thể thao / Bóng đá</option>
                    <option value="Xổ số">Xổ số / Hội chợ</option>
                    <option value="Xây dựng">Xây dựng / Tu bổ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 flex items-center gap-1 uppercase tracking-wider"><ImageIcon size={13} /> Ảnh bìa sự kiện</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="https://... hoặc Ctrl+V để dán" className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-medium focus:border-slate-900 focus:outline-none" value={newTournamentImage} onChange={(e) => setNewTournamentImage(e.target.value)} onPaste={(e) => handlePasteImage(e, setNewTournamentImage)} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 bg-slate-100 text-slate-600 px-4 rounded-[1.2rem] border border-slate-200 flex items-center justify-center active:bg-slate-200"><Upload size={18} strokeWidth={2.5} /></button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, setNewTournamentImage)} />
                  </div>
                  {newTournamentImage && <div className="mt-3 h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"><img src={newTournamentImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = defaultTournamentImg; }} /></div>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-wider">Mục Tiêu Gây Quỹ (VNĐ)</label>
                  <input type="text" placeholder="Tùy chọn (VD: 50.000.000)" className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none text-emerald-600" value={newTournamentTarget} onChange={(e) => setNewTournamentTarget(formatNumberWithDots(e.target.value))} />
                </div>
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" checked={isPrivateEvent} onChange={(e) => setIsPrivateEvent(e.target.checked)} />
                    <span className="text-[13px] font-bold text-slate-700">Sự kiện riêng tư (Cần mật khẩu)</span>
                  </label>
                  {isPrivateEvent && (
                    <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="text-[11px] font-black text-slate-400 ml-1 flex items-center gap-1 uppercase tracking-wider"><Lock size={13} /> Thiết lập mật khẩu</label>
                      <input type="text" placeholder={(editingTournament?.passwordHash || editingTournament?.password) ? "Đã thiết lập (Nhập vào đây để đổi mật khẩu mới)" : "Nhập mật khẩu cho sự kiện..."} className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-3.5 text-[15px] font-bold focus:border-slate-900 focus:outline-none" value={newTournamentPassword} onChange={(e) => setNewTournamentPassword(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="pt-4 flex gap-3">
                  {editingTournament && <button type="button" onClick={handleDeleteTournament} className="py-4 px-5 bg-rose-50 text-rose-600 rounded-2xl font-bold shadow-sm active:scale-95 transition-transform"><Trash2 size={20} /></button>}
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-widest shadow-lg active:scale-[0.98] transition-transform uppercase">{editingTournament ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện'}</button>
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
          <div className="space-y-6">
            <p className="text-[13px] font-medium text-slate-500 text-center leading-relaxed">Đăng nhập bằng tài khoản Google (Gmail) được cấp quyền để truy cập trang quản trị.</p>
            <button onClick={handleGoogleLogin} className="w-full py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-black shadow-sm active:scale-[0.98] transition-transform tracking-widest uppercase flex items-center justify-center gap-3 border border-slate-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng Nhập với Google
            </button>
          </div>
            </div>
          </div>
        )}

        <EventAuthModal 
          isOpen={eventAuthModal.isOpen} 
          onClose={() => setEventAuthModal({ isOpen: false, event: null })} 
          event={eventAuthModal.event} 
          onSuccess={(eventId) => {
            setUnlockedEvents(prev => ({ ...prev, [eventId]: true }));
            goToDetail(eventId);
            setEventAuthModal({ isOpen: false, event: null });
          }} 
        />

        {/* Modal Chi Tiết Đội (Nhận / Bán vé) */}
        {selectedTeamDetailName && selectedTeamDetail && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[90] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-[350px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center rounded-xl shadow-inner shrink-0">
                    <List size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black tracking-tight text-slate-900 uppercase">Chi Tiết Đội</h2>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{selectedTeamDetail.name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTeamDetailName(null)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} strokeWidth={2.5} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {selectedTeamDetail.ticketsByDate?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Tổng kết bán theo ngày</h4>
                    <div className="space-y-2 bg-amber-50 p-3 rounded-2xl border border-amber-100/50">
                      {selectedTeamDetail.ticketsByDate.map(([date, qty]) => (
                        <div key={date} className="flex justify-between items-center text-[12px] bg-white p-2.5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div><span className="font-bold text-slate-600">{date}</span></div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600">+{formatNumberWithDots(qty)} vé</span>
                            {isAdmin && isAdminView && (
                              <button onClick={() => handleDeleteTicketsByDate(selectedTeamDetail.name, date)} className="text-slate-400 hover:text-rose-500 p-1.5 bg-amber-50 rounded-lg transition-colors"><Trash2 size={12} /></button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeamDetail.transactions?.length > 0 ? (
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Chi tiết giao dịch</h4>
                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      {selectedTeamDetail.transactions.map((t) => (
                        <div key={t.id} className="flex justify-between items-center text-[12px] bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'ticket_receive' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                              <span className="font-bold text-slate-600">{t.date}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${t.type === 'ticket_receive' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {t.type === 'ticket_receive' ? 'Nhận' : 'Bán'}
                              </span>
                            </div>
                            {t.type !== 'ticket_receive' && t.amount && (
                              <span className="text-[10px] font-bold text-slate-400 ml-3">{formatCurrency(t.amount)}</span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`font-black ${t.type === 'ticket_receive' ? 'text-blue-600' : 'text-emerald-600'}`}>
                              +{formatNumberWithDots(t.ticketQuantity)} vé
                            </span>
                            {isAdmin && isAdminView && (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => { setSelectedTeamDetailName(null); openEditDataModal(t, 'quick_ticket', t.type); }} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 rounded-lg"><Edit2 size={12} /></button>
                                <button onClick={() => { setSelectedTeamDetailName(null); handleDeleteData(t.id, 'transaction'); }} className="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 rounded-lg"><Trash2 size={12} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 text-[12px] py-4">Chưa có giao dịch nào.</p>
                )}
              </div>
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

        {/* Modal Xem Trước Báo Cáo */}
        {showReportPreview && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-[2rem] p-6 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10 max-h-[90vh] flex flex-col">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="flex justify-between items-center mb-6 px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FileText size={20} strokeWidth={2.5} /></div>
                  <h2 className="text-[17px] font-black tracking-tight text-slate-900 uppercase">Xem Trước Báo Cáo</h2>
                </div>
                <button onClick={() => setShowReportPreview(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95"><X size={18} strokeWidth={2.5} /></button>
              </div>

              <div className="flex-1 overflow-y-auto mb-6 border border-slate-100 rounded-2xl bg-white shadow-inner">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                    <tr className="text-slate-500 uppercase tracking-wider font-black">
                      <th className="px-3 py-3">Ngày</th>
                      <th className="px-3 py-3">Nội Dung</th>
                      <th className="px-3 py-3 text-right">Số Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 font-medium">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-3 py-3 whitespace-nowrap text-[11px] font-bold text-slate-400">{item.date}</td>
                        <td className="px-3 py-3">
                          <span className={`font-black block text-[11px] uppercase tracking-wider mb-0.5 ${item.type === 'Thu Quỹ' || item.type === 'Ủng Hộ' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.type} {item.category && `• ${item.category}`}</span>
                          <span className="text-[13px] text-slate-800 line-clamp-2 leading-snug">{item.note}</span>
                        </td>
                        <td className={`px-3 py-3 text-right font-black whitespace-nowrap text-[14px] ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    {reportData.length === 0 && (
                      <tr><td colSpan="3" className="px-3 py-8 text-center text-slate-400 font-medium">Không có dữ liệu báo cáo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[12px] font-bold text-slate-500"><span>Tổng Thu:</span> <span className="text-emerald-600 font-black">+{formatCurrency(stats.totalIncome + stats.totalDonations)}</span></div>
                <div className="flex justify-between items-center text-[12px] font-bold text-slate-500"><span>Tổng Chi:</span> <span className="text-rose-600 font-black">-{formatCurrency(stats.totalExpense)}</span></div>
                <div className="flex justify-between items-center text-[15px] font-black text-slate-900 pt-2.5 border-t border-slate-200"><span>SỐ DƯ HIỆN TẠI:</span> <span>{formatCurrency(stats.balance)}</span></div>
              </div>

              <button onClick={() => { handleExportExcel(); setShowReportPreview(false); }} className="shrink-0 w-full py-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:bg-emerald-600 active:scale-95 transition-all tracking-widest uppercase">
                <Download size={18} strokeWidth={2.5} /> Xuất File Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}