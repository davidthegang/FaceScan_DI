// Use strict mode for better error detection
"use strict";

// Import React hooks
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// --- CONSTANTS ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyPBipQMaJ9d8UQg2BdVXPw6ycZHb4hxcNfiJEW4LFZvceXo62UjkDCZEP7JwqJw_4u/exec';
const FACE_MATCH_THRESHOLD = 0.5; // Stricter verification
const MODEL_URL = './weights';

// --- CONTEXT for Theme and Language ---
const AppContext = createContext();

const useAppContext = () => useContext(AppContext);

function AppProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [lang, setLang] = useState('kh'); // Default to Khmer
    const [color, setColor] = useState(() => localStorage.getItem('color') || 'theme-indigo');

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const root = document.body;
        root.classList.remove('theme-indigo', 'theme-blue', 'theme-green', 'theme-red');
        root.classList.add(color);
        localStorage.setItem('color', color);
    }, [color]);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const value = { theme, setTheme, lang, setLang, color, setColor };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- TRANSLATION (i18n) ---
const translations = {
    kh: {
        loading: "កំពុងទាញទិន្នន័យប្រព័ន្ធ...",
        loginTitle: "ប្រព័ន្ធគ្រប់គ្រង",
        loginSubtitle: "សូមជ្រើសរើសឈ្មោះរបស់អ្នកដើម្បីចូល",
        selectName: "-- សូមជ្រើសរើសឈ្មោះ --",
        continue: "បន្ត",
        loadingAdmins: "កំពុងទាញទិន្នន័យ Admin...",
        errorLoadingAdmins: "Error loading admins",
        loadingRefFace: "កំពុងរៀបចំកាមេរ៉ា...", // Changed this text
        verifying: "កំពុងផ្ទៀងផ្ទាត់...",
        faceNotFound: "រកមិនឃើញមុខ. សូមព្យាយាមម្តងទៀត.",
        faceNoMatch: "មុខមិនត្រឹមត្រូវ. សូមព្យាយាមម្តងទៀត.",
        welcome: "សូមស្វាគមន៍",
        centerFace: "សូមដាក់មុខនៅចំកណ្តាល",
        allowCamera: "Please allow camera access.",
        back: "Back",
        verifyPhoto: "Verify Photo",
        // Main App
        navScan: "ថតរូប",
        navProfile: "គណនី",
        navList: "ទិន្នន័យនិស្សិត",
        navRecords: "រូបភាពបានរក្សាទុក",
        navSettings: "ការកំណត់",
        navLogout: "ចាកចេញ",
        // Header
        headerTitle: "គ្រប់គ្រងទិន្នន័យរូបភាព",
        // Scan Page
        scanTitle: "ប្រព័ន្ធស្កេនមុខឌីជីថល",
        scanSubtitle: "សូមជ្រើសរើសអត្តលេខរបស់អ្នក",
        searchPlaceholder: "ស្វែងរកអត្តលេខ ឬឈ្មោះ...",
        loadingStudents: "Loading students...",
        noStudentsFound: "No students found.",
        scanningFor: "Scanning for",
        confirmPhoto: "Confirm your photo",
        cameraModeModal: "សូមជ្រើសរើសប្រតិបត្តិកាមេរ៉ា",
        autoCapture: "ថតរូបស្វ័យប្រវត្តិ",
        manualCapture: "ថតរូបដោយខ្លួនឯង",
        cameraStatusReady: "ចុចប៊ូតុងកាមេរ៉ាដើម្បីថត",
        cameraStatusScanning: "Please center your face",
        cameraStatusSuccess: "Excellent!",
        upload: "បញ្ជូនរូបភាព",
        retake: "ថតម្តងទៀត",
        uploading: "Uploading...",
        uploadSuccess: "Image saved successfully!",
        uploadFailed: "Upload failed",
        // List Page
        listTitle: "ទិន្នន័យរូបភាពនិស្សិត",
        allStudents: "All Students",
        withPhotos: "With Photos",
        totalStudents: "ចំនួននិស្សិតសរុប",
        studentsWithPhotos: "និស្សិតមានរូបភាព",
        studentsNoPhotos: "និស្សិតគ្មានរូបភាព",
        status: "Status",
        // Records Page
        recordsTitle: "រូបភាពបានរក្សាទុក",
        allClasses: "All Classes",
        id: "ID",
        name: "ឈ្មោះ",
        class: "ថ្នាក់",
        group: "ក្រុម",
        image: "រូបភាព",
        action: "កែ",
        deleteConfirm: "Are you sure you want to delete this record?",
        cancel: "Cancel",
        delete: "Delete",
        deleting: "Deleting...",
        deleteSuccess: "Record deleted!",
        deleteFailed: "Delete failed",
        // Profile Page
        profileTitle: "គណនី",
        adminProfile: "Admin Profile",
        dashboard: "ផ្ទាំងគ្រប់គ្រងទិន្នន័យ",
        // Settings Page
        settingsTitle: "ការកំណត់",
        appearance: "រូបរាង",
        language: "ភាសា",
        theme: "Theme",
        light: "ពន្លឺថ្ងៃ",
        dark: "ពន្លឺយប់",
        color: "ពណ៌",
    },
    en: {
        loading: "Loading system data...",
        loginTitle: "Management System",
        loginSubtitle: "Please select your name to login",
        selectName: "-- Select Name --",
        continue: "Continue",
        loadingAdmins: "Loading Admins...",
        errorLoadingAdmins: "Error loading admins",
        loadingRefFace: "Preparing camera...", // Changed this text
        verifying: "Verifying...",
        faceNotFound: "Face not found. Please try again.",
        faceNoMatch: "Face does not match. Please try again.",
        welcome: "Welcome",
        centerFace: "Please center your face",
        allowCamera: "Please allow camera access.",
        back: "Back",
        verifyPhoto: "Verify Photo",
        // Main App
        navScan: "Scan Photo",
        navProfile: "Profile",
        navList: "Student List",
        navRecords: "Saved Records",
        navSettings: "Settings",
        navLogout: "Logout",
        // Header
        headerTitle: "Image Data Management System",
        // Scan Page
        scanTitle: "Digital Face Scan System",
        scanSubtitle: "Select your ID",
        searchPlaceholder: "Search ID or Name...",
        loadingStudents: "Loading students...",
        noStudentsFound: "No students found.",
        scanningFor: "Scanning for",
        confirmPhoto: "Confirm your photo",
        cameraModeModal: "Please select camera mode",
        autoCapture: "Auto Capture",
        manualCapture: "Manual Capture",
        cameraStatusReady: "Press the camera button to capture",
        cameraStatusScanning: "Please center your face",
        cameraStatusSuccess: "Excellent!",
        upload: "Upload Image",
        retake: "Retake",
        uploading: "Uploading...",
        uploadSuccess: "Image saved successfully!",
        uploadFailed: "Upload failed",
        // List Page
        listTitle: "Student Data List",
        allStudents: "All Students",
        withPhotos: "With Photos",
        totalStudents: "Total Students",
        studentsWithPhotos: "Students with Photos",
        studentsNoPhotos: "Students without Photos",
        status: "Status",
        // Records Page
        recordsTitle: "Saved Records",
        allClasses: "All Classes",
        id: "ID",
        name: "Name",
        class: "Class",
        group: "Group",
        image: "Image",
        action: "Action",
        deleteConfirm: "Are you sure you want to delete this record?",
        cancel: "Cancel",
        delete: "Delete",
        deleting: "Deleting...",
        deleteSuccess: "Record deleted!",
        deleteFailed: "Delete failed",
        // Profile Page
        profileTitle: "Profile",
        adminProfile: "Admin Profile",
        dashboard: "Data Dashboard",
        // Settings Page
        settingsTitle: "Settings",
        appearance: "Appearance",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        color: "Color",
    }
};

const useLang = () => {
    const { lang } = useAppContext();
    return (key) => translations[lang][key] || key;
};

// --- ASSET ICONS ---
const ICONS = {
    success: (
        <svg className="w-full h-full text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    error: (
        <svg className="w-full h-full text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    loading: <div className="w-16 h-16 border-4 border-slate-500 border-t-indigo-500 rounded-full animate-spin"></div>,
    confirm: (
        <svg className="w-full h-full text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
    ),
    choice: (
         <svg className="w-full h-full text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m4 13-4-4M3 10h12M3 15h4M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1z"></path>
        </svg>
    )
};

// --- DATA FETCHING API ---

/**
 * Loads all required face-api.js models.
 */
async function loadModels() {
    console.log("Loading FaceAPI models...");
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]);
    console.log("All models loaded.");
}

/**
 * Fetches data from the Google Apps Script backend.
 * @param {string} action - The action to perform (e.g., 'getAdmins', 'getStudents').
 * @param {object} params - Optional GET parameters
 */
async function fetchData(action, params = {}) {
    try {
        const url = new URL(SCRIPT_URL);
        url.searchParams.append('action', action);
        for (const key in params) {
            url.searchParams.append(key, params[key]);
        }
        
        const res = await fetch(url.href);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (data.status === 'error') throw new Error(`Script Error: ${data.message}`);
        return data;
    } catch (e) {
        console.error(`Failed to fetch ${action}:`, e);
        throw e; // Re-throw to be handled by the caller
    }
}

/**
 * Posts data to the Google Apps Script backend.
 * @param {object} body - The data payload to send.
 */
async function postData(body) {
    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            redirect: 'follow'
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (data.status === 'error') throw new Error(`Script Error: ${data.message}`);
        return data;
    } catch (e) {
        console.error('Failed to post data:', e);
        throw e; // Re-throw to be handled by the caller
    }
}

// --- UI COMPONENTS ---

/**
 * A reusable Modal component.
 */
function Modal({ type, message, actions = {}, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 text-center rounded-2xl shadow-2xl bg-content border border-main">
                <div className="w-16 h-16 mx-auto mb-4">{ICONS[type]}</div>
                <p className="mb-6 text-lg font-semibold text-main">{message}</p>
                {type !== 'loading' && (
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {Object.keys(actions).length > 0 ? (
                            Object.entries(actions).map(([btnText, action]) => (
                                <button
                                    key={btnText}
                                    onClick={() => {
                                        if (action.callback) action.callback();
                                        onClose();
                                    }}
                                    className={action.className || "w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition"}
                                >
                                    {btnText}
                                </button>
                            ))
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full py-2 font-semibold text-white transition rounded-lg btn-theme"
                            >
                                យល់ព្រម
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * The initial loading screen for the whole app.
 */
function GlobalLoadingScreen() {
    const t = useLang();
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center bg-main">
            <img src="di_logo.png" alt="Logo" className="w-24 h-24 mb-4 rounded-full shadow-lg" />
            <p className="text-lg text-main">{t('loading')}</p>
            <div className="w-12 h-12 mt-4 border-4 border-slate-500 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );
}

/**
 * The login screen with admin selection and face verification.
 */
function LoginScreen({ onLoginSuccess }) {
    const t = useLang();
    const [adminData, setAdminData] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [view, setView] = useState('select'); // 'select' or 'camera'
    const [status, setStatus] = useState(t('loginSubtitle'));
    const [modal, setModal] = useState(null);
    
    const [referenceDescriptor, setReferenceDescriptor] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const videoRef = useRef();
    const canvasRef = useRef();
    const loginIntervalRef = useRef();

    // Fetch admins on component mount
    useEffect(() => {
        setStatus(t('loadingAdmins'));
        fetchData('getAdmins')
            .then(data => {
                setAdminData(data);
                setStatus(t('loginSubtitle'));
            })
            .catch(e => setStatus(`${t('errorLoadingAdmins')}: ${e.message}`));
    }, [t]);

    // Cleanup camera on component unmount
    useEffect(() => {
        return () => {
            stopLoginCamera();
        };
    }, []);

    const stopLoginCamera = () => {
        clearInterval(loginIntervalRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const startLoginCamera = async () => {
        stopLoginCamera();
        try {
            // *** HD CAMERA FIX ***
            const constraints = { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                // Wait for the reference face to be loaded before starting detection
                if (referenceDescriptor) {
                    setStatus(t('centerFace'));
                    startLoginFaceDetection();
                }
            };
        } catch (err) {
            setModal({ type: 'error', message: t('allowCamera'), onClose: () => {
                setModal(null);
                handleBackToSelect();
            }});
        }
    };
    
    const prepareReferenceFace = async (admin) => {
        setStatus(t('loadingRefFace'));
        try {
            const response = await fetchData('getAdminImage', { url: admin.imageUrl });
            const dataUrl = response.data;
            const referenceImage = await faceapi.fetchImage(dataUrl);
            const detection = await faceapi.detectSingleFace(referenceImage)
                .withFaceLandmarks()
                .withFaceDescriptor();
            
            if (!detection) {
                setModal({ type: 'error', message: 'Could not find face in reference image.', onClose: () => {
                    setModal(null);
                    handleBackToSelect();
                }});
                return;
            }
            setReferenceDescriptor(detection.descriptor);
            // If camera is already running, start detection.
            if (videoRef.current && videoRef.current.srcObject) {
                setStatus(t('centerFace'));
                startLoginFaceDetection();
            }
        } catch (e) {
            setModal({ type: 'error', message: `Could not load reference image. ${e.message}`, onClose: () => {
                setModal(null);
                handleBackToSelect();
            }});
        }
    };

    const startLoginFaceDetection = () => {
        clearInterval(loginIntervalRef.current);
        loginIntervalRef.current = setInterval(async () => {
            if (!referenceDescriptor || isVerifying || !videoRef.current) return;
            
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();
            
            if (detection) {
                setIsVerifying(true);
                setStatus(t('verifying'));
                const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
                
                if (distance < FACE_MATCH_THRESHOLD) {
                    grantAccess();
                } else {
                    setStatus(t('faceNoMatch'));
                    setTimeout(() => {
                        setStatus(t('centerFace'));
                        setIsVerifying(false);
                    }, 2000);
                }
            } else {
                // No face detected, keep scanning
                setStatus(t('centerFace'));
            }
        }, 1000);
    };

    const handleManualVerify = async () => {
        if (isVerifying || !referenceDescriptor || !videoRef.current) return;
        
        clearInterval(loginIntervalRef.current);
        setIsVerifying(true);
        setStatus(t('verifying'));
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const detection = await faceapi.detectSingleFace(canvas)
            .withFaceLandmarks()
            .withFaceDescriptor();
            
        if (detection) {
            const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
            if (distance < FACE_MATCH_THRESHOLD) {
                grantAccess();
            } else {
                setStatus(t('faceNoMatch'));
                setTimeout(() => {
                    setIsVerifying(false);
                    startLoginFaceDetection();
                }, 2000);
            }
        } else {
            setStatus(t('faceNotFound'));
            setTimeout(() => {
                setIsVerifying(false);
                startLoginFaceDetection();
            }, 2000);
        }
    };

    const grantAccess = () => {
        stopLoginCamera();
        setStatus(`${t('welcome')}, ${selectedAdmin.name}!`);
        document.getElementById('login-video-wrapper')?.classList.add('ready');
        setTimeout(() => onLoginSuccess(selectedAdmin), 1500); // Pass admin object up
    };

    const handleAdminSelect = (e) => {
        const adminName = e.target.value;
        if (adminName) {
            const admin = adminData.find(a => a.name === adminName);
            setSelectedAdmin(admin);
        } else {
            setSelectedAdmin(null);
        }
    };
    
    // This is called by the "Continue" button
    const handleContinueClick = () => {
        if (!selectedAdmin) return;
        
        setView('camera');
        // *** UX FIX: Set status to loading *before* starting camera ***
        setStatus(t('loadingRefFace'));
        startLoginCamera();
        prepareReferenceFace(selectedAdmin);
    };

    const handleBackToSelect = () => {
        stopLoginCamera();
        setView('select');
        setSelectedAdmin(null);
        setReferenceDescriptor(null);
        setStatus(t('loginSubtitle'));
    };
    
    const getStatusColor = () => {
        if (status.includes('Error') || status.includes('មិនត្រឹមត្រូវ') || status.includes('not found')) return 'text-red-400';
        if (status.includes('កំពុង') || status.includes('Loading')) return 'text-yellow-400';
        if (status.includes('ស្វាគមន៍') || status.includes('Welcome')) return 'text-green-400';
        return 'text-muted';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="w-full max-w-md p-6 mx-auto border rounded-2xl bg-content border-main shadow-2xl">
                <div className="container w-full relative">
                    {view === 'camera' && (
                        <button
                            onClick={handleBackToSelect}
                            className="absolute -top-2 -left-2 w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-600/50 transition z-20"
                            title={t('back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    <img src="di_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg" />
                    <h1 className="mb-2 text-2xl text-center khmer-title text-main">{t('loginTitle')}</h1>
                    <p className={`text-center mb-6 h-5 ${getStatusColor()}`}>{status}</p>

                    {view === 'select' && (
                        <div className="mb-5 space-y-4">
                            <select
                                id="admin-select-list"
                                className="w-full px-4 py-3 text-base text-gray-900 bg-gray-200 border border-gray-400 rounded-lg appearance-none filter-select"
                                onChange={handleAdminSelect}
                                value={selectedAdmin?.name || ""}
                                disabled={adminData.length === 0}
                            >
                                <option value="">{t('selectName')}</option>
                                {adminData.map(admin => (
                                    <option key={admin.name} value={admin.name}>{admin.name}</option>
                                ))}
                            </select>
                            
                            {/* "CONTINUE" BUTTON IS REQUIRED FOR MOBILE */}
                            <button
                                onClick={handleContinueClick}
                                disabled={!selectedAdmin}
                                className="w-full py-3 font-semibold text-white transition rounded-xl btn-theme disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('continue')}
                            </button>
                        </div>
                    )}

                    {view === 'camera' && (
                        <div className="flex flex-col items-center space-y-4">
                            <div id="login-video-wrapper" className="video-container w-[90%] mx-auto rounded-full overflow-hidden">
                                <video id="login-video" ref={videoRef} autoPlay muted playsInline></video>
                                <div className="scanner-line"></div>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    id="login-manual-capture-btn"
                                    onClick={handleManualVerify}
                                    disabled={isVerifying || !referenceDescriptor}
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed btn-theme"
                                    title={t('verifyPhoto')}
                                >
                                    <i className="text-2xl fas fa-camera"></i>
                                </button>
                            </div>
                            <canvas id="login-capture-canvas" ref={canvasRef} className="hidden"></canvas>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- MAIN APPLICATION COMPONENTS ---

/**
 * Reusable Admin Image Component
 */
function AdminImage({ imageUrl, alt, className }) {
    const [imgSrc, setImgSrc] = useState(null); 
    const [error, setError] = useState(false);

    useEffect(() => {
        setImgSrc(null);
        setError(false);
        
        // --- FIX for undefined URL ---
        if (!imageUrl || imageUrl === 'undefined') {
            setError(true);
            return;
        }

        fetchData('getAdminImage', { url: imageUrl })
            .then(response => {
                setImgSrc(response.data); 
            })
            .catch(err => {
                console.error("Failed to fetch admin image:", err);
                setError(true);
            });
    }, [imageUrl]); 

    if (error) {
        return <img src="di_logo.png" alt="Fallback Logo" className={className} />;
    }
    if (!imgSrc) {
        return (
            <div className={`flex items-center justify-center bg-slate-700 ${className}`}>
                <div className="w-1/2 h-1/2 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }
    return <img src={imgSrc} alt={alt} className={className} />;
}


/**
 * The sidebar navigation component.
 */
function Sidebar({ admin, currentPage, setCurrentPage, onToggleSidebar, onLogout }) {
    const t = useLang();
    const navItems = [
        { id: 'profile', icon: 'fa-user', text: t('navProfile') },
        { id: 'scan', icon: 'fa-camera-retro', text: t('navScan') },
        { id: 'list', icon: 'fa-users', text: t('navList') },
        { id: 'records', icon: 'fa-database', text: t('navRecords') },
    ];
    
    const handleNavClick = (pageId) => {
        setCurrentPage(pageId);
        if (onToggleSidebar) onToggleSidebar(); // Close mobile sidebar on nav
    };

    return (
        <aside className="flex flex-col w-64 h-full bg-sidebar z-40 border-r border-main">
            <div className="py-6 mb-4 text-center">
                <img src="di_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-2 rounded-full shadow-lg" />
                <h2 className="text-xl font-bold khmer-title text-main">ឧស្សាហកម្មឌីជីថល</h2>
            </div>
            <ul className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map(item => (
                    <li key={item.id}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.id);
                            }}
                            className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-main ${currentPage === item.id ? 'active' : ''}`}
                        >
                            <i className={`fas ${item.icon} fa-fw`}></i>
                            <span className="font-semibold">{item.text}</span>
                        </a>
                    </li>
                ))}
            </ul>
            <div className="px-4 py-2 border-t border-main">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavClick('settings'); }}
                    className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-main ${currentPage === 'settings' ? 'active' : ''}`}
                >
                    <i className="fas fa-cog fa-fw"></i>
                    <span className="font-semibold">{t('navSettings')}</span>
                </a>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-main"
                >
                    <i className="fas fa-sign-out-alt fa-fw"></i>
                    <span className="font-semibold">{t('navLogout')}</span>
                </a>
            </div>
            <footer className="p-4 text-sm text-center text-muted">
                &copy; 2025 IT Support
            </footer>
        </aside>
    );
}

/**
 * The main header component.
 */
function Header({ admin, onToggleSidebar, onNavigate }) {
    const t = useLang();
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between flex-shrink-0 w-full h-16 px-6 bg-content/80 backdrop-blur-lg border-b border-main">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="mr-4 text-main md:hidden">
                    <i className="text-xl fas fa-bars"></i>
                </button>
                <h1 className="text-xl font-bold khmer-title text-main">{t('headerTitle')}</h1>
            </div>
            <div className="flex items-center">
                <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme">
                    <AdminImage 
                        imageUrl={admin.imageUrl} 
                        alt="Admin" 
                        className="object-cover w-full h-full" 
                    />
                </button>
            </div>
        </header>
    );
}

/**
 * Page 1: Face Scan
 */
function PageScan({ students, onRefreshData }) {
    const t = useLang();
    const [view, setView] = useState('select'); // 'select', 'camera', 'preview'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(null);
    const [cameraMode, setCameraMode] = useState('auto'); // 'auto' or 'manual'
    const [facingMode, setFacingMode] = useState('user');
    
    const [imageData, setImageData] = useState(null);
    const videoRef = useRef();
    const canvasRef = useRef();
    const captureIntervalRef = useRef();
    const [cameraStatus, setCameraStatus] = useState('');
    const [stableFrames, setStableFrames] = useState(0);

    const filteredStudents = useMemo(() => {
        const lowerCaseFilter = searchTerm.toLowerCase();
        return students.filter(s =>
            (s[0] || '').toString().toLowerCase().includes(lowerCaseFilter) ||
            (s[1] || '').toLowerCase().includes(lowerCaseFilter)
        );
    }, [students, searchTerm]);

    const stopStudentCamera = useCallback(() => {
        clearInterval(captureIntervalRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    // *** THIS FUNCTION IS FIXED ***
    // This function is now called *directly* by the modal buttons.
    const startStudentCamera = useCallback(async (mode, newFacingMode) => {
        stopStudentCamera();
        const currentMode = mode || cameraMode;
        const currentFacingMode = newFacingMode || facingMode;
        setCameraMode(currentMode);
        setView('camera');
        setCameraStatus('Starting camera...');
        
        try {
            // *** HD CAMERA FIX ***
            const constraints = { video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // --- FIX for iOS ---
                // Manually call play() in addition to autoPlay
                videoRef.current.play(); 
                videoRef.current.onloadedmetadata = () => {
                    if (currentMode === 'auto') {
                        setCameraStatus(t('cameraStatusScanning'));
                        startAutoDetection();
                    } else {
                        setCameraStatus(t('cameraStatusReady'));
                    }
                };
            } else {
                stream.getTracks().forEach(t => t.stop());
            }
        } catch (err) {
            setModal({ type: 'error', message: t('allowCamera'), onClose: () => {
                setModal(null);
                handleBackToSelect();
            }});
        }
    }, [facingMode, cameraMode, stopStudentCamera, t]); // Added cameraMode
    
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setModal({
            type: 'choice',
            message: t('cameraModeModal'),
            onClose: () => setModal(null),
            actions: {
                // *** THIS IS THE FIX ***
                // Call startStudentCamera directly from the click handler
                [t('autoCapture')]: {
                    callback: () => startStudentCamera('auto'),
                    className: "w-full text-white py-3 rounded-lg font-semibold transition btn-theme"
                },
                [t('manualCapture')]: {
                    callback: () => startStudentCamera('manual'),
                    className: "w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
                }
            }
        });
    };

    const startAutoDetection = () => {
        clearInterval(captureIntervalRef.current);
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
        captureIntervalRef.current = setInterval(async () => {
            if (!videoRef.current) return;
            const result = await faceapi.detectSingleFace(videoRef.current, options);
            if (result && result.score > 0.7) {
                setStableFrames(f => {
                    const newCount = f + 1;
                    setCameraStatus(`${t('cameraStatusSuccess')} (${newCount}/4)`);
                    if (newCount >= 4) {
                        handleCapture(); // Call the fixed capture function
                    }
                    return newCount;
                });
            } else {
                setStableFrames(0);
                setCameraStatus(t('cameraStatusScanning'));
            }
        }, 400);
    };

    //
    // *** THIS FUNCTION IS FIXED ***
    //
    const handleCapture = () => {
        // 1. Get refs
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || video.videoWidth === 0) {
            console.error("Video not ready or not found");
            return; // Safety check
        }

        const ctx = canvas.getContext('2d');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        
        // 2. Flip context if needed
        if (facingMode === 'user') {
            ctx.translate(size, 0);
            ctx.scale(-1, 1);
        }
        
        // 3. Calculate cropping
        const vRatio = video.videoWidth / video.videoHeight;
        let sx=0, sy=0, sWidth=video.videoWidth, sHeight=video.videoHeight;
        if (vRatio > 1) { sWidth = sHeight; sx = (video.videoWidth - sWidth) / 2; } 
        else { sHeight = sWidth; sy = (video.videoHeight - sHeight) / 2; }
        
        // 4. Draw the *current* video frame
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, size, size);
        
        // 5. Get the data URL *before* stopping the camera
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // 6. Set state *before* stopping camera
        setImageData(dataUrl);
        setView('preview');

        // 7. NOW, stop the camera *after* a short delay
        // This gives React time to update the state and render the <img>
        // before the video stream is killed.
        setTimeout(() => {
            stopStudentCamera();
        }, 100); 
    };

    const handleUpload = async () => {
        if (!imageData || !selectedStudent) return;
        setModal({ type: 'loading', message: t('uploading'), onClose: () => setModal(null) });
        try {
            const base64Data = imageData.split(',')[1];
            await postData({
                id: selectedStudent[0], name: selectedStudent[1],
                class: selectedStudent[2], group: selectedStudent[3],
                imageData: base64Data
            });
            setModal({
                type: 'success', message: t('uploadSuccess'),
                onClose: () => {
                    setModal(null);
                    onRefreshData();
                    handleBackToSelect();
                }
            });
        } catch (e) {
            setModal({ type: 'error', message: `${t('uploadFailed')}: ${e.message}`, onClose: () => setModal(null) });
        }
    };
    
    const handleRetake = () => {
        setImageData(null);
        setStableFrames(0);
        startStudentCamera(cameraMode, facingMode); // Pass current modes
    };

    const handleBackToSelect = () => {
        stopStudentCamera();
        setView('select');
        setSelectedStudent(null);
        setImageData(null);
        setSearchTerm('');
    };
    
    // *** CAMERA SWITCH FIX ***
    const handleSwitchCameraClick = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        startStudentCamera(cameraMode, newMode); // *Must* restart camera manually
    };
    
    // This effect is still needed to stop the camera when leaving the page
    useEffect(() => {
        return () => stopStudentCamera();
    }, [stopStudentCamera]);
    
    const getStatusColor = () => {
        if (cameraStatus.includes(t('cameraStatusSuccess'))) return 'text-green-400';
        if (cameraStatus.includes('Error')) return 'text-red-400';
        return 'text-muted';
    };

    return (
        <div className="main-content rounded-2xl p-6 bg-content">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="container w-full max-w-md mx-auto relative">
                
                {view !== 'select' && (
                    <button
                        onClick={handleBackToSelect}
                        className="hidden sm:flex absolute -top-2 -left-2 w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-slate-600/50 transition z-20"
                        title={t('back')}
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                )}

                <h1 className="text-center text-2xl mb-2 khmer-title text-main">{t('scanTitle')}</h1>
                <p className="text-center text-muted mb-6 h-5">
                    {view === 'select' && t('scanSubtitle')}
                    {view === 'camera' && (selectedStudent ? `${t('scanningFor')}: ${selectedStudent[1]}` : '...')}
                    {view === 'preview' && t('confirmPhoto')}
                </p>

                {view === 'select' && (
                    <div id="selection-area" className="mb-5">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ul id="student-list" className="space-y-1 max-h-[40vh] overflow-y-auto">
                            {students.length === 0 && <li className="text-center text-muted p-4">{t('loadingStudents')}</li>}
                            {students.length > 0 && filteredStudents.length === 0 && <li className="text-center text-muted p-4">{t('noStudentsFound')}</li>}
                            {filteredStudents.map(s => {
                                const [id, name, , , uploadCount] = s;
                                const isCompleted = uploadCount > 0;
                                return (
                                    <li
                                        key={id}
                                        onClick={() => !isCompleted && handleSelectStudent(s)}
                                        className={`p-3 rounded-lg transition flex justify-between items-center ${isCompleted ? 'opacity-70 text-green-400 font-semibold pointer-events-none' : 'cursor-pointer hover:bg-slate-700'}`}
                                    >
                                        <span className={isCompleted ? '' : 'text-main'}>{id} - {name}</span>
                                        {isCompleted && <i className="fas fa-check-circle ml-2 text-green-400"></i>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {view === 'camera' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div id="video-wrapper" className={`video-container w-[90%] mx-auto rounded-full overflow-hidden ${cameraStatus.includes(t('cameraStatusSuccess')) ? 'ready' : ''}`}>
                            <video id="video" ref={videoRef} autoPlay muted playsinline></video>
                            <div className="scanner-line"></div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            {/* *** CAMERA SWITCH FIX *** */}
                            <button
                                onClick={handleSwitchCameraClick}
                                className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-600/50 transition"
                                title="Switch Camera"
                            >
                                <i className="text-lg fas fa-sync-alt"></i>
                            </button>
                            {cameraMode === 'manual' && (
                                <button
                                    onClick={handleCapture}
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-white transition shadow-lg btn-theme"
                                    title="Capture Photo"
                                >
                                    <i className="text-2xl fas fa-camera"></i>
                                </button>
                            )}
                        </div>
                        <canvas id="capture-canvas" ref={canvasRef} className="hidden"></canvas>
                        <p className={`text-center text-sm h-5 font-semibold ${getStatusColor()}`}>{cameraStatus}</p>
                    </div>
                )}
                
                {view === 'preview' && (
                    <div className="flex flex-col items-center space-y-4">
                        <img
                            id="photo-preview"
                            src={imageData}
                            className="w-[90%] mx-auto aspect-square rounded-full border-4 border-green-400 object-cover shadow-lg"
                        />
                        <div className="flex flex-col w-full space-y-3">
                            <button
                                onClick={handleUpload}
                                className="w-full py-3 font-semibold text-white transition rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-lg"
                            >
                                {t('upload')}
                            </button>
                            <button
                                onClick={handleRetake}
                                className="w-full py-3 font-semibold text-white transition bg-slate-600 rounded-xl hover:bg-slate-700"
                            >
                                {t('retake')}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

/**
 * Page 2: Student List
 */
function PageList({ students, savedRecords }) {
    const t = useLang();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    
    const imageUrlMap = useMemo(() => new Map(savedRecords.slice(1).map(r => [r[2], r[5]])), [savedRecords]);
    const classes = useMemo(() => [...new Set(students.map(s => s[2]).filter(Boolean))].sort(), [students]);

    const filteredStudents = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        let filtered = students;
        
        if (classFilter === 'with_photos') filtered = students.filter(s => s[4] > 0);
        else if (classFilter !== 'all') filtered = students.filter(s => s[2] === classFilter);
        
        return filtered.filter(s =>
            (s[0] || '').toString().toLowerCase().includes(lowerSearch) ||
            (s[1] || '').toLowerCase().includes(lowerSearch)
        );
    }, [students, searchTerm, classFilter]);
    
    const stats = useMemo(() => {
        const total = filteredStudents.length;
        const completed = filteredStudents.filter(s => s[4] > 0).length;
        return { total, completed, pending: total - completed };
    }, [filteredStudents]);

    return (
        <div className="main-content rounded-2xl p-6 h-full flex flex-col bg-content">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h1 className="text-2xl khmer-title text-main">{t('listTitle')}</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select w-full md:w-auto"
                        value={classFilter}
                        onChange={e => setClassFilter(e.target.value)}
                    >
                        <option value="all">{t('allStudents')}</option>
                        <option value="with_photos">{t('withPhotos')}</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-left">
                <div className="bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-users fa-2x text-slate-400"></i>
                    <div><p className="text-slate-400">{t('totalStudents')}</p><p className="text-2xl font-bold text-main">{stats.total}</p></div>
                </div>
                <div className="bg-green-800/30 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-user-check fa-2x text-green-400"></i>
                    <div><p className="text-green-400">{t('studentsWithPhotos')}</p><p className="text-2xl font-bold text-green-400">{stats.completed}</p></div>
                </div>
                <div className="bg-red-800/30 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-user-clock fa-2x text-red-400"></i>
                    <div><p className="text-red-400">{t('studentsNoPhotos')}</p><p className="text-2xl font-bold text-red-400">{stats.pending}</p></div>
                </div>
            </div>
            <div className="table-container flex-1 overflow-auto">
                {students.length === 0 ? (
                    <div className="text-center py-10"><p className="text-muted">{t('loadingStudents')}</p></div>
                ) : (
                    <table className="w-full text-left text-main min-w-[600px]">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">{t('id')}</th>
                                <th className="p-3">{t('name')}</th>
                                <th className="p-3">{t('image')}</th>
                                <th className="p-3 text-center">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted">
                            {filteredStudents.length === 0 && (
                                <tr><td colSpan="4" className="text-center p-4">{t('noStudentsFound')}</td></tr>
                            )}
                            {filteredStudents.map(student => {
                                const hasImage = student[4] > 0;
                                const imageUrl = hasImage ? imageUrlMap.get(student[0].toString()) : null;
                                return (
                                    <tr key={student[0]} className="border-b border-main">
                                        <td className="p-3 text-main">{student[0]}</td>
                                        <td className="p-3 whitespace-nowrap text-main">{student[1]}</td>
                                        <td className="p-3">
                                            {imageUrl ? (
                                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-12 h-12 group rounded-lg overflow-hidden mx-auto">
                                                    <img src={imageUrl} className="w-full h-full object-cover" alt="Student photo" />
                                                </a>
                                            ) : (
                                                <span className="flex items-center justify-center">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {hasImage ? (
                                                <i className="fas fa-check-circle text-green-400"></i>
                                            ) : (
                                                <i className="fas fa-times-circle text-red-400"></i>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/**
 * Page 3: Saved Records
 */
function PageRecords({ savedRecords, onRefreshData }) {
    const t = useLang();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [modal, setModal] = useState(null);
    
    const classes = useMemo(() => [...new Set(savedRecords.slice(1).map(r => r[3]).filter(Boolean))].sort(), [savedRecords]);

    const filteredRecords = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return savedRecords.slice(1).filter(r => {
            const classMatch = classFilter === 'all' || r[3] === classFilter;
            const searchMatch = (r[1] || '').toLowerCase().includes(lowerSearch) ||
                                (r[2] || '').toString().toLowerCase().includes(lowerSearch);
            return classMatch && searchMatch;
        });
    }, [savedRecords, searchTerm, classFilter]);
    
    const handleDeleteClick = (serialNumber, imageUrl) => {
        setModal({
            type: 'confirm',
            message: t('deleteConfirm'),
            onClose: () => setModal(null),
            actions: {
                [t('cancel')]: {
                    callback: null,
                    className: "w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition"
                },
                [t('delete')]: {
                    callback: () => handleDelete(serialNumber, imageUrl),
                    className: "w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                }
            }
        });
    };
    
    const handleDelete = async (serialNumber, imageUrl) => {
        setModal({ type: 'loading', message: t('deleting'), onClose: () => setModal(null) });
        try {
            await postData({ action: 'delete', serialNumber, imageUrl });
            setModal({
                type: 'success', message: t('deleteSuccess'),
                onClose: () => { setModal(null); onRefreshData(); }
            });
        } catch (e) {
            setModal({ type: 'error', message: `${t('deleteFailed')}: ${e.message}`, onClose: () => setModal(null) });
        }
    };

    return (
        <div className="main-content rounded-2xl p-6 h-full flex flex-col bg-content">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl khmer-title text-main">{t('recordsTitle')}</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search ID or Name..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select w-full md:w-auto"
                        value={classFilter}
                        onChange={e => setClassFilter(e.target.value)}
                    >
                        <option value="all">{t('allClasses')}</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="table-container flex-1 overflow-auto">
                {savedRecords.length <= 1 ? (
                    <div className="text-center py-10"><p className="text-muted">Loading saved records...</p></div>
                ) : (
                    <table className="w-full text-left text-main min-w-[700px]">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">ល.រ</th>
                                <th className="p-3">{t('name')}</th>
                                <th className="p-3">{t('id')}</th>
                                <th className="p-3">{t('class')}</th>
                                <th className="p-3">{t('group')}</th>
                                <th className="p-3">{t('image')}</th>
                                <th className="p-3 text-center">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted">
                            {filteredRecords.length === 0 && (
                                <tr><td colSpan="7" className="text-center p-4">{t('noStudentsFound')}</td></tr>
                            )}
                            {filteredRecords.map(record => (
                                <tr key={record[0]} className="border-b border-main">
                                    <td className="p-3 text-main">{record[0]}</td>
                                    <td className="p-3 whitespace-nowrap text-main">{record[1]}</td>
                                    <td className="p-3 text-main">{record[2]}</td>
                                    <td className="p-3 text-main">{record[3]}</td>
                                    <td className="p-3 text-main">{record[4]}</td>
                                    <td className="p-3">
                                        <a href={record[5]} target="_blank" rel="noopener noreferrer" className="relative block w-16 h-16 group rounded-lg overflow-hidden">
                                            <img src={record[5]} className="w-full h-full object-cover" alt="Student photo" />
                                        </a>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => handleDeleteClick(record[0], record[5])}
                                            className="text-red-400 hover:text-red-600 transition"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/**
 * NEW: Page 4 - Profile
 */
function PageProfile({ admin, students, savedRecords }) {
    const t = useLang();
    
    // Stats for the dashboard
    const stats = useMemo(() => {
        const totalStudents = students.length;
        const imagesCaptured = savedRecords.slice(1).length; // slice(1) to skip header row
        const pending = totalStudents - imagesCaptured;
        return { totalStudents, imagesCaptured, pending };
    }, [students, savedRecords]);

    // Re-using the logic from PageRecords to show a filterable list
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    
    const classes = useMemo(() => [...new Set(savedRecords.slice(1).map(r => r[3]).filter(Boolean))].sort(), [savedRecords]);

    const filteredRecords = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return savedRecords.slice(1).filter(r => {
            const classMatch = classFilter === 'all' || r[3] === classFilter;
            const searchMatch = (r[1] || '').toLowerCase().includes(lowerSearch) ||
                                (r[2] || '').toString().toLowerCase().includes(lowerSearch);
            return classMatch && searchMatch;
        });
    }, [savedRecords, searchTerm, classFilter]);
    
    return (
        <div className="space-y-6">
            {/* Admin Profile Card */}
            <div className="main-content rounded-2xl p-6 bg-content">
                <h1 className="text-2xl khmer-title text-main mb-4">{t('adminProfile')}</h1>
                <div className="flex items-center space-x-4">
                    <AdminImage 
                        imageUrl={admin.imageUrl} 
                        alt="Admin" 
                        className="w-24 h-24 rounded-full border-4 border-theme object-cover" 
                    />
                    <div>
                        <h2 className="text-3xl font-bold text-main">{admin.name}</h2>
                        <p className="text-lg text-theme">Admin</p> {/* Changed from Super Admin */}
                    </div>
                </div>
            </div>
            
            {/* Dashboard */}
            <div className="main-content rounded-2xl p-6 bg-content">
                <h1 className="text-2xl khmer-title text-main mb-4">{t('dashboard')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-slate-400">{t('totalStudents')}</p>
                        <p className="text-3xl font-bold text-main">{stats.totalStudents}</p>
                    </div>
                    <div className="bg-green-800/30 p-4 rounded-lg">
                        <p className="text-green-400">{t('studentsWithPhotos')}</p>
                        <p className="text-3xl font-bold text-green-400">{stats.imagesCaptured}</p>
                    </div>
                    <div className="bg-red-800/30 p-4 rounded-lg">
                        <p className="text-red-400">{t('studentsNoPhotos')}</p>
                        <p className="text-3xl font-bold text-red-400">{stats.pending}</p>
                    </div>
                </div>
                
                {/* Filterable List of Saved Records */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="filter-select w-full md:w-auto"
                            value={classFilter}
                            onChange={e => setClassFilter(e.target.value)}
                        >
                            <option value="all">{t('allClasses')}</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="table-container flex-1 overflow-auto max-h-[50vh]">
                    <table className="w-full text-left text-main min-w-[600px]">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">{t('name')}</th>
                                <th className="p-3">{t('id')}</th>
                                <th className="p-3">{t('class')}</th>
                                <th className="p-3">{t('image')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted">
                            {filteredRecords.length === 0 && (
                                <tr><td colSpan="4" className="text-center p-4">{t('noStudentsFound')}</td></tr>
                            )}
                            {filteredRecords.map(record => (
                                <tr key={record[0]} className="border-b border-main">
                                    <td className="p-3 whitespace-nowrap text-main">{record[1]}</td>
                                    <td className="p-3 text-main">{record[2]}</td>
                                    <td className="p-3 text-main">{record[3]}</td>
                                    <td className="p-3">
                                        <a href={record[5]} target="_blank" rel="noopener noreferrer" className="relative block w-12 h-12 group rounded-lg overflow-hidden">
                                            <img src={record[5]} className="w-full h-full object-cover" alt="Student photo" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * NEW: Page 5 - Settings
 */
function PageSettings({ admin }) {
    const t = useLang();
    const { theme, setTheme, lang, setLang, color, setColor } = useAppContext();
    
    // REMOVED: Super Admin logic
    
    const colors = [
        { name: 'Indigo', class: 'theme-indigo', hex: '#4f46e5' },
        { name: 'Blue', class: 'theme-blue', hex: '#3b82f6' },
        { name: 'Green', class: 'theme-green', hex: '#22c55e' },
        { name: 'Red', class: 'theme-red', hex: '#ef4444' },
    ];

    return (
        <div className="main-content rounded-2xl p-6 bg-content max-w-3xl mx-auto">
            <h1 className="text-2xl khmer-title text-main mb-6">{t('settingsTitle')}</h1>
            
            <div className="space-y-6">
                {/* Appearance Section */}
                <div>
                    <h2 className="text-lg font-semibold text-main mb-2">{t('appearance')}</h2>
                    <div className="p-4 rounded-lg bg-main/50 border border-main space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <label className="text-main">{t('theme')}</label>
                            <div className="flex items-center p-1 rounded-lg bg-content">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1 rounded-md ${theme === 'light' ? 'btn-theme text-white' : 'text-muted'}`}
                                >{t('light')}</button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1 rounded-md ${theme === 'dark' ? 'btn-theme text-white' : 'text-muted'}`}
                                >{t('dark')}</button>
                            </div>
                        </div>
                        {/* Color Picker */}
                        <div className="flex items-center justify-between">
                            <label className="text-main">{t('color')}</label>
                            <div className="flex items-center space-x-2">
                                {colors.map(c => (
                                    <button
                                        key={c.class}
                                        onClick={() => setColor(c.class)}
                                        className={`w-8 h-8 rounded-full focus:outline-none ring-2 ring-offset-2 ring-offset-content ${color === c.class ? 'ring-theme' : 'ring-transparent'}`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Section */}
                <div>
                    <h2 className="text-lg font-semibold text-main mb-2">{t('language')}</h2>
                    <div className="p-4 rounded-lg bg-main/50 border border-main">
                        <div className="flex items-center justify-between">
                            <label className="text-main">{t('language')}</label>
                            <div className="flex items-center p-1 rounded-lg bg-content">
                                <button
                                    onClick={() => setLang('kh')}
                                    className={`px-3 py-1 rounded-md ${lang === 'kh' ? 'btn-theme text-white' : 'text-muted'}`}
                                >KH</button>
                                <button
                                    onClick={() => setLang('en')}
                                    className={`px-3 py-1 rounded-md ${lang === 'en' ? 'btn-theme text-white' : 'text-muted'}`}
                                >EN</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REMOVED: Super Admin Section */}
                
            </div>
        </div>
    );
}


/**
 * The main application wrapper, containing Sidebar, Header, and Page content.
 */
function MainApplication({ admin, students, savedRecords, onRefreshData, onLogout }) {
    const [currentPage, setCurrentPage] = useState('profile'); // Default to profile page
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen md:flex">
            {isSidebarOpen && (
                <div
                    id="sidebar-backdrop"
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <div
                id="sidebar"
                className={`fixed top-0 left-0 w-64 h-full z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar
                    admin={admin}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onToggleSidebar={() => setIsSidebarOpen(false)}
                    onLogout={onLogout}
                />
            </div>
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar
                    admin={admin}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onLogout={onLogout}
                />
            </div>

            <div id="content-wrapper" className="flex flex-col flex-1 w-full md:w-0 bg-main">
                <Header 
                    admin={admin} 
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    onNavigate={setCurrentPage}
                />
                <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto">
                    {currentPage === 'profile' && <PageProfile admin={admin} students={students} savedRecords={savedRecords} />}
                    {currentPage === 'scan' && <PageScan students={students} onRefreshData={onRefreshData} />}
                    {currentPage === 'list' && <PageList students={students} savedRecords={savedRecords} />}
                    {currentPage === 'records' && <PageRecords savedRecords={savedRecords} onRefreshData={onRefreshData} />}
                    {currentPage === 'settings' && <PageSettings admin={admin} />}
                </main>
            </div>
        </div>
    );
}

/**
 * The root Application component.
 * Manages global state like loading, authentication, and data.
 */
function App() {
    const [isLoading, setIsLoading] = useState(true);
    // Admin object is now stored in state, initialized from localStorage
    const [admin, setAdmin] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('adminSession'));
        } catch {
            return null;
        }
    });
    
    // Global data stores
    const [students, setStudents] = useState([]);
    const [savedRecords, setSavedRecords] = useState([]);

    // Initial data load effect
    useEffect(() => {
        async function initializeApp() {
            try {
                await loadModels();
                const [studentData, recordData] = await Promise.all([
                    fetchData('getStudents'),
                    fetchData('getSavedData')
                ]);
                setStudents(studentData.slice(1));
                setSavedRecords(recordData);
            } catch (e) {
                console.error("Failed to initialize app:", e);
            } finally {
                setIsLoading(false);
            }
        }
        initializeApp();
    }, []);
    
    const refreshAllData = useCallback(async () => {
        console.log("Refreshing all data...");
        try {
            const [studentData, recordData] = await Promise.all([
                fetchData('getStudents'),
                fetchData('getSavedData')
            ]);
            setStudents(studentData.slice(1));
            setSavedRecords(recordData);
            console.log("Data refreshed.");
        } catch (e) {
            console.error("Failed to refresh data:", e);
        }
    }, []);

    const handleLoginSuccess = (adminObject) => {
        setAdmin(adminObject);
        localStorage.setItem('adminSession', JSON.stringify(adminObject));
    };
    
    const handleLogout = () => {
        setAdmin(null);
        localStorage.removeItem('adminSession');
    };

    if (isLoading) {
        return <GlobalLoadingScreen />;
    }

    if (!admin) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <MainApplication
            admin={admin}
            students={students}
            savedRecords={savedRecords}
            onRefreshData={refreshAllData}
            onLogout={handleLogout}
        />
    );
}

// --- Render the App ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppProvider>
        <App />
    </AppProvider>
);
