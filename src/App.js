import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import QuestionManager from './components/QuestionManager';
import AddQuestion from './components/AddQuestion';
import UpdateQuestions from './components/UpdateQuestions';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setView('home');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setView('home');
      alert('تم تسجيل الخروج بنجاح');
    } catch (error) {
      alert('خطأ: ' + error.message);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <h1>لوحة تحكم الأسئلة</h1>
      <div className="button-group">
        <button onClick={() => setView('manage')}>إدارة الأسئلة</button>
        <button onClick={() => setView('add')}>إضافة سؤال</button>
        <button onClick={() => setView('update')}>تحديث الأسئلة</button>
        <button onClick={handleLogout}>تسجيل الخروج</button>
      </div>

      {view === 'manage' && <QuestionManager />}
      {view === 'add' && <AddQuestion />}
      {view === 'update' && <UpdateQuestions />}
    </div>
  );
};

export default App;