import { useEffect, useState } from 'react';
import './App.css';
import { db, auth, provider } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';



function App() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);
  const [myPolls, setMyPolls] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [editingPollId, setEditingPollId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [allPolls, setAllPolls] = useState([]);




  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#af19ff'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        await fetchPolls(auth.currentUser, location);
      },
      (error) => {
        console.error("Location access denied:", error);
        setUserLocation(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchPolls = async (currUser, location = userLocation) => {
    const snapshot = await getDocs(collection(db, 'polls'));
    const allPolls = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredPolls = location
      ? allPolls.filter((poll) => {
          if (!poll.location) return false;
          const dLat = (poll.location.lat - location.lat) * (Math.PI / 180);
          const dLng = (poll.location.lng - location.lng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(location.lat * (Math.PI / 180)) *
              Math.cos(poll.location.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = 6371 * c;
          return distance <= 3;
        })
      : [];

    setPolls(filteredPolls);
    setAllPolls(allPolls); // Add this


    if (currUser) {
      const q = query(collection(db, 'polls'), where('createdBy', '==', currUser.uid));
      const mySnap = await getDocs(q);
      const myPollList = mySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyPolls(myPollList);
    } else {
      setMyPolls([]);
    }
  };

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = () => {
    signOut(auth);
    setActiveTab('all');
  };

  const handleAddOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert('Please sign in to create a poll.');
    return;
  }
  if (!recaptchaToken) {
  alert('Please verify that you are not a robot.');
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

      try {
        const geocodeRes = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${location.lat}+${location.lng}&key=8fca015a3aad4b63baa481774aee4902`
        );
        const geoData = await geocodeRes.json();
        const components = geoData.results[0]?.components || {};

        const locality =
          components.suburb ||
          components.neighbourhood ||
          components.locality ||
          (components.state_district + ', ' + components.county) ||
          components.city ||
          components.town ||
          components.village ||
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
        await fetchPolls(user, location);

        // ✅ Show success alert
        alert("✅ Poll created successfully!");
      } catch (error) {
        console.error("Error creating poll:", error);
        alert("❌ Failed to create poll.");
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("❌ Failed to get your location.");
    }
  );
};


  const handleVote = async (pollId, optionIndex) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || [];
    if (votedPolls.includes(pollId)) return;

    const pollRef = doc(db, 'polls', pollId);
    const pollToUpdate = [...polls, ...myPolls].find((p) => p.id === pollId);
    if (!pollToUpdate) return;

    const updatedOptions = [...pollToUpdate.options];
    updatedOptions[optionIndex].votes += 1;

    await updateDoc(pollRef, { options: updatedOptions });
    await fetchPolls(user);

    votedPolls.push(pollId);
    localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    await deleteDoc(doc(db, 'polls', pollId));
    await fetchPolls(user);
  };

  const handleEdit = (poll) => {
    setEditingPollId(poll.id);
    setQuestion(poll.question);
    setOptions(poll.options.map((opt) => opt.text));
    setActiveTab('my');
  };

  const renderPoll = (poll, isEditable = false) => {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || [];
    const hasVoted = votedPolls.includes(poll.id);
    

    const chartData = poll.options.map((opt) => ({
      name: opt.text,
      value: opt.votes,
    }));

    const createdAt = poll.createdAt?.toDate ? poll.createdAt.toDate() : new Date(poll.createdAt);
    const formattedDate = createdAt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    
    return (
      <div key={poll.id} style={pollCardStyle}>
        <div style={{ fontSize: '15px', color: '#777', marginBottom: '4px' }}>
          🕒 Posted on: <strong>{formattedDate}</strong>
        </div>
        <div style={{ fontSize: '15px', color: '#777', marginBottom: '4px' }}>
          📍 Locality: <strong>{poll.locality || 'Unknown'}</strong>
        </div>
        <strong>{poll.question}</strong>
        {poll.options.map((option, idx) => (
          <div key={idx} style={{ marginTop: '0.5rem' }}>
            <span>{option.text} — <strong>{option.votes} votes</strong></span>
            {totalVotes > 0 && (
              <span> ({((option.votes / totalVotes) * 100).toFixed(1)}%)</span>
            )}
            <button
              disabled={hasVoted}
              onClick={() => handleVote(poll.id, idx)}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: hasVoted ? '#ccc' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: hasVoted ? 'not-allowed' : 'pointer',
              }}
            >
              Vote
            </button>
          </div>
        ))}

        {hasVoted && (
          <>
            <p style={{ color: 'green' }}>✅ You’ve already voted on this poll.</p>
            <PieChart width={300} height={200}>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={70} label>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </>
        )}

        {isEditable && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => handleEdit(poll)} style={{ marginRight: '10px' }}>✏️ Edit</button>
            <button onClick={() => handleDelete(poll.id)} style={{ color: 'red' }}>🗑 Delete</button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length < 2) return setSuggestions([]);

      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${searchQuery}&key=8fca015a3aad4b63baa481774aee4902&limit=5`
      );
      const data = await res.json();
      const places = data.results.map(
        (r) => r.components.suburb || r.components.city || r.formatted
      );
      setSuggestions([...new Set(places)].filter(Boolean));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const searchFilteredPolls = allPolls.filter((p) =>
  p.locality?.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <div style={{ fontFamily: 'Times New Roman ,Times, serif', background: '#93c8e0ff', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', fontSize: '30px' }}>📊 PollAR</div>
        <div>
          <button onClick={() => setActiveTab('all')} style={navBtnStyle}>Polls in My Area</button>
          <button onClick={() => setActiveTab('search')} style={navBtnStyle}>Search by Locality</button>
          {user && <button onClick={() => setActiveTab('my')} style={navBtnStyle}>My Polls</button>}
          <button onClick={() => setActiveTab('heatmap')} style={navBtnStyle}> Heatmap</button>
        
          {user ? (
            <>
              <span style={{ marginLeft: '1rem' }} >{user.displayName}</span>
              <img src={user.photoURL} alt="profile" style={{ height: '30px', borderRadius: '50%', marginLeft: '10px' }} />
              <button onClick={handleSignOut} style={{ marginLeft: '1rem' }}>Sign Out</button>
            </>
          ) : (
            <button onClick={handleSignIn}>Sign in with Google</button>
          )}
          
        </div>
      </nav>

      <div style={{ padding: '2rem' }}>
        <h1>{editingPollId ? 'Edit Poll' : 'Create a New Poll'}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your poll question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={inputStyle}
          />
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              style={inputStyle}
            />
          ))}
          <ReCAPTCHA
          sitekey="6Ld3qpsrAAAAAJ87MeH6wnaunaCj1oKxOGY7mpDY"
          onChange={(token) => setRecaptchaToken(token)}
/>

          <button type="button" onClick={handleAddOption}>+ Add Option</button>
          <button type="submit" style={{ marginLeft: '10px' }}>{editingPollId ? 'Update' : 'Submit Poll'}</button>
        </form>
        {activeTab === 'heatmap' && (
      
  <div style={{ height: '500px', width: '100%', marginTop: '20px'}}>
    <h2>Heatmap of Poll Activity</h2>
    
    <MapContainer
      center={[26.8546, 75.8151, 1]} // Jaipur coordinates (default)
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Heatmap polls={polls} />
    </MapContainer>
  </div>
)}

        <hr style={{ margin: '2rem 0' }} />

        {activeTab === 'all' ? (
          <>
            <h2>Polls in My Area (within 3km)</h2>
            {polls.length === 0 ? <p>No polls found in your area.</p> : polls.map((poll) => renderPoll(poll))}
          </>
        ) : activeTab === 'search' ? (
          <>
            <h2>Search Polls by Locality</h2>
            <input
              type="text"
              placeholder="Enter locality name (e.g., Malviya Nagar)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
            {suggestions.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    onClick={() => setSearchQuery(suggestion)}
                    style={{ cursor: 'pointer', padding: '4px 0', color: '#007bff' }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            {searchFilteredPolls.length === 0 ? <p>No polls found in that locality.</p> : searchFilteredPolls.map((poll) => renderPoll(poll))}
          </>
        ) : (
          <>
            <h2>My Polls</h2>
            {myPolls.length === 0 ? <p>No polls yet.</p> : myPolls.map((poll) => renderPoll(poll, true))}
          </>
        )}
      </div>
    </div>
    
  );
}
function Heatmap({ polls }) {
  const map = useMap();

  useEffect(() => {
  if (!polls.length) {
    console.log('⛔ No polls to render heatmap.');
    return;
  }

  const heatData = polls
  .filter((poll) => poll.location?.lat && poll.location?.lng)
  .map((poll) => [poll.location.lat, poll.location.lng, 1]);


  console.log('🔥 Heat data points:', heatData); // <--- Add this

  const heatLayer = L.heatLayer(heatData, {
    radius: 25,
    blur: 10,
    maxZoom: 17,
  });

  heatLayer.addTo(map);

  return () => {
    heatLayer.remove();
  };
}, [polls, map]);


  return null;
}


const navStyle = {
  backgroundColor: '#6c5ce7',
  color: 'white',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between'
};

const navBtnStyle = {
  backgroundColor: '#dea8f1ff',
  color: 'black',
  border: 'none',
  marginRight: '10px',
  padding: '8px 12px',
  borderRadius: '6px',
  cursor: 'pointer'
};

const inputStyle = {
  display: 'block',
  marginBottom: '10px',
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const pollCardStyle = {
  background: '#fff',
  padding: '1rem',
  marginBottom: '1rem',
  borderRadius: '8px'
};

export default App;
