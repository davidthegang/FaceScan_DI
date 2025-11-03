// Use strict mode for better error detection
"use strict";

// Import React hooks
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// --- CONSTANTS ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzq6ne8SuyYpH5-pSr_xIgW2B_ziWzZTBBVkXqbD1Ehh5N4Yg39Bdzy9eGIEb6Wlsk/exec';
const FACE_MATCH_THRESHOLD = 0.5; // Stricter verification
const MODEL_URL = './weights';
// UPDATED: Using a reliable proxy for image hosts like postimg.cc
const PROXY_URL = 'https://corsproxy.io/?';

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
 */
async function fetchData(action) {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=${action}`);
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
            <div className="w-full max-w-sm p-6 text-center rounded-2xl shadow-2xl bg-[#1e293b] border border-slate-700">
                <div className="w-16 h-16 mx-auto mb-4">{ICONS[type]}</div>
                <p className="mb-6 text-lg font-semibold text-white">{message}</p>
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
                                className="w-full py-2 font-semibold text-white transition rounded-lg bg-indigo-600 hover:bg-indigo-700"
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
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center bg-slate-900">
            <img src="di_logo.png" alt="Logo" className="w-24 h-24 mb-4 rounded-full shadow-lg" />
            <p className="text-lg text-slate-300">កំពុងទាញទិន្នន័យប្រព័ន្ធ...</p>
            <div className="w-12 h-12 mt-4 border-4 border-slate-500 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );
}

/**
 * The login screen with admin selection and face verification.
 */
function LoginScreen({ onLoginSuccess }) {
    const [adminData, setAdminData] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [view, setView] = useState('select'); // 'select' or 'camera'
    const [status, setStatus] = useState('សូមជ្រើសរើសឈ្មោះរបស់អ្នកដើម្បីចូល');
    const [modal, setModal] = useState(null);
    
    const [referenceDescriptor, setReferenceDescriptor] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const videoRef = useRef();
    const canvasRef = useRef();
    const loginIntervalRef = useRef();

    // Fetch admins on component mount
    useEffect(() => {
        fetchData('getAdmins')
            .then(data => {
                setAdminData(data);
                setStatus('សូមជ្រើសរើសឈ្មោះរបស់អ្នកដើម្បីចូល');
            })
            .catch(e => setStatus(`Error loading admins: ${e.message}`));
    }, []);

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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                startLoginFaceDetection();
            };
        } catch (err) {
            setModal({ type: 'error', message: 'Please allow camera access.', onClose: () => {
                setModal(null);
                handleBackToSelect();
            }});
        }
    };
    
    const prepareReferenceFace = async (admin) => {
        setStatus('កំពុងទាញទិន្នន័យមុខយោង...');
        try {
            // UPDATED: Use the new PROXY_URL with the image link from the sheet
            const imageUrl = `${PROXY_URL}${encodeURIComponent(admin.imageUrl)}`;
            const referenceImage = await faceapi.fetchImage(imageUrl);
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
            setStatus('សូមដាក់មុខនៅចំកណ្តាល');
        } catch (e) {
            setModal({ type: 'error', message: `Could not load reference image. Check image host.`, onClose: () => {
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
                setStatus('កំពុងផ្ទៀងផ្ទាត់...');
                const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
                
                if (distance < FACE_MATCH_THRESHOLD) {
                    grantAccess();
                } else {
                    setStatus('មុខមិនត្រឹមត្រូវ. សូមព្យាយាមម្តងទៀត.');
                    setTimeout(() => {
                        setStatus('សូមដាក់មុខនៅចំកណ្តាល');
                        setIsVerifying(false);
                    }, 2000);
                }
            } else {
                setStatus('សូមដាក់មុខនៅចំកណ្តាល');
            }
        }, 1000);
    };

    const handleManualVerify = async () => {
        if (isVerifying || !referenceDescriptor || !videoRef.current) return;
        
        clearInterval(loginIntervalRef.current);
        setIsVerifying(true);
        setStatus('កំពុងផ្ទៀងផ្ទាត់...');
        
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
                setStatus('មុខមិនត្រឹមត្រូវ. សូមព្យាយាមម្តងទៀត.');
                setTimeout(() => {
                    setIsVerifying(false);
                    startLoginFaceDetection();
                }, 2000);
            }
        } else {
            setStatus('រកមិនឃើញមុខ. សូមព្យាយាមម្តងទៀត.');
            setTimeout(() => {
                setIsVerifying(false);
                startLoginFaceDetection();
            }, 2000);
        }
    };

    const grantAccess = () => {
        stopLoginCamera();
        setStatus(`សូមស្វាគមន៍, ${selectedAdmin.name}!`);
        // Add a success visual state
        document.getElementById('login-video-wrapper')?.classList.add('ready');
        setTimeout(onLoginSuccess, 1500); // Wait 1.5s before fading out
    };

    const handleAdminSelect = (e) => {
        const adminName = e.target.value;
        if (adminName) {
            const admin = adminData.find(a => a.name === adminName);
            setSelectedAdmin(admin);
            setView('camera');
            setStatus('Starting camera...');
            startLoginCamera();
            prepareReferenceFace(admin);
        }
    };

    const handleBackToSelect = () => {
        stopLoginCamera();
        setView('select');
        setSelectedAdmin(null);
        setReferenceDescriptor(null);
        setStatus('សូមជ្រើសរើសឈ្មោះរបស់អ្នកដើម្បីចូល');
    };
    
    const getStatusColor = () => {
        if (status.includes('Error') || status.includes('មិនត្រឹមត្រូវ')) return 'text-red-400';
        if (status.includes('កំពុង')) return 'text-yellow-400';
        if (status.includes('ស្វាគមន៍')) return 'text-green-400';
        return 'text-slate-400';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="w-full max-w-md p-6 mx-auto border rounded-2xl bg-slate-800/50 border-slate-700 backdrop-blur-lg">
                <div className="container w-full relative">
                    {view === 'camera' && (
                        <button
                            onClick={handleBackToSelect}
                            className="absolute -top-2 -left-2 w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-600/50 transition z-20"
                            title="Back"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    <img src="di_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg" />
                    <h1 className="mb-2 text-2xl text-center text-white khmer-title">ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យរូបភាព</h1>
                    <p className={`text-center mb-6 h-5 ${getStatusColor()}`}>{status}</p>

                    {view === 'select' && (
                        <div className="mb-5">
                            <select
                                id="admin-select-list"
                                className="w-full px-4 py-3 text-base text-gray-900 bg-gray-200 border border-gray-400 rounded-lg appearance-none filter-select"
                                onChange={handleAdminSelect}
                                value={selectedAdmin?.name || ""}
                                disabled={adminData.length === 0}
                            >
                                <option value="">-- សូមជ្រើសរើសឈ្មោះ --</option>
                                {adminData.map(admin => (
                                    <option key={admin.name} value={admin.name}>{admin.name}</option>
                                ))}
                            </select>
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
                                    className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Verify Photo"
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
 * The sidebar navigation component.
 */
function Sidebar({ currentPage, setCurrentPage, onToggleSidebar }) {
    const navItems = [
        { id: 'scan', icon: 'fa-camera-retro', text: 'ថតរូប' },
        { id: 'list', icon: 'fa-users', text: 'ទិន្នន័យរូបភាពនិស្សិត' },
        { id: 'records', icon: 'fa-database', text: 'រូបភាពបានរក្សាទុក' },
    ];
    
    const handleNavClick = (pageId) => {
        setCurrentPage(pageId);
        if (onToggleSidebar) onToggleSidebar(); // Close mobile sidebar on nav
    };

    return (
        <aside className="flex flex-col w-64 h-full bg-slate-800/80 backdrop-blur-lg z-40">
            <div className="py-6 mb-4 text-center">
                <img src="di_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-2 rounded-full shadow-lg" />
                <h2 className="text-xl font-bold text-white khmer-title">ឧស្សាហកម្មឌីជីថល</h2>
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
                            className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-indigo-500 hover:text-white ${currentPage === item.id ? 'active' : ''}`}
                        >
                            <i className={`fas ${item.icon} fa-fw`}></i>
                            <span className="font-semibold">{item.text}</span>
                        </a>
                    </li>
                ))}
            </ul>
            <footer className="p-4 text-sm border-t text-slate-400 border-slate-700/50">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    <p className="text-center sm:text-left">&copy; 2025 IT Support</p>
                    <div className="flex items-center gap-3">
                        <a href="#" target="_blank" className="transition-colors hover:text-white" title="Telegram">
                            <i className="fab fa-telegram fa-lg"></i>
                        </a>
                    </div>
                </div>
            </footer>
        </aside>
    );
}

/**
 * The main header component.
 */
function Header({ onToggleSidebar }) {
    return (
        <header className="sticky top-0 z-20 flex items-center flex-shrink-0 w-full h-16 px-6 bg-slate-800/50 backdrop-blur-lg">
            <button onClick={onToggleSidebar} className="mr-4 text-white md:hidden">
                <i className="text-xl fas fa-bars"></i>
            </button>
            <h1 className="text-xl font-bold text-white khmer-title">ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យរូបភាព</h1>
        </header>
    );
}

/**
 * Page 1: Face Scan
 * Contains logic for selecting a student and capturing their photo.
 */
function PageScan({ students, onRefreshData }) {
    const [view, setView] = useState('select'); // 'select', 'camera', 'preview'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(null);
    const [cameraMode, setCameraMode] = useState('auto'); // 'auto' or 'manual'
    const [facingMode, setFacingMode] = useState('user');
    
    // Camera state
    const [imageData, setImageData] = useState(null); // Stores the captured image data URL
    const videoRef = useRef();
    const canvasRef = useRef();
    const captureIntervalRef = useRef();
    const [cameraStatus, setCameraStatus] = useState('');
    const [stableFrames, setStableFrames] = useState(0);

    // Filter students for the selection list
    const filteredStudents = useMemo(() => {
        const lowerCaseFilter = searchTerm.toLowerCase();
        return students.filter(s =>
            (s[0] || '').toString().toLowerCase().includes(lowerCaseFilter) ||
            (s[1] || '').toLowerCase().includes(lowerCaseFilter)
        );
    }, [students, searchTerm]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        // Ask for camera mode
        setModal({
            type: 'choice',
            message: 'សូមជ្រើសរើសប្រតិបត្តិកាមេរ៉ា',
            onClose: () => setModal(null),
            actions: {
                'ថតរូបស្វ័យប្រវត្តិ': {
                    callback: () => { setCameraMode('auto'); setView('camera'); },
                    className: "w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                },
                'ថតរូបដោយខ្លួនឯង': {
                    callback: () => { setCameraMode('manual'); setView('camera'); },
                    className: "w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
                }
            }
        });
    };

    const stopStudentCamera = useCallback(() => {
        clearInterval(captureIntervalRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    const startStudentCamera = useCallback(async () => {
        stopStudentCamera();
        setCameraStatus('Starting camera...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: 640, height: 480 } });
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                if (cameraMode === 'auto') {
                    setCameraStatus('Please center your face');
                    startAutoDetection();
                } else {
                    setCameraStatus('ចុចប៊ូតុងកាមេរ៉ាដើម្បីថត');
                }
            };
        } catch (err) {
            setModal({ type: 'error', message: 'Please allow camera access.', onClose: () => {
                setModal(null);
                handleBackToSelect();
            }});
        }
    }, [facingMode, cameraMode, stopStudentCamera]);

    const startAutoDetection = () => {
        clearInterval(captureIntervalRef.current);
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
        captureIntervalRef.current = setInterval(async () => {
            if (!videoRef.current) return;
            const result = await faceapi.detectSingleFace(videoRef.current, options);
            if (result && result.score > 0.7) {
                setStableFrames(f => {
                    const newCount = f + 1;
                    setCameraStatus(`Excellent! (${newCount}/4)`);
                    if (newCount >= 4) {
                        handleCapture();
                    }
                    return newCount;
                });
            } else {
                setStableFrames(0);
                setCameraStatus('Please center your face');
            }
        }, 400);
    };

    const handleCapture = () => {
        stopStudentCamera();
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        
        if (facingMode === 'user') {
            ctx.translate(size, 0);
            ctx.scale(-1, 1);
        }
        
        const vRatio = video.videoWidth / video.videoHeight;
        let sx=0, sy=0, sWidth=video.videoWidth, sHeight=video.videoHeight;
        if (vRatio > 1) { sWidth = sHeight; sx = (video.videoWidth - sWidth) / 2; } 
        else { sHeight = sWidth; sy = (video.videoHeight - sHeight) / 2; }
        
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImageData(dataUrl);
        setView('preview');
    };

    const handleUpload = async () => {
        if (!imageData || !selectedStudent) return;
        
        setModal({ type: 'loading', message: 'Uploading...', onClose: () => setModal(null) });
        
        try {
            const base64Data = imageData.split(',')[1];
            await postData({
                id: selectedStudent[0],
                name: selectedStudent[1],
                class: selectedStudent[2],
                group: selectedStudent[3],
                imageData: base64Data
            });
            
            setModal({
                type: 'success',
                message: 'Image saved successfully!',
                onClose: () => {
                    setModal(null);
                    onRefreshData(); // Refresh all app data
                    handleBackToSelect(); // Go back to selection list
                }
            });
            
        } catch (e) {
            setModal({ type: 'error', message: `Upload failed: ${e.message}`, onClose: () => setModal(null) });
        }
    };
    
    const handleRetake = () => {
        setImageData(null);
        setStableFrames(0);
        setView('camera');
    };

    const handleBackToSelect = () => {
        stopStudentCamera();
        setView('select');
        setSelectedStudent(null);
        setImageData(null);
        setSearchTerm('');
    };
    
    // Start camera when view changes to 'camera'
    useEffect(() => {
        if (view === 'camera') {
            startStudentCamera();
        }
        // Cleanup function
        return () => {
            stopStudentCamera();
        };
    }, [view, startStudentCamera, stopStudentCamera]);
    
    const getStatusColor = () => {
        if (cameraStatus.includes('Excellent')) return 'text-green-400';
        if (cameraStatus.includes('Error')) return 'text-red-400';
        return 'text-slate-400';
    };

    return (
        <div className="main-content rounded-2xl p-6">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="container w-full max-w-md mx-auto relative">
                
                {view !== 'select' && (
                    <button
                        onClick={handleBackToSelect}
                        className="hidden sm:flex absolute -top-2 -left-2 w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-slate-600/50 transition z-20"
                        title="Back to Selection"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                )}

                <h1 className="text-center text-2xl mb-2 text-white khmer-title">ប្រព័ន្ធស្កេនមុខឌីជីថល</h1>
                <p className="text-center text-slate-400 mb-6 h-5">
                    {view === 'select' && 'សូមជ្រើសរើសអត្តលេខរបស់អ្នក'}
                    {view === 'camera' && (selectedStudent ? `Scanning for: ${selectedStudent[1]}` : '...')}
                    {view === 'preview' && 'Confirm your photo'}
                </p>

                {view === 'select' && (
                    <div id="selection-area" className="mb-5">
                        <input
                            type="text"
                            id="student-search-input"
                            placeholder="ស្វែងរកអត្តលេខ ឬឈ្មោះ..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ul id="student-list" className="space-y-1 max-h-[40vh] overflow-y-auto">
                            {students.length === 0 && <li className="text-center text-slate-400 p-4">Loading students...</li>}
                            {students.length > 0 && filteredStudents.length === 0 && <li className="text-center text-slate-400 p-4">No students found.</li>}
                            {filteredStudents.map(s => {
                                const id = s[0];
                                const name = s[1];
                                const uploadCount = s[4];
                                const isCompleted = uploadCount > 0;
                                return (
                                    <li
                                        key={id}
                                        onClick={() => !isCompleted && handleSelectStudent(s)}
                                        className={`p-3 rounded-lg transition flex justify-between items-center ${isCompleted ? 'opacity-70 text-green-400 font-semibold pointer-events-none' : 'cursor-pointer hover:bg-slate-700'}`}
                                    >
                                        <span>{id} - {name}</span>
                                        {isCompleted && <i className="fas fa-check-circle ml-2 text-green-400"></i>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {view === 'camera' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div id="video-wrapper" className={`video-container w-[90%] mx-auto rounded-full overflow-hidden ${cameraStatus.includes('Excellent') ? 'ready' : ''}`}>
                            <video id="video" ref={videoRef} autoPlay muted playsinline></video>
                            <div className="scanner-line"></div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setFacingMode(m => (m === 'user' ? 'environment' : 'user'))}
                                className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-600/50 transition"
                                title="Switch Camera"
                            >
                                <i className="text-lg fas fa-sync-alt"></i>
                            </button>
                            {cameraMode === 'manual' && (
                                <button
                                    onClick={handleCapture}
                                    className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition shadow-lg"
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
                                បញ្ជូនរូបភាព
                            </button>
                            <button
                                onClick={handleRetake}
                                className="w-full py-3 font-semibold text-white transition bg-slate-600 rounded-xl hover:bg-slate-700"
                            >
                                ថតម្តងទៀត
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
 * Shows an overview of all students and their image status.
 */
function PageList({ students, savedRecords }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    
    // Create a map of student IDs to image URLs for quick lookup
    const imageUrlMap = useMemo(() => {
        return new Map(savedRecords.slice(1).map(r => [r[2], r[5]]));
    }, [savedRecords]);

    // Get all unique classes for the filter dropdown
    const classes = useMemo(() => {
        return [...new Set(students.map(s => s[2]).filter(Boolean))].sort();
    }, [students]);

    // Filter the student list based on search and class filter
    const filteredStudents = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        
        let filtered = students;
        
        if (classFilter === 'with_photos') {
            filtered = students.filter(s => s[4] > 0);
        } else if (classFilter !== 'all') {
            filtered = students.filter(s => s[2] === classFilter);
        }
        
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
        <div className="main-content rounded-2xl p-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h1 className="text-2xl text-white khmer-title">ទិន្នន័យរូបភាពនិស្សិត</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="ស្វែងរកអត្តលេខឬឈ្មោះ..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select w-full md:w-auto"
                        value={classFilter}
                        onChange={e => setClassFilter(e.target.value)}
                    >
                        <option value="all">All Students</option>
                        <option value="with_photos">With Photos</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-left">
                <div className="bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-users fa-2x text-slate-400"></i>
                    <div><p className="text-slate-400">ចំនួននិស្សិតសរុប</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
                </div>
                <div className="bg-green-800/30 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-user-check fa-2x text-green-400"></i>
                    <div><p className="text-green-400">និស្សិតមានរូបភាព</p><p className="text-2xl font-bold text-green-400">{stats.completed}</p></div>
                </div>
                <div className="bg-red-800/30 p-4 rounded-lg flex items-center gap-4">
                    <i className="fas fa-user-clock fa-2x text-red-400"></i>
                    <div><p className="text-red-400">និស្សិតគ្មានរូបភាព</p><p className="text-2xl font-bold text-red-400">{stats.pending}</p></div>
                </div>
            </div>
            <div className="table-container flex-1 overflow-auto">
                {students.length === 0 ? (
                    <div className="text-center py-10"><p className="text-slate-400">កំពុងទាញទិន្នន័យរូបភាពនិស្សិត...</p></div>
                ) : (
                    <table className="w-full text-left text-slate-300 min-w-[600px]">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">ឈ្មោះ</th>
                                <th className="p-3">រូបភាព</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 && (
                                <tr><td colSpan="4" className="text-center p-4 text-slate-400">No students found.</td></tr>
                            )}
                            {filteredStudents.map(student => {
                                const hasImage = student[4] > 0;
                                const imageUrl = hasImage ? imageUrlMap.get(student[0].toString()) : null;
                                return (
                                    <tr key={student[0]} className="border-b border-slate-700">
                                        <td className="p-3">{student[0]}</td>
                                        <td className="p-3 whitespace-nowrap">{student[1]}</td>
                                        <td className="p-3">
                                            {imageUrl ? (
                                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-12 h-12 group rounded-lg overflow-hidden mx-auto">
                                                    <img src={imageUrl} className="w-full h-full object-cover" alt="Student photo" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 flex items-center justify-center">-</span>
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
 * Shows a detailed, filterable list of students who have uploaded a photo.
 */
function PageRecords({ savedRecords, onRefreshData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [modal, setModal] = useState(null);
    
    // Get all unique classes for the filter dropdown
    const classes = useMemo(() => {
        return [...new Set(savedRecords.slice(1).map(r => r[3]).filter(Boolean))].sort();
    }, [savedRecords]);

    // Filter the records list based on search and class filter
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
            message: 'Are you sure you want to delete this record?',
            onClose: () => setModal(null),
            actions: {
                'Cancel': {
                    callback: null,
                    className: "w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition"
                },
                'Delete': {
                    callback: () => handleDelete(serialNumber, imageUrl),
                    className: "w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                }
            }
        });
    };
    
    const handleDelete = async (serialNumber, imageUrl) => {
        setModal({ type: 'loading', message: 'Deleting...', onClose: () => setModal(null) });
        try {
            await postData({ action: 'delete', serialNumber, imageUrl });
            setModal({
                type: 'success',
                message: 'Record deleted!',
                onClose: () => {
                    setModal(null);
                    onRefreshData(); // Refresh all app data
                }
            });
        } catch (e) {
            setModal({ type: 'error', message: `Delete failed: ${e.message}`, onClose: () => setModal(null) });
        }
    };

    return (
        <div className="main-content rounded-2xl p-6 h-full flex flex-col">
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl text-white khmer-title">រូបភាពបានរក្សាទុក</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search ID or Name..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select w-full md:w-auto"
                        value={classFilter}
                        onChange={e => setClassFilter(e.target.value)}
                    >
                        <option value="all">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="table-container flex-1 overflow-auto">
                {savedRecords.length <= 1 ? (
                    <div className="text-center py-10"><p className="text-slate-400">កំពុងទាញរូបភាពបានរក្សាទុក...</p></div>
                ) : (
                    <table className="w-full text-left text-slate-300 min-w-[700px]">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-3">ល.រ</th>
                                <th className="p-3">ឈ្មោះ</th>
                                <th className="p-3">ID</th>
                                <th className="p-3">ថ្នាក់</th>
                                <th className="p-3">ក្រុម</th>
                                <th className="p-3">រូបភាព</th>
                                <th className="p-3 text-center">កែ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 && (
                                <tr><td colSpan="7" className="text-center p-4 text-slate-400">No records found.</td></tr>
                            )}
                            {filteredRecords.map(record => (
                                <tr key={record[0]} className="border-b border-slate-700">
                                    <td className="p-3">{record[0]}</td>
                                    <td className="p-3 whitespace-nowrap">{record[1]}</td>
                                    <td className="p-3">{record[2]}</td>
                                    <td className="p-3">{record[3]}</td>
                                    <td className="p-3">{record[4]}</td>
                                    <td className="p-3">
                                        <a href={record[5]} target="_blank" rel="noopener noreferrer" className="relative block w-16 h-16 group rounded-lg overflow-hidden">
                                            <img src={record[5]} className="w-full h-full object-cover" alt="Student photo" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                                                <i className="fas fa-expand text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                            </div>
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
 * The main application wrapper, containing Sidebar, Header, and Page content.
 */
function MainApplication({ students, savedRecords, onRefreshData }) {
    const [currentPage, setCurrentPage] = useState('scan');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen md:flex">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    id="sidebar-backdrop"
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <div
                id="sidebar"
                className={`fixed top-0 left-0 w-64 h-full z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onToggleSidebar={() => setIsSidebarOpen(false)}
                />
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>

            {/* Main Content Area */}
            <div id="content-wrapper" className="flex flex-col flex-1 w-full md:w-0">
                <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
                <main className="w-full flex-1 p-4 md:p-8">
                    {currentPage === 'scan' && <PageScan students={students} onRefreshData={onRefreshData} />}
                    {currentPage === 'list' && <PageList students={students} savedRecords={savedRecords} />}
                    {currentPage === 'records' && <PageRecords savedRecords={savedRecords} onRefreshData={onRefreshData} />}
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Global data stores
    const [students, setStudents] = useState([]);
    const [savedRecords, setSavedRecords] = useState([]);

    // Initial data load effect
    useEffect(() => {
        async function initializeApp() {
            try {
                await loadModels();
                // Fetch students and records in parallel for speed
                const [studentData, recordData] = await Promise.all([
                    fetchData('getStudents'),
                    fetchData('getSavedData')
                ]);
                setStudents(studentData.slice(1));
                setSavedRecords(recordData);
            } catch (e) {
                console.error("Failed to initialize app:", e);
                // You could show a global error modal here
            } finally {
                setIsLoading(false);
            }
        }
        initializeApp();
    }, []);
    
    // Function to refresh all data, passed down to components that modify data
    const refreshAllData = useCallback(async () => {
        console.log("Refreshing all data...");
        try {
            // Fetch in parallel
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

    if (isLoading) {
        return <GlobalLoadingScreen />;
    }

    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <MainApplication
            students={students}
            savedRecords={savedRecords}
            onRefreshData={refreshAllData}
        />
    );
}

// --- Render the App ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

