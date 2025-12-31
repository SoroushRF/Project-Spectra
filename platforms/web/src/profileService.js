const DEFAULT_SENSITIVITY = {
    'Angry': 1.0,
    'Disgust': 1.0,
    'Fear': 1.0,
    'Happy': 1.0,
    'Neutral': 1.0,
    'Sad': 1.0,
    'Surprise': 1.0
};

export const loadProfile = () => {
    const saved = localStorage.getItem('spectra_profile');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        user_id: 'default_user',
        sensitivity: { ...DEFAULT_SENSITIVITY }
    };
};

export const saveProfile = (profile) => {
    localStorage.setItem('spectra_profile', JSON.stringify(profile));
};

export const applySensitivity = (rawResults, sensitivity) => {
    return rawResults.map(res => ({
        ...res,
        score: res.score * (sensitivity[res.label] || 1.0)
    }));
};
