import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
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
  AlertCircle
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
      <div className="relative w-full h-screen md:h-[844px] md:w-[390px] md:border-gray-800 md:dark:border-gray-800 md:bg-gray-800 md:border-[14px] md:rounded-[3.5rem] md:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden">
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
  const [activeTab, setActiveTab] = useState('transactions'); 
  
  const [transactions, setTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false); 
  const [showTournamentModal, setShowTournamentModal] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingTournament, setEditingTournament] = useState(null); 
  const [editingData, setEditingData] = useState(null); 
  
  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentImage, setNewTournamentImage] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    donorName: ''
  });

  const fileInputRef = useRef(null);
  const defaultTournamentImg = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop";

  // --- Helper: Format và Parse tiền tệ ---
  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const number = val.toString().replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const parseFormattedNumber = (val) => {
    return Number(val.toString().replace(/\./g, ''));
  };

  // Hàm so sánh để sắp xếp: Ngày mới nhất -> Thời gian tạo mới nhất
  const sortNewestFirst = (a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateB - dateA !== 0) return dateB - dateA;
    
    // Nếu cùng ngày, dùng createdAt để phân biệt
    const timeA = new Date(a.createdAt || 0);
    const timeB = new Date(b.createdAt || 0);
    return timeB - timeA;
  };

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (error) { console.error("Lỗi đăng nhập:", error); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubTrans = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data.sort(sortNewestFirst));
    });

    const unsubDonations = onSnapshot(collection(db, 'donations'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDonations(data.sort(sortNewestFirst));
    });

    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Giải đấu thì để cái mới tạo xuống dưới hoặc lên trên tùy hỷ, ở đây để mới nhất lên trên
      setTournaments(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    });

    return () => { unsubTrans(); unsubDonations(); unsubTournaments(); };
  }, [user]);

  const currentTransactions = useMemo(() => {
    if (!activeTournamentId) return [];
    return transactions.filter(t => t.tournamentId === activeTournamentId);
  }, [transactions, activeTournamentId]);

  const currentDonations = useMemo(() => {
    if (!activeTournamentId) return [];
    return donations.filter(d => d.tournamentId === activeTournamentId);
  }, [donations, activeTournamentId]);

  const stats = useMemo(() => {
    const income = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDonations = currentDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    return {
      balance: income - expense + totalDonations,
      totalIncome: income, totalExpense: expense, totalDonations: totalDonations
    };
  }, [currentTransactions, currentDonations]);

  const activeTournamentName = useMemo(() => {
    if (!activeTournamentId) return '...';
    return tournaments.find(t => t.id === activeTournamentId)?.name || '...';
  }, [activeTournamentId, tournaments]);

  const openConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const handleShieldClick = () => {
    if (!isAdmin) { setShowLoginModal(true); setPasswordInput(''); }
    else {
      if (isAdminView) {
        openConfirm("Chế độ người xem", "Bạn muốn chuyển sang chế độ người xem?", () => { setIsAdminView(false); closeConfirm(); }, 'primary');
      } else {
        openConfirm("Chế độ quản lý", "Bạn muốn quay lại chế độ quản lý?", () => { setIsAdminView(true); closeConfirm(); }, 'primary');
      }
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'hoangyenfc@2026') { setIsAdmin(true); setIsAdminView(true); setShowLoginModal(false); setPasswordInput(''); }
    else { alert("Mật khẩu không chính xác!"); }
  };

  const goToFund = (id) => { setActiveTournamentId(id); setCurrentScreen('fund'); };
  const goHome = () => setCurrentScreen('home');

  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
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

  const handlePasteImage = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const compressedBase64 = await processImageFile(file);
        setNewTournamentImage(compressedBase64);
        break;
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressedBase64 = await processImageFile(file);
    setNewTournamentImage(compressedBase64);
  };

  // --- Handlers: Thêm/Sửa Thu Chi ---
  const openEditDataModal = (item, tab) => {
    setEditingData(item);
    setActiveTab(tab);
    setFormData({
      type: item.type || 'income',
      amount: formatNumberWithDots(item.amount),
      note: item.note || '',
      date: item.date,
      donorName: item.donorName || ''
    });
    setShowAddModal(true);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    if (!isAdmin || !isAdminView) return;
    try {
      const collectionName = activeTab === 'transactions' ? 'transactions' : 'donations';
      const timestamp = new Date().toISOString();
      
      const dataToSave = activeTab === 'transactions' ? {
        type: formData.type,
        amount: parseFormattedNumber(formData.amount),
        note: formData.note,
        date: formData.date,
        tournamentId: activeTournamentId,
        updatedAt: timestamp
      } : {
        donorName: formData.donorName,
        amount: parseFormattedNumber(formData.amount),
        note: formData.note,
        date: formData.date,
        tournamentId: activeTournamentId,
        updatedAt: timestamp
      };

      if (editingData) {
        await updateDoc(doc(db, collectionName, editingData.id), dataToSave);
      } else {
        // Thêm createdAt cho mục mới để hỗ trợ sắp xếp ties (cùng ngày)
        await addDoc(collection(db, collectionName), { ...dataToSave, createdAt: timestamp });
      }
      
      setShowAddModal(false);
      setEditingData(null);
      setFormData({ type: 'income', amount: '', note: '', date: new Date().toISOString().split('T')[0], donorName: '' });
    } catch (err) { console.error(err); }
  };

  const handleDeleteData = async (id, type) => {
    if (!isAdmin || !isAdminView) return;
    openConfirm("Xác nhận xóa", "Hành động này không thể hoàn tác.", async () => {
      try {
        const collectionName = type === 'transaction' ? 'transactions' : 'donations';
        await deleteDoc(doc(db, collectionName, id));
        closeConfirm();
      } catch (err) { console.error(err); }
    });
  };

  const openTournamentModal = (tournament = null) => {
    if (tournament) {
      setEditingTournament(tournament);
      setNewTournamentName(tournament.name);
      setNewTournamentImage(tournament.imageUrl || '');
    } else {
      setEditingTournament(null);
      setNewTournamentName('');
      setNewTournamentImage('');
    }
    setShowTournamentModal(true);
  };

  const handleSaveTournament = async (e) => {
    e.preventDefault();
    if (!isAdmin || !isAdminView || !newTournamentName.trim()) return;
    try {
      const timestamp = new Date().toISOString();
      if (editingTournament) {
        await updateDoc(doc(db, 'tournaments', editingTournament.id), { 
          name: newTournamentName.trim(), 
          imageUrl: newTournamentImage.trim(),
          updatedAt: timestamp
        });
      } else {
        await addDoc(collection(db, 'tournaments'), { 
          name: newTournamentName.trim(), 
          imageUrl: newTournamentImage.trim(), 
          createdAt: timestamp 
        });
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

  return (
    <IPhone14Frame>
      <div className="flex flex-col h-full select-none overflow-hidden relative">
        {/* Header */}
        <header className="pt-14 pb-4 px-6 flex justify-between items-center bg-[#f4f6f8] shrink-0 z-10 relative border-b border-slate-100">
          {currentScreen === 'home' ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                <Church size={22} strokeWidth={2.5} />
              </div>
              <div><h1 className="text-lg font-bold tracking-tight leading-tight">Hoàng Yên FC</h1><p className="text-xs font-medium text-slate-500">Quản lý các giải đấu</p></div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={goHome} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 active:scale-95 transition-transform">
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
              </button>
              <div><h1 className="text-lg font-bold tracking-tight leading-tight truncate max-w-[120px]">{activeTournamentName}</h1><p className="text-xs font-medium text-slate-500">Chi tiết thu chi</p></div>
            </div>
          )}
          <button onClick={handleShieldClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isAdmin ? (isAdminView ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600') : 'bg-slate-200/80 text-slate-500 hover:bg-slate-300'}`}>
            {isAdmin ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          </button>
        </header>

        {/* NỘI DUNG MÀN HÌNH CHÍNH */}
        {currentScreen === 'home' && (
          <main className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 pt-4 pb-6">
              <h2 className="text-[15px] font-bold text-slate-800 mb-4 px-1">Danh sách Giải đấu</h2>
              <div className="flex flex-col gap-5">
                {tournaments.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 bg-slate-200/50 rounded-[1.75rem] border border-slate-200 border-dashed">
                    <p className="text-sm font-medium">Chưa có giải đấu nào.</p>
                    {isAdmin && isAdminView && <p className="text-xs mt-1">Bấm dấu + ở góc dưới để thêm mới.</p>}
                  </div>
                ) : (
                  tournaments.map(t => (
                    <div key={t.id} onClick={() => goToFund(t.id)} className="relative h-[330px] rounded-[1.75rem] overflow-hidden shadow-[0_8px_20px_-8px_rgba(0,0,0,0.15)] cursor-pointer group active:scale-[0.98] transition-transform bg-slate-200">
                      <img src={t.imageUrl || defaultTournamentImg} alt={t.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-black/5"></div>
                      {isAdmin && isAdminView && (
                        <button onClick={(e) => { e.stopPropagation(); openTournamentModal(t); }} className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md p-2 rounded-xl text-white/80 hover:text-white border border-white/10 transition-colors z-20">
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 p-5 w-full pr-8">
                        <h3 className="text-white font-black text-[22px] leading-tight line-clamp-2 shadow-black/50 drop-shadow-md">{t.name}</h3>
                        <p className="text-white/80 text-sm font-medium mt-1 shadow-black/50 drop-shadow-sm">Xem chi tiết thu chi</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        )}

        {/* NỘI DUNG MÀN HÌNH CHI TIẾT QUỸ */}
        {currentScreen === 'fund' && (
          <main className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 mt-4">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-[1.5rem] shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-300 mb-1.5 opacity-90"><Wallet size={16} /><p className="text-sm font-medium tracking-wide">Số Dư Hiện Tại</p></div>
                  <h2 className="text-4xl font-black tracking-tight mb-7">{formatCurrency(stats.balance)}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5"><div className="flex items-center gap-1.5 text-emerald-400 mb-1"><TrendingUp size={14} strokeWidth={3} /><p className="text-[11px] font-bold uppercase tracking-wider">Tổng Thu</p></div><p className="font-bold text-sm tracking-wide">+{formatCurrency(stats.totalIncome + stats.totalDonations)}</p></div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5"><div className="flex items-center gap-1.5 text-rose-400 mb-1"><TrendingDown size={14} strokeWidth={3} /><p className="text-[11px] font-bold uppercase tracking-wider">Đã Chi</p></div><p className="font-bold text-sm tracking-wide">-{formatCurrency(stats.totalExpense)}</p></div>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>

            <div className="px-5 mt-6 mb-4">
              <div className="flex bg-slate-200/70 p-1.5 rounded-2xl">
                <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Giao Dịch</button>
                <button onClick={() => setActiveTab('donations')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'donations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Ủng Hộ</button>
              </div>
            </div>

            <div className="px-5 space-y-3">
              {(activeTab === 'transactions' ? currentTransactions : currentDonations).length === 0 ? (
                <div className="text-center py-10 text-slate-400"><p className="text-sm">Chưa có dữ liệu.</p></div>
              ) : (
                (activeTab === 'transactions' ? currentTransactions : currentDonations).map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-[1.25rem] flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-100/50">
                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'donations' ? 'bg-amber-50 text-amber-600' : item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {activeTab === 'donations' ? <Heart size={20} strokeWidth={2.5} /> : item.type === 'income' ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] truncate">{activeTab === 'donations' ? item.donorName : item.note}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{item.date}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className={`font-bold text-[15px] ${activeTab === 'donations' ? 'text-amber-600' : item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>{activeTab === 'donations' || item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</p>
                      {isAdmin && isAdminView && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditDataModal(item, activeTab)} className="text-slate-300 hover:text-emerald-500 p-1"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteData(item.id, activeTab === 'transactions' ? 'transaction' : 'donation')} className="text-slate-300 hover:text-rose-500 p-1"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        )}

        {/* Nút FAB */}
        {isAdmin && isAdminView && (
          <button onClick={() => { setEditingData(null); setShowAddModal(true); }} className="absolute bottom-10 right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        )}

        {/* Modal Thêm/Sửa Thu Chi & Ủng Hộ */}
        {showAddModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-[2rem] p-6 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{editingData ? 'Cập Nhật' : 'Thêm Mới'} {activeTab === 'transactions' ? 'Giao Dịch' : 'Ủng Hộ'}</h2>
                <button onClick={() => { setShowAddModal(false); setEditingData(null); }} className="bg-slate-100 p-2 rounded-full text-slate-500"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveData} className="space-y-4">
                {activeTab === 'transactions' && (
                  <div className="flex bg-slate-100/80 p-1.5 rounded-xl">
                    <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Khoản Thu</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Khoản Chi</button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">{activeTab === 'donations' ? 'Tên Người Ủng Hộ' : 'Nội Dung'}</label>
                  <input type="text" required placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none" value={activeTab === 'donations' ? formData.donorName : formData.note} onChange={(e) => activeTab === 'donations' ? setFormData({...formData, donorName: e.target.value}) : setFormData({...formData, note: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Số Tiền (VNĐ)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="0" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: formatNumberWithDots(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Ngày</label>
                    <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                {activeTab === 'donations' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-1">Ghi chú thêm</label>
                    <input type="text" placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                  </div>
                )}
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">XÁC NHẬN LƯU</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Thêm/Sửa Giải Đấu */}
        {showTournamentModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full rounded-t-[2rem] p-6 pt-3 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{editingTournament ? 'Cập Nhật Giải Đấu' : 'Thêm Giải Đấu Mới'}</h2>
                <button onClick={() => setShowTournamentModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 active:bg-slate-200 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleSaveTournament} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Tên Giải Đấu</label>
                  <input type="text" required placeholder="VD: Giải mùa hè 2026..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all" value={newTournamentName} onChange={(e) => setNewTournamentName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><ImageIcon size={14} /> Link Hoặc Dán Ảnh (Ctrl+V)</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="https://... hoặc Ctrl+V để dán" className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all" value={newTournamentImage} onChange={(e) => setNewTournamentImage(e.target.value)} onPaste={handlePasteImage} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 bg-slate-100 text-slate-600 px-4 rounded-xl border border-slate-200 flex items-center justify-center active:bg-slate-200 transition-colors"><Upload size={18} strokeWidth={2.5} /></button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  </div>
                  {newTournamentImage && <div className="mt-2 h-32 rounded-xl overflow-hidden border border-slate-200"><img src={newTournamentImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = defaultTournamentImg; }} /></div>}
                </div>
                <div className="pt-2 flex gap-3">
                  {editingTournament && <button type="button" onClick={handleDeleteTournament} className="py-4 px-5 bg-rose-50 text-rose-600 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-transform"><Trash2 size={20} /></button>}
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold text-[15px] shadow-lg active:scale-[0.98] transition-transform">{editingTournament ? 'LƯU THAY ĐỔI' : 'TẠO GIẢI ĐẤU'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLoginModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-slate-100 rounded-xl"><Lock size={20} strokeWidth={2.5} /></div>
                  <h2 className="text-xl font-bold tracking-tight">Quyền Quản Trị</h2>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 active:bg-slate-200 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Mật khẩu Admin</label>
                  <input type="password" required autoFocus placeholder="Nhập mật khẩu..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[15px] shadow-lg active:scale-[0.98] transition-transform mt-2">ĐĂNG NHẬP</button>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirm Modal */}
        {confirmModal.isOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <AlertCircle size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-3">{confirmModal.title}</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-2">{confirmModal.message}</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmModal.onConfirm} className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform ${confirmModal.type === 'danger' ? 'bg-rose-500' : 'bg-slate-900'}`}>XÁC NHẬN</button>
                <button onClick={closeConfirm} className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-transform">HỦY BỎ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </IPhone14Frame>
  );
}