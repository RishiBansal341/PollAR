import React, { useState } from 'react';
import { db } from './firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';

const PollForm = ({ user, fetchPolls, editingPollId, setEditingPollId }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to create a poll.');
      return;
    }

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA.');
      return;
    }

    const trimmedOptions = options.filter((opt) => opt.trim() !== '');
    if (!question.trim() || trimmedOptions.length < 2) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const geocodeRes = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${location.lat}+${location.lng}&key=8fca015a3aad4b63baa481774aee4902`
        );
        const geoData = await geocodeRes.json();
        const components = geoData.results[0]?.components || {};

        const locality =
          components.suburb ||
          components.neighbourhood ||
          components.village ||
          components.town ||
          components.locality ||
          components.city ||
          components.county ||
          components.state_district ||
          'Unknown';

        const pollData = {
          question,
          options: trimmedOptions.map((text) => ({ text, votes: 0 })),
          createdBy: user.uid,
          createdAt: new Date(),
          location,
          locality,
        };

        if (editingPollId) {
          await updateDoc(doc(db, 'polls', editingPollId), pollData);
          setEditingPollId(null);
        } else {
          await addDoc(collection(db, 'polls'), pollData);
        }

        setQuestion('');
        setOptions(['', '']);
        setRecaptchaToken(null);
        await fetchPolls(user, location);
        alert('✅ Poll created successfully!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location.');
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded-md space-y-4">
      <h2 className="text-xl font-semibold">Create a New Poll</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your poll question"
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      {options.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          value={opt}
          onChange={(e) => handleOptionChange(idx, e.target.value)}
          placeholder={`Option ${idx + 1}`}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      ))}
      {options.length < 5 && (
        <button
          type="button"
          onClick={handleAddOption}
          className="text-blue-500 hover:underline"
        >
          + Add Option
        </button>
      )}

      <ReCAPTCHA
        sitekey="YOUR_RECAPTCHA_SITE_KEY"
        onChange={handleRecaptchaChange}
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {editingPollId ? 'Update Poll' : 'Create Poll'}
      </button>
    </form>
  );
};

export default PollForm;
