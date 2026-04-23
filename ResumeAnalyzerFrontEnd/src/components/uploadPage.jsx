import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

const UploadPage = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [jobDescription, setJobDescription] = useState("");
	const [selectedModel, setSelectedModel] = useState("Ollama");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// theme (light / dark)
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
	
	useEffect(() => {
		localStorage.setItem("theme", theme);
		document.documentElement.classList.remove('theme-light', 'theme-dark');
		document.documentElement.classList.add(`theme-${theme}`);
		document.body.classList.remove('theme-light', 'theme-dark');
		document.body.classList.add(`theme-${theme}`);
	}, [theme]);

	const themeStyles = theme === "dark"
		? { background: "#121212", color: "#eee" }
		: { background: "#fff", color: "#111" };
	
	const navigate = useNavigate();

	// Validate file type
	const validateFile = (file) => {
		const allowedTypes = ['application/msword', 
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		const maxSize = 5 * 1024 * 1024; // 5MB
		
		if (!allowedTypes.includes(file.type)) {
			setError('Please upload a Word document only.');
			return false;
		}
		if (file.size > maxSize) {
			setError('File size must be less than 5MB.');
			return false;
		}
		return true;
	};

	const onFileChange = (event) => {
		const file = event.target.files[0];
		if (file && validateFile(file)) {
			setSelectedFile(file);
			setError("");
		}
	};

	const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
		if (rejectedFiles.length > 0) {
			setError('Invalid file type. Please upload PDF or Word documents.');
			return;
		}
		if (acceptedFiles && acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			if (validateFile(file)) {
				setSelectedFile(file);
				setError("");
			}
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
		onDrop, 
		multiple: false,
		accept: {			
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
		}
	});

	const onFileUpload = async () => {

		if(jobDescription.trim().length === 0) {
			setError("Please enter a job description to get tailored suggestions.");
			return;
		}
		if (!selectedFile) {
			setError("Please select a file first");
			return;
		}

		const formData = new FormData();
		formData.append("file", selectedFile);
		
		if (jobDescription && jobDescription.trim() !== "") {
			formData.append("jobDescription", jobDescription.trim());
		}

		setIsLoading(true);
		setError("");
		setUploadProgress(0);

		try {
			const endpoint = `http://localhost:8080/v1/analyze/${selectedModel}`;
			// Uncomment when backend is ready
			const response = await axios.post(
				endpoint,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
					onUploadProgress: (progressEvent) => {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setUploadProgress(percentCompleted);
					}
				}
			);

			// Mock success response
			// await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
			// const response = { 
			// 	res_code: 200, 
			// 	payload: {
			// 		Suggestions: "Based on your resume and the job description, here are key suggestions for improvement...",
			// 		KeyWords: "Java, Spring Boot, React, AWS, Microservices, Kafka",
			// 		HonestReview: "Your resume shows strong technical skills but could benefit from more quantifiable achievements."
			// 	}
			// };

			if (response.status === 200 && response.data) {
				navigate('/chat', { 
					state: { 
						analysis: response.data,
						fileName: selectedFile.name 
					} 
				});
			} else {
				setError(response.payload || "Upload failed. Please try again.");
			}
			
		} catch (error) {
			console.error("Error uploading file:", error);
			setError(error.response?.data?.message || "Network error. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
			navigate('/chat', { 
					state: { 
						analysis: response.data,
						fileName: selectedFile.name 
					} 
				});
		}		
	};

	const clearFile = () => {
		setSelectedFile(null);
		setJobDescription("");
		setError("");
	};

	const fileData = () => {
		if (selectedFile) {
			return (
				<div className="file-details" style={{ marginTop: 16 }}>
					<h3>Selected File:</h3>
					<p><strong>Name:</strong> {selectedFile.name}</p>
					<p><strong>Type:</strong> {selectedFile.type || "Unknown"}</p>
					<p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
					<p><strong>Last Modified:</strong> {selectedFile.lastModified ? new Date(selectedFile.lastModified).toLocaleDateString() : "N/A"}</p>
					<button 
						onClick={clearFile}
						className="btn btn-sm btn-outline-danger"
						style={{ marginTop: 8 }}
					>
						Remove File
					</button>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="container" style={{...themeStyles }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
				<h1>📄 Resume Analyzer</h1>
				 <i className="bi bi-moon border rounded-circle p-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </i>
			</div>

			<div className="upload-container" style={{ maxWidth: 600, margin: "0 auto" }}>
				<h2 className="h4 mb-4">Upload Your Resume</h2>

				{/* Error Display */}
				{error && (
					<div className="alert alert-danger" role="alert" style={{ marginBottom: 16 }}>
						<strong>Error:</strong> {error}
						<button 
							onClick={() => setError("")} 
							className="btn-close float-end"
							aria-label="Close"
						/>
					</div>
				)}

				{/* Dropzone */}
				<div
					{...getRootProps()}
					className={`dropzone ${isDragActive ? 'active' : ''}`}
					style={{
						border: `2px dashed ${isDragActive ? '#007bff' : '#999'}`,
						padding: 40,
						textAlign: "center",
						cursor: "pointer",
						marginBottom: 16,
						borderRadius: 8,
						backgroundColor: isDragActive ? 'rgba(0,123,255,0.1)' : 'transparent',
						transition: 'all 0.3s ease'
					}}
					role="button"
					tabIndex={0}
					aria-label="File upload dropzone"
				>
					<input {...getInputProps()} aria-label="File input" />
					{isDragActive ? (
						<p className="mb-0">📥 Drop your resume here...</p>
					) : selectedFile ? (
						<div>
							<p className="mb-1">📄 {selectedFile.name}</p>
							<small style={themeStyles}>Click or drag to replace</small>
						</div>
					) : (
						<div>
							<p className="mb-1">📤 Drag & drop your resume here (DOC/DOCX format)</p>
							{/* <small className="text-muted">Supports DOC, DOCX </small> */}
						</div>
					)}
				</div>

				{fileData()}

				{/* Job Description Input */}
				{selectedFile && (
					<div style={{ marginTop: 16, marginBottom: 16 }}>
						<label htmlFor="modelSelect" className="form-label fw-bold">
							Select Model
						</label>
						<select
							id="modelSelect"
							value={selectedModel}
							onChange={(e) => setSelectedModel(e.target.value)}
							className="form-select mb-3"
							style={{
								backgroundColor: theme === "dark" ? "#333" : "#fff",
								color: theme === "dark" ? "#fff" : "#000",
								borderColor: theme === "dark" ? "#555" : "#ddd"
							}}
						>
							<option value="Ollama">Ollama</option>
							<option value="deepseek">deepseek</option>
							<option value="gemini">gemini</option>
						</select>

						<label htmlFor="jobDescription" className="form-label fw-bold">
							Job Description
						</label>
						<textarea
							id="jobDescription"
							value={jobDescription}
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the job description here to get tailored suggestions..."
							rows={6}
							className="form-control"
							style={{ 
								width: "100%", 
								padding: 12,
								backgroundColor: theme === "dark" ? "#333" : "#fff",
								color: theme === "dark" ? "#fff" : "#000",
								borderColor: theme === "dark" ? "#555" : "#ddd"
							}}
							disabled={isLoading}
						/>
						<small style={themeStyles}>
							{jobDescription.length} characters 
						</small>
					</div>
				)}

				{/* Upload Button */}
				<div style={{ marginTop: 20 }}>
					<button 
						onClick={onFileUpload} 
						disabled={isLoading || !selectedFile}
						className="btn btn-primary btn-lg w-100"
						style={{ position: 'relative' }}
					>
						{isLoading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status" />
								Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
							</>
						) : (
							"Analyze Resume"
						)}
					</button>
				</div>

				{/* Info Text */}
				
			</div>

			{/* Loading Overlay */}
			{isLoading && (
				<div 
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						background: 'rgba(0,0,0,0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000
					}}
					role="alert"
					aria-label="Uploading"
				>
					<div style={{
						textAlign: 'center',
						color: '#fff',
						padding: 30,
						borderRadius: 12,
						background: 'rgba(0,0,0,0.8)',
						maxWidth: 300
					}}>
						<div className="spinner-border text-light mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<h3>Analyzing Resume</h3>
						<p className="mb-2">Please wait while we process your file...</p>
						{uploadProgress > 0 && (
							<div className="progress mt-2">
								<div 
									className="progress-bar progress-bar-striped progress-bar-animated" 
									style={{ width: `${uploadProgress}%` }}
								>
									{uploadProgress}%
								</div>
							</div>
						)}
						<button 
							className="btn btn-sm btn-outline-light mt-3"
							onClick={() => setIsLoading(false)}
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default UploadPage;