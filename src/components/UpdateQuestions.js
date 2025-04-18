import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc, query, where, limit, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Loading from './Loading';

const UpdateQuestions = () => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // جلب جميع المستندات من activeQuestions
      const activeQuestionsSnapshot = await getDocs(collection(db, 'activeQuestions'));

      // حذف الأسئلة فقط (استثناء control)
      const deleteBatch = writeBatch(db);
      activeQuestionsSnapshot.forEach(docSnapshot => {
        if (docSnapshot.id !== 'control') {
          deleteBatch.delete(docSnapshot.ref);
        }
      });
      await deleteBatch.commit();

      // إضافة 5 أسئلة من كل نوع
      const types = ['trueFalse', 'multipleChoice', 'openEnded'];
      let totalQuestionsAdded = 0;
      const updateBatch = writeBatch(db);

      for (const type of types) {
        const q = query(
          collection(db, 'questionLibrary'),
          where('type', '==', type),
          where('used', '==', false),
          limit(5)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(docSnapshot => {
            const qData = docSnapshot.data();
            updateBatch.set(doc(db, 'activeQuestions', docSnapshot.id), {
              ...qData,
              imageUrl: qData.imageUrl || '' // التأكد من نقل imageUrl
            });
            updateBatch.update(doc(db, 'questionLibrary', docSnapshot.id), { used: true });
            totalQuestionsAdded++;
          });
        }
      }

      // التحقق من عدد الأسئلة
      if (totalQuestionsAdded < 15) {
        alert(`تحذير: تم إضافة ${totalQuestionsAdded} أسئلة فقط بسبب نقص الأسئلة المتوفرة في مكتبة الأسئلة.`);
      }

      // تحديث expirationTime في control
      const newExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      updateBatch.set(doc(db, 'activeQuestions', 'control'), {
        expirationTime: newExpirationTime
      }, { merge: true });

      // تنفيذ التحديثات
      await updateBatch.commit();

      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (error) {
      setLoading(false);
      alert('خطأ: ' + error.message);
    }
  };

  return (
    <div className="update-questions">
      {loading && <Loading message="جاري التحديث..." />}
      <h2>تحديث الأسئلة</h2>
      <button onClick={handleUpdate}>تحديث الآن</button>
    </div>
  );
};

export default UpdateQuestions;