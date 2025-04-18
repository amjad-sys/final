import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Loading from './Loading';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editType, setEditType] = useState('');
  const [editImageUrl, setEditImageUrl] = useState(''); // حقل جديد لرابط الصورة
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questionLibrary'));
        const fetchedQuestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          options: doc.data().options || [],
          imageUrl: doc.data().imageUrl || '' // إضافة imageUrl
        }));
        setQuestions(fetchedQuestions);
      } catch (error) {
        alert('خطأ: ' + error.message);
      }
    };
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'questionLibrary', id));
      setQuestions(questions.filter(q => q.id !== id));
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (error) {
      setLoading(false);
      alert('خطأ: ' + error.message);
    }
  };

  const startEditing = (q) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question);
    setEditType(q.type);
    setEditCorrectAnswer(q.correctAnswer);
    setEditImageUrl(q.imageUrl || ''); // تحميل رابط الصورة
    setEditOptions(q.type === 'multipleChoice' ? [...q.options, ...Array(4 - q.options.length).fill('')] : ['', '', '', '']);
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const optionsToSave = editType === 'multipleChoice' ? editOptions.filter(opt => opt.trim() !== '') : [];
      await updateDoc(doc(db, 'questionLibrary', id), {
        question: editQuestionText,
        type: editType,
        correctAnswer: editCorrectAnswer,
        options: optionsToSave,
        imageUrl: editImageUrl // تحديث رابط الصورة
      });
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, question: editQuestionText, type: editType, correctAnswer: editCorrectAnswer, options: optionsToSave, imageUrl: editImageUrl } : q
      ));
      setEditingQuestionId(null);
      setEditQuestionText('');
      setEditOptions(['', '', '', '']);
      setEditCorrectAnswer('');
      setEditType('');
      setEditImageUrl('');
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (error) {
      setLoading(false);
      alert('خطأ: ' + error.message);
    }
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditQuestionText('');
    setEditOptions(['', '', '', '']);
    setEditCorrectAnswer('');
    setEditType('');
    setEditImageUrl('');
  };

  return (
    <div className="question-manager">
      {loading && <Loading message="جاري التحديث..." />}
      <h2>إدارة الأسئلة</h2>
      {questions.length === 0 ? (
        <p>لا توجد أسئلة لعرضها</p>
      ) : (
        questions.map(q => (
          <div key={q.id} className="question-item">
            {editingQuestionId === q.id ? (
              <>
                <input
                  type="text"
                  value={editQuestionText}
                  onChange={(e) => setEditQuestionText(e.target.value)}
                  placeholder="تعديل السؤال"
                  style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                  required
                />
                {editType === 'multipleChoice' && (
                  <>
                    <input
                      type="text"
                      value={editOptions[0]}
                      onChange={(e) => setEditOptions([e.target.value, editOptions[1], editOptions[2], editOptions[3]])}
                      placeholder="خيار ١"
                      style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                      required
                    />
                    <input
                      type="text"
                      value={editOptions[1]}
                      onChange={(e) => setEditOptions([editOptions[0], e.target.value, editOptions[2], editOptions[3]])}
                      placeholder="خيار ٢"
                      style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                      required
                    />
                    <input
                      type="text"
                      value={editOptions[2]}
                      onChange={(e) => setEditOptions([editOptions[0], editOptions[1], e.target.value, editOptions[3]])}
                      placeholder="خيار ٣"
                      style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                      required
                    />
                    <input
                      type="text"
                      value={editOptions[3]}
                      onChange={(e) => setEditOptions([editOptions[0], editOptions[1], editOptions[2], e.target.value])}
                      placeholder="خيار ٤"
                      style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                      required
                    />
                    <select
                      value={editCorrectAnswer}
                      onChange={(e) => setEditCorrectAnswer(e.target.value)}
                      required
                    >
                      <option value="" disabled>اختر الخيار الصحيح</option>
                      {editOptions.map((opt, index) => (
                        <option key={index} value={opt}>خيار {index + 1}</option>
                      ))}
                    </select>
                  </>
                )}
                {editType === 'trueFalse' && (
                  <select
                    value={editCorrectAnswer}
                    onChange={(e) => setEditCorrectAnswer(e.target.value)}
                    required
                  >
                    <option value="" disabled>اختر الإجابة الصحيحة</option>
                    <option value="صح">صح</option>
                    <option value="خطأ">خطأ</option>
                  </select>
                )}
                {editType === 'openEnded' && (
                  <input
                    type="text"
                    value={editCorrectAnswer}
                    onChange={(e) => setEditCorrectAnswer(e.target.value)}
                    placeholder="الإجابة الصحيحة"
                    style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                    required
                  />
                )}
                {/* حقل تعديل رابط الصورة */}
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="رابط الصورة (اختياري)"
                  style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                />
                <button onClick={() => handleEdit(q.id)}>حفظ التعديل</button>
                <button onClick={cancelEditing}>إلغاء</button>
              </>
            ) : (
              <>
                <p><strong>السؤال:</strong> {q.question}</p>
                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt="صورة السؤال"
                    style={{ width: '300px', height: '200px', objectFit: 'contain', margin: '10px 0' }}
                  />
                )}
                <p><strong>النوع:</strong> {q.type}</p>
                <p><strong>الإجابة الصحيحة:</strong> {q.correctAnswer}</p>
                {q.options.length > 0 && <p><strong>الخيارات:</strong> {q.options.join(', ')}</p>}
                <button onClick={() => startEditing(q)}>تعديل</button>
                <button onClick={() => handleDelete(q.id)}>حذف</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionManager;