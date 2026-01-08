import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  name: string;
  phone: string;
}

interface Intercom {
  id: string;
  name: string;
  address: {
    city: string;
    house: string;
    apartment: string;
  };
  brand?: string;
  provider?: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [intercoms, setIntercoms] = useState<Intercom[]>([]);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('dritoks_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedIntercoms = localStorage.getItem('dritoks_intercoms');
    if (savedIntercoms) {
      setIntercoms(JSON.parse(savedIntercoms));
    }
  }, []);

  const handleAuth = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const userData = { name: name.trim(), phone: phone.trim() };
    localStorage.setItem('dritoks_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Добро пожаловать, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setName('');
    setPhone('');
    localStorage.removeItem('dritoks_user');
    toast.success('Вы вышли из аккаунта');
  };

  const addIntercom = () => {
    const newIntercom: Intercom = {
      id: Date.now().toString(),
      name: 'Домофон',
      address: {
        city: 'Санкт-Петербург',
        house: '12',
        apartment: '45'
      }
    };
    const updated = [...intercoms, newIntercom];
    setIntercoms(updated);
    localStorage.setItem('dritoks_intercoms', JSON.stringify(updated));
    toast.success('Домофон добавлен');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: 'home', icon: 'Home', label: 'Главная' },
                { id: 'intercoms', icon: 'DoorOpen', label: 'Домофоны' },
                { id: 'settings', icon: 'Settings', label: 'Настройки' },
                { id: 'payment', icon: 'CreditCard', label: 'Оплата' },
                { id: 'profile', icon: 'User', label: 'Профиль' }
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
                    {activeSection === 'settings' && 'Настройки'}
                    {activeSection === 'payment' && 'Оплата'}
                    {activeSection === 'profile' && 'Профиль'}
                  </h1>
                </div>
                
                {activeSection === 'home' && (
                  <Button
                    onClick={addIntercom}
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
                        <Card key={intercom.id} className="hover:shadow-xl transition-all hover-scale border-0 shadow-lg overflow-hidden group">
                          <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
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
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="MoreVertical" size={20} />
                              </Button>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="MapPin" size={16} />
                                <span>{intercom.address.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Home" size={16} />
                                <span>Дом {intercom.address.house}, кв. {intercom.address.apartment}</span>
                              </div>
                            </div>

                            <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg">
                              Открыть
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="max-w-2xl mx-auto">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                          <span className="text-3xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
                          <p className="text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Подписка</span>
                            <span className="text-sm text-muted-foreground">Базовый план</span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Домофонов</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {intercoms.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'home', icon: 'Home', label: 'Главная' },
              { id: 'intercoms', icon: 'DoorOpen', label: 'Домофоны' },
              { id: 'settings', icon: 'Settings', label: 'Настройки' },
              { id: 'payment', icon: 'CreditCard', label: 'Оплата' },
              { id: 'profile', icon: 'User', label: 'Профиль' }
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
    </div>
  );
}
