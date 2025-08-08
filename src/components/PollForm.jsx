import React, { useState } from 'react';

const PollForm = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedOptions = options.filter(opt => opt.trim() !== '');
    if (!question.trim() || trimmedOptions.length < 2) {
      alert('Please enter a question and at least two options.');
      return;
    }

    // 🔗 Here we’ll later add Firebase logic
    console.log({ question, options: trimmedOptions });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your poll question"
          className="w-full p-2 border rounded-md"
        />
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="w-full p-2 border rounded-md"
          />
        ))}
        {options.length < 5 && (
          <button
            type="button"
            onClick={addOption}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Option
          </button>
        )}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Submit Poll
        </button>
      </form>
    </div>
  );
};

export default PollForm;
