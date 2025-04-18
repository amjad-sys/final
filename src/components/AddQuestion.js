import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Loading from './Loading';

const AddQuestion = () => {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState('trueFalse');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // حقل جديد لرابط الصورة
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let options = [];
      if (type === 'multipleChoice') {
        options = [option1, option2, option3, option4].filter(opt => opt.trim() !== '');
      }

      await addDoc(collection(db, 'questionLibrary'), {
        question,
        type,
        options,
        correctAnswer,
        imageUrl, // إضافة رابط الصورة
        used: false
      });
      setQuestion('');
      setType('trueFalse');
      setOption1('');
      setOption2('');
      setOption3('');
      setOption4('');
      setCorrectAnswer('');
      setImageUrl(''); // إعادة تعيين حقل الصورة
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (error) {
      setLoading(false);
      alert('خطأ: ' + error.message);
    }
  };

  return (
    <div className="add-question">
      {loading && <Loading message="جاري الإضافة..." />}
      <h2>إضافة سؤال</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="اكتب السؤال"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="trueFalse">صح/خطأ</option>
          <option value="multipleChoice">اختيار متعدد</option>
          <option value="openEnded">مفتوح</option>
        </select>

        {type === 'multipleChoice' && (
          <>
            <input
              type="text"
              placeholder="خيار ١"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="خيار ٢"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="خيار ٣"
              value={option3}
              onChange={(e) => setOption3(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="خيار ٤"
              value={option4}
              onChange={(e) => setOption4(e.target.value)}
              required
            />
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
            >
              <option value="" disabled>اختر الخيار الصحيح</option>
              <option value={option1}>خيار ١</option>
              <option value={option2}>خيار ٢</option>
              <option value={option3}>خيار ٣</option>
              <option value={option4}>خيار ٤</option>
            </select>
          </>
        )}

        {type === 'trueFalse' && (
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          >
            <option value="" disabled>اختر الإجابة الصحيحة</option>
            <option value="صح">صح</option>
            <option value="خطأ">خطأ</option>
          </select>
        )}

        {type === 'openEnded' && (
          <input
            type="text"
            placeholder="الإجابة الصحيحة"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          />
        )}

        {/* حقل إدخال رابط الصورة */}
        <input
          type="url"
          placeholder="رابط الصورة (اختياري)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <button type="submit">إضافة</button>
      </form>
    </div>
  );
};

export default AddQuestion;