import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CreatePoll = () => {
  const [title, setTitle] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !option1 || !option2) return alert("Fill all fields");

    const pollData = {
      title,
      options: [
        { text: option1, votes: 0 },
        { text: option2, votes: 0 }
      ],
      createdAt: Timestamp.now()
    };

    try {
      await addDoc(collection(db, "polls"), pollData);
      alert("Poll created successfully!");
      setTitle(""); setOption1(""); setOption2("");
    } catch (err) {
      console.error("Error adding poll:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Create a Poll</h2>
      <input className="w-full border p-2" placeholder="Poll title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="w-full border p-2" placeholder="Option 1" value={option1} onChange={(e) => setOption1(e.target.value)} />
      <input className="w-full border p-2" placeholder="Option 2" value={option2} onChange={(e) => setOption2(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Create Poll</button>
    </form>
  );
};

export default CreatePoll;
