import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  name: string;
  phone: string;
  email?: string;
}

interface Intercom {
  id: string;
  name: string;
  address: {
    city: string;
    house: string;
    apartment: string;
  };
  brand: string;
  provider: string;
  image?: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reward: string;
}

const CITIES = ['Санкт-Петербург', 'Москва', 'Шушары'];
const BRANDS = ['Спутник', 'Бевард', 'Элтис', 'Визит'];
const PROVIDERS = ['Ростелеком', 'Дом.ру', 'Тат Телеком', 'Без провайдера'];

const INTERCOM_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop',
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Добавить 5 домофонов', description: 'Добавьте 5 домофонов в приложение', completed: false, reward: '+30 дней Premium' },
  { id: '2', title: 'Изменить свои данные', description: 'Отредактируйте имя или телефон в профиле', completed: false, reward: '+7 дней Premium' },
  { id: '3', title: 'Написать в поддержку', description: 'Отправьте сообщение в чат поддержки', completed: false, reward: '+3 дня Premium' },
  { id: '4', title: 'Написать соседям', description: 'Отправьте сообщение в чат с жильцами', completed: false, reward: '+3 дня Premium' },
];

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [intercoms, setIntercoms] = useState<Intercom[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedIntercom, setSelectedIntercom] = useState<Intercom | null>(null);
  const [showSantaCall, setShowSantaCall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  
  const [addStep, setAddStep] = useState(1);
  const [newIntercom, setNewIntercom] = useState({
    city: '',
    house: '',
    apartment: '',
    brand: '',
    provider: ''
  });

  const [editUser, setEditUser] = useState({ name: '', phone: '', email: '' });
  const [residentMessages, setResidentMessages] = useState<Message[]>([]);
  const [supportMessages, setSupportMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('dritoks_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedIntercoms = localStorage.getItem('dritoks_intercoms');
    if (savedIntercoms) {
      setIntercoms(JSON.parse(savedIntercoms));
    }

    const savedPremium = localStorage.getItem('dritoks_premium');
    const savedExpiry = localStorage.getItem('dritoks_premium_expiry');
    if (savedPremium === 'true') {
      setIsPremium(true);
      if (savedExpiry) {
        setPremiumExpiry(parseInt(savedExpiry));
      }
    }

    const savedTasks = localStorage.getItem('dritoks_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedResidentMessages = localStorage.getItem('dritoks_resident_messages');
    if (savedResidentMessages) {
      setResidentMessages(JSON.parse(savedResidentMessages));
    }

    const savedSupportMessages = localStorage.getItem('dritoks_support_messages');
    if (savedSupportMessages) {
      setSupportMessages(JSON.parse(savedSupportMessages));
    }
  }, []);

  useEffect(() => {
    if (premiumExpiry && premiumExpiry < Date.now()) {
      setIsPremium(false);
      localStorage.removeItem('dritoks_premium');
      localStorage.removeItem('dritoks_premium_expiry');
      toast.error('Premium подписка истекла');
    }
  }, [premiumExpiry]);

  const checkAndCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        task.completed = true;
        const days = parseInt(task.reward.match(/\d+/)?.[0] || '0');
        addPremiumDays(days);
        toast.success(`Задание выполнено! ${task.reward}`);
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem('dritoks_tasks', JSON.stringify(updatedTasks));
  };

  const addPremiumDays = (days: number) => {
    const currentExpiry = premiumExpiry || Date.now();
    const newExpiry = currentExpiry + (days * 24 * 60 * 60 * 1000);
    setPremiumExpiry(newExpiry);
    setIsPremium(true);
    localStorage.setItem('dritoks_premium', 'true');
    localStorage.setItem('dritoks_premium_expiry', newExpiry.toString());
  };

  const handleAuth = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    if (isLogin) {
      const savedUser = localStorage.getItem('dritoks_user');
      if (!savedUser) {
        toast.error('Аккаунт не зарегистрирован');
        setIsLogin(false);
        return;
      }
      const existingUser = JSON.parse(savedUser);
      if (existingUser.phone !== phone.trim()) {
        toast.error('Неверный номер телефона');
        return;
      }
    } else {
      addPremiumDays(30);
      toast.success('Пробный период 30 дней активирован! 🎉');
    }

    const userData = { name: name.trim(), phone: phone.trim() };
    localStorage.setItem('dritoks_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Добро пожаловать, ${userData.name}!`);
  };

  const handleDemo = () => {
    setIsDemoMode(true);
    setUser({ name: 'Демо', phone: '+7 (000) 000-00-00' });
    setIntercoms([
      {
        id: 'demo1',
        name: 'Домофон (Демо)',
        address: { city: 'Санкт-Петербург', house: '1', apartment: '1' },
        brand: 'Спутник',
        provider: 'Ростелеком',
        image: INTERCOM_IMAGES[0]
      }
    ]);
    toast.success('Демо-режим активирован');
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemoMode(false);
    setName('');
    setPhone('');
    setIntercoms([]);
    toast.success('Вы вышли из аккаунта');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены? Все данные будут удалены безвозвратно!')) {
      localStorage.removeItem('dritoks_user');
      localStorage.removeItem('dritoks_intercoms');
      localStorage.removeItem('dritoks_premium');
      localStorage.removeItem('dritoks_premium_expiry');
      localStorage.removeItem('dritoks_tasks');
      localStorage.removeItem('dritoks_resident_messages');
      localStorage.removeItem('dritoks_support_messages');
      setUser(null);
      setIntercoms([]);
      toast.success('Аккаунт удален');
    }
  };

  const handleAddIntercomStep = () => {
    if (addStep === 1) {
      if (!newIntercom.city) {
        toast.error('Выберите город');
        return;
      }
      setAddStep(2);
    } else if (addStep === 2) {
      if (!newIntercom.house) {
        toast.error('Введите номер дома');
        return;
      }
      setAddStep(3);
    } else if (addStep === 3) {
      if (!newIntercom.apartment) {
        toast.error('Введите номер квартиры');
        return;
      }
      setAddStep(4);
    } else if (addStep === 4) {
      if (!newIntercom.brand) {
        toast.error('Выберите марку домофона');
        return;
      }
      setAddStep(5);
    } else if (addStep === 5) {
      if (!newIntercom.provider) {
        toast.error('Выберите провайдера');
        return;
      }

      if (newIntercom.provider === 'Без провайдера') {
        toast.error('Без провайдера добавить домофон невозможно');
        return;
      }
      
      const intercom: Intercom = {
        id: Date.now().toString(),
        name: 'Домофон',
        address: {
          city: newIntercom.city,
          house: newIntercom.house,
          apartment: newIntercom.apartment
        },
        brand: newIntercom.brand,
        provider: newIntercom.provider,
        image: INTERCOM_IMAGES[Math.floor(Math.random() * INTERCOM_IMAGES.length)]
      };
      
      const updated = [...intercoms, intercom];
      setIntercoms(updated);
      if (!isDemoMode) {
        localStorage.setItem('dritoks_intercoms', JSON.stringify(updated));
        if (updated.length >= 5) {
          checkAndCompleteTask('1');
        }
      }
      
      setShowAddDialog(false);
      setAddStep(1);
      setNewIntercom({ city: '', house: '', apartment: '', brand: '', provider: '' });
      toast.success('Домофон добавлен!');
    }
  };

  const handleOpenIntercom = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKng77ZjGwU7k9rx');
    audio.play().catch(() => {});
    toast.success('Домофон открыт!');
  };

  const handleSaveProfile = () => {
    if (!editUser.name.trim() || !editUser.phone.trim()) {
      toast.error('Имя и телефон обязательны');
      return;
    }
    const updated = { name: editUser.name, phone: editUser.phone, email: editUser.email };
    setUser(updated);
    localStorage.setItem('dritoks_user', JSON.stringify(updated));
    setShowEditDialog(false);
    checkAndCompleteTask('2');
    toast.success('Профиль обновлен');
  };

  const handleDeleteIntercom = (id: string) => {
    if (window.confirm('Удалить этот домофон?')) {
      const updated = intercoms.filter(i => i.id !== id);
      setIntercoms(updated);
      localStorage.setItem('dritoks_intercoms', JSON.stringify(updated));
      setSelectedIntercom(null);
      toast.success('Домофон удален');
    }
  };

  const sendResidentMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: user?.name || 'Вы',
      text: newMessage,
      timestamp: Date.now()
    };
    const updated = [...residentMessages, msg];
    setResidentMessages(updated);
    localStorage.setItem('dritoks_resident_messages', JSON.stringify(updated));
    setNewMessage('');
    checkAndCompleteTask('4');
    
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'Сосед',
        text: 'Спасибо за сообщение! 👍',
        timestamp: Date.now()
      };
      const withReply = [...updated, reply];
      setResidentMessages(withReply);
      localStorage.setItem('dritoks_resident_messages', JSON.stringify(withReply));
    }, 2000);
  };

  const sendSupportMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'Вы',
      text: newMessage,
      timestamp: Date.now()
    };
    const updated = [...supportMessages, msg];
    setSupportMessages(updated);
    localStorage.setItem('dritoks_support_messages', JSON.stringify(updated));
    setNewMessage('');
    checkAndCompleteTask('3');

    setTimeout(() => {
      const answers = [
        'Спасибо за обращение! Мы работаем над вашим вопросом.',
        'Ваш домофон работает в штатном режиме.',
        'Для решения проблемы попробуйте перезагрузить приложение.',
        'Мы передали ваш запрос технической поддержке.',
        'Проблема решена! Проверьте статус домофона.'
      ];
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'Поддержка 24/7',
        text: answers[Math.floor(Math.random() * answers.length)],
        timestamp: Date.now()
      };
      const withReply = [...updated, reply];
      setSupportMessages(withReply);
      localStorage.setItem('dritoks_support_messages', JSON.stringify(withReply));
    }, 1500);
  };

  const getDaysLeft = () => {
    if (!premiumExpiry) return 0;
    return Math.max(0, Math.ceil((premiumExpiry - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-scale-in">
              <Icon name="DoorOpen" size={40} className="text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Дритокс</h1>
            <p className="text-white/90 text-sm">Управление домофоном</p>
          </div>
          
          <CardContent className="p-8">
            <div className="flex gap-2 mb-6">
              <Button
                variant={isLogin ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setIsLogin(true)}
              >
                Вход
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setIsLogin(false)}
              >
                Регистрация
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Имя</label>
                <Input
                  placeholder="Введите ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Номер телефона</label>
                <Input
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <Button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-opacity rounded-lg h-12 text-base font-semibold"
              >
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">или</span>
                </div>
              </div>

              <Button
                onClick={handleDemo}
                variant="outline"
                className="w-full rounded-lg h-12"
              >
                <Icon name="Play" size={20} className="mr-2" />
                Демо-режим
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Sheet>
        <div className="flex h-screen">
          <aside className="hidden md:flex w-72 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-950 text-white flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="DoorOpen" size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Дритокс</h2>
                  <p className="text-xs text-white/70">{user.name}</p>
                  {isPremium && <Badge className="mt-1 bg-yellow-500 text-xs">{getDaysLeft()}д Premium</Badge>}
                  {isDemoMode && <Badge className="mt-1 bg-blue-500 text-xs">Демо</Badge>}
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-auto">
              {[
                { id: 'home', icon: 'Home', label: 'Главная' },
                { id: 'intercoms', icon: 'DoorOpen', label: 'Домофоны' },
                { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
                { id: 'settings', icon: 'Settings', label: 'Настройки' },
                { id: 'payment', icon: 'CreditCard', label: 'Оплата' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-white/20 shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              {isWinter && (
                <button
                  onClick={() => setShowSantaCall(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-green-500 hover:opacity-90 transition-all animate-pulse"
                >
                  <Icon name="Phone" size={20} />
                  <span className="font-medium">Позвонить Деду Морозу 🎅</span>
                </button>
              )}
            </nav>

            <div className="p-4 border-t border-white/10">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <Icon name="LogOut" size={20} className="mr-3" />
                Выйти
              </Button>
            </div>
          </aside>

          <main className="flex-1 overflow-auto">
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Icon name="Menu" size={24} />
                    </Button>
                  </SheetTrigger>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {activeSection === 'home' && 'Главная'}
                    {activeSection === 'intercoms' && 'Домофоны'}
                    {activeSection === 'chats' && 'Чаты'}
                    {activeSection === 'settings' && 'Настройки'}
                    {activeSection === 'payment' && 'Оплата'}
                  </h1>
                </div>
                
                {activeSection === 'home' && !isDemoMode && (
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-full shadow-lg"
                    size="icon"
                  >
                    <Icon name="Plus" size={24} />
                  </Button>
                )}
              </div>
            </header>

            <div className="p-6">
              {activeSection === 'home' && (
                <div className="max-w-6xl mx-auto">
                  {intercoms.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Icon name="DoorOpen" size={48} className="text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Добавьте первый домофон</h3>
                      <p className="text-muted-foreground mb-6">Нажмите на кнопку "+" чтобы начать</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {intercoms.map((intercom) => (
                        <Card 
                          key={intercom.id} 
                          className="hover:shadow-xl transition-all hover-scale border-0 shadow-lg overflow-hidden group cursor-pointer"
                          onClick={() => setSelectedIntercom(intercom)}
                        >
                          <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
                          {intercom.image && (
                            <img src={intercom.image} alt="Камера домофона" className="w-full h-48 object-cover" />
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                                  <Icon name="DoorOpen" size={24} className="text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{intercom.name}</h3>
                                  <p className="text-sm text-muted-foreground">Активен</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="MapPin" size={16} />
                                <span>{intercom.address.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Home" size={16} />
                                <span>Дом {intercom.address.house}, кв. {intercom.address.apartment}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Radio" size={16} />
                                <span>{intercom.brand} • {intercom.provider}</span>
                              </div>
                            </div>

                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenIntercom();
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg"
                            >
                              <Icon name="Unlock" size={18} className="mr-2" />
                              Открыть
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'chats' && (
                <div className="max-w-4xl mx-auto">
                  <Tabs defaultValue="residents">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="residents">Чат с жильцами</TabsTrigger>
                      <TabsTrigger value="support">Поддержка 24/7</TabsTrigger>
                    </TabsList>

                    <TabsContent value="residents">
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Чат с жильцами</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px] mb-4 p-4 border rounded-lg">
                            {residentMessages.length === 0 ? (
                              <p className="text-center text-muted-foreground">Сообщений пока нет</p>
                            ) : (
                              <div className="space-y-4">
                                {residentMessages.map((msg) => (
                                  <div key={msg.id} className={`flex ${msg.sender === user.name || msg.sender === 'Вы' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === user.name || msg.sender === 'Вы' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100'}`}>
                                      <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                                      <p className="text-sm">{msg.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Напишите сообщение..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendResidentMessage()}
                              disabled={isDemoMode}
                            />
                            <Button onClick={sendResidentMessage} disabled={isDemoMode}>
                              <Icon name="Send" size={20} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="support">
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            Поддержка 24/7 
                            <Badge className="bg-green-500">Онлайн</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px] mb-4 p-4 border rounded-lg">
                            {supportMessages.length === 0 ? (
                              <div className="text-center text-muted-foreground">
                                <Icon name="Headphones" size={48} className="mx-auto mb-4 text-purple-600" />
                                <p>Задайте ваш вопрос, мы работаем 24/7!</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {supportMessages.map((msg) => (
                                  <div key={msg.id} className={`flex ${msg.sender === 'Вы' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'Вы' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-blue-100'}`}>
                                      <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                                      <p className="text-sm">{msg.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Напишите ваш вопрос..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
                            />
                            <Button onClick={sendSupportMessage}>
                              <Icon name="Send" size={20} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {activeSection === 'payment' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card className="border-0 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-8 text-center">
                      <Icon name="Crown" size={64} className="mx-auto mb-4 text-white" />
                      <h2 className="text-3xl font-bold text-white mb-2">Premium подписка</h2>
                      <p className="text-white/90">Безграничные возможности управления</p>
                      {isPremium && (
                        <div className="mt-4">
                          <Badge className="bg-white text-yellow-600 text-lg px-4 py-2">
                            Осталось {getDaysLeft()} дней
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-8">
                      <div className="space-y-4 mb-8">
                        {[
                          'Бесконечное количество домофонов',
                          'Безлимитное хранилище истории',
                          'Интеграция с Яндекс Умный Дом',
                          'Распознавание лиц',
                          'Генерация одноразовых кодов',
                          'Настройка внешнего вида домофонов',
                          'Выбор персонажа для звонка (Дед Мороз / Снегурочка)',
                          'Приоритетная поддержка 24/7'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                              <Icon name="Check" size={18} className="text-white" />
                            </div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <Button 
                          onClick={() => {
                            if (isDemoMode) {
                              toast.error('Демо-режим: оплата недоступна');
                              return;
                            }
                            addPremiumDays(30);
                            toast.success('Premium подписка продлена на 30 дней за 1₽!');
                          }}
                          disabled={isDemoMode}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 h-14 text-lg font-bold"
                        >
                          {isPremium ? 'Продлить за 1₽' : 'Подключить за 1₽'}
                        </Button>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">или получите бесплатно:</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Target" size={24} className="text-purple-600" />
                        Задания для получения Premium
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task.id} className={`p-4 border rounded-lg ${task.completed ? 'bg-green-50 border-green-200' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{task.title}</h4>
                                {task.completed && <Icon name="CheckCircle2" size={20} className="text-green-600" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              <Badge className={task.completed ? 'bg-green-500' : 'bg-purple-600'}>
                                {task.reward}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="User" size={24} className="text-purple-600" />
                        Профиль
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                          <span className="text-2xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                          <p className="text-muted-foreground">{user.phone}</p>
                          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                        </div>
                        <Button
                          onClick={() => {
                            if (isDemoMode) {
                              toast.error('Демо-режим: редактирование недоступно');
                              return;
                            }
                            setEditUser({ name: user.name, phone: user.phone, email: user.email || '' });
                            setShowEditDialog(true);
                          }}
                          variant="outline"
                          size="icon"
                          disabled={isDemoMode}
                        >
                          <Icon name="Pencil" size={20} />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full"
                        >
                          <Icon name="LogOut" size={20} className="mr-2" />
                          Выйти из аккаунта
                        </Button>
                        
                        {!isDemoMode && (
                          <Button
                            onClick={handleDeleteAccount}
                            variant="destructive"
                            className="w-full"
                          >
                            <Icon name="Trash2" size={20} className="mr-2" />
                            Удалить аккаунт
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Настройки провайдера</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {intercoms.length === 0 ? (
                        <p className="text-center text-muted-foreground">Домофоны не добавлены</p>
                      ) : (
                        intercoms.map((intercom) => (
                          <div key={intercom.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{intercom.name}</p>
                                <p className="text-sm text-muted-foreground">{intercom.provider}</p>
                              </div>
                              <Button variant="outline" size="sm" disabled={isDemoMode}>
                                Изменить
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {isPremium && (
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="Crown" size={24} className="text-yellow-500" />
                          Premium настройки
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Яндекс Умный Дом</span>
                            <Button variant="outline" size="sm" disabled={isDemoMode}>Подключить</Button>
                          </div>
                          <p className="text-sm text-muted-foreground">Управляйте домофоном голосом</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Распознавание лиц</span>
                            <Button variant="outline" size="sm" disabled={isDemoMode}>Настроить</Button>
                          </div>
                          <p className="text-sm text-muted-foreground">Автоматическое открытие для добавленных лиц</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Одноразовые коды</span>
                            <Button variant="outline" size="sm" disabled={isDemoMode}>Создать</Button>
                          </div>
                          <p className="text-sm text-muted-foreground">Генерация временных кодов доступа</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-950 text-white border-0">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="DoorOpen" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Дритокс</h2>
                <p className="text-xs text-white/70">{user.name}</p>
                {isPremium && <Badge className="mt-1 bg-yellow-500 text-xs">{getDaysLeft()}д Premium</Badge>}
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'home', icon: 'Home', label: 'Главная' },
              { id: 'intercoms', icon: 'DoorOpen', label: 'Домофоны' },
              { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
              { id: 'settings', icon: 'Settings', label: 'Настройки' },
              { id: 'payment', icon: 'CreditCard', label: 'Оплата' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? 'bg-white/20 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Icon name="LogOut" size={20} className="mr-3" />
              Выйти
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setAddStep(1);
          setNewIntercom({ city: '', house: '', apartment: '', brand: '', provider: '' });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить домофон - Шаг {addStep} из 5</DialogTitle>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Город</label>
                <Select value={newIntercom.city} onValueChange={(v) => setNewIntercom({...newIntercom, city: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Номер дома</label>
              <Input
                placeholder="12"
                value={newIntercom.house}
                onChange={(e) => setNewIntercom({...newIntercom, house: e.target.value})}
                maxLength={2}
                className="text-lg h-14"
              />
            </div>
          )}

          {addStep === 3 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Номер квартиры</label>
              <Input
                placeholder="45"
                value={newIntercom.apartment}
                onChange={(e) => setNewIntercom({...newIntercom, apartment: e.target.value})}
                maxLength={3}
                className="text-lg h-14"
              />
            </div>
          )}

          {addStep === 4 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Марка домофона</label>
              <div className="grid grid-cols-2 gap-3">
                {BRANDS.map((brand) => (
                  <Button
                    key={brand}
                    variant={newIntercom.brand === brand ? "default" : "outline"}
                    onClick={() => setNewIntercom({...newIntercom, brand})}
                    className="h-20"
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {addStep === 5 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Провайдер</label>
              <div className="space-y-3">
                {PROVIDERS.map((provider) => (
                  <Button
                    key={provider}
                    variant={newIntercom.provider === provider ? "default" : "outline"}
                    onClick={() => setNewIntercom({...newIntercom, provider})}
                    className="w-full h-16 text-lg"
                  >
                    {provider}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {addStep > 1 && (
              <Button variant="outline" onClick={() => setAddStep(addStep - 1)} className="flex-1">
                Назад
              </Button>
            )}
            <Button onClick={handleAddIntercomStep} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
              {addStep === 5 ? 'Добавить' : 'Далее'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedIntercom !== null} onOpenChange={(open) => !open && setSelectedIntercom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление домофоном</DialogTitle>
            <DialogDescription>
              {selectedIntercom && `${selectedIntercom.address.city}, дом ${selectedIntercom.address.house}, кв. ${selectedIntercom.address.apartment}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={() => {
                handleOpenIntercom();
                setSelectedIntercom(null);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-14"
            >
              <Icon name="Unlock" size={20} className="mr-2" />
              Открыть домофон
            </Button>
            <Button
              onClick={() => {
                toast.info('Редактирование домофона');
                setSelectedIntercom(null);
              }}
              variant="outline"
              className="w-full h-14"
              disabled={isDemoMode}
            >
              <Icon name="Edit" size={20} className="mr-2" />
              Редактировать
            </Button>
            <Button
              onClick={() => {
                if (selectedIntercom) handleDeleteIntercom(selectedIntercom.id);
              }}
              variant="destructive"
              className="w-full h-14"
              disabled={isDemoMode}
            >
              <Icon name="Trash2" size={20} className="mr-2" />
              Удалить домофон
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Имя</label>
              <Input
                value={editUser.name}
                onChange={(e) => setEditUser({...editUser, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Телефон</label>
              <Input
                value={editUser.phone}
                onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email (необязательно)</label>
              <Input
                type="email"
                placeholder="example@mail.ru"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSantaCall} onOpenChange={setShowSantaCall}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎅 Звонок Деду Морозу</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Icon name="Phone" size={64} className="text-white" />
            </div>
            <p className="text-lg mb-4">Дед Мороз на связи!</p>
            <p className="text-muted-foreground mb-6">
              {isPremium 
                ? '"Поздравляю с Новым годом! Все твои желания обязательно сбудутся! 🎄"'
                : '"С Новым годом! Будь здоров и счастлив! 🎄"'
              }
            </p>
            {isPremium && (
              <div className="space-y-2 mb-4">
                <Button variant="outline" className="w-full">Переключить на Снегурочку</Button>
              </div>
            )}
            <Button onClick={() => setShowSantaCall(false)} className="w-full bg-gradient-to-r from-red-500 to-green-500">
              Завершить звонок
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
