import React, { useState } from 'react';
import { submitComplaint } from '../services/api';
import UploadImage from './UploadImage';

const ComplaintForm = ({ onComplaintSubmitted }) => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Safe User Retrieval
    const getUser = () => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    };

    const user = getUser();
    const userId = user?.id || user?._id;

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setDescription((prev) => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert("Browser does not support speech recognition.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            setError('You must be logged in to submit a complaint.');
            return;
        }

        if (!description) { // Image is optional often, but let's see. logic said description OR image before? No, code said !description || !image.
            // keeping original logic but checking verification
            if (!description || !image) {
                setError('Please provide a description and an image.');
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('description', description);
        formData.append('image', image);

        try {
            await submitComplaint(formData);
            setSuccess('Complaint submitted successfully!');
            setDescription('');
            setImage(null);
            if (onComplaintSubmitted) onComplaintSubmitted();
        } catch (err) {
            setError('Failed to submit complaint. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">File a New Complaint</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <div className="relative">
                        <textarea
                            className="input-field h-32 pr-10" // Pad right for mic icon
                            placeholder="Describe the issue OR Click the mic to speak..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={startListening}
                            className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Speak description"
                        >
                            🎤
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (AI Detected)</label>
                    <UploadImage onImageUpload={setImage} />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary disabled:bg-blue-300"
                >
                    {loading ? 'Submitting & AI Analyzing...' : 'Submit Complaint'}
                </button>
            </form>
        </div>
    );
};

export default ComplaintForm;
