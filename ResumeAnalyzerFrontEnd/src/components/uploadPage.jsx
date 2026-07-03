import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useTheme from "../hooks/useTheme";
import { API_BASE_URL } from "../constants/api";

const UploadPage = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [jobDescription, setJobDescription] = useState("");
	const [selectedModel, setSelectedModel] = useState("Ollama");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const { theme, setTheme, themeStyles } = useTheme("#121212");

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
			setError('Invalid file type. Please upload Word documents (.doc, .docx).');
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
			const endpoint = `${API_BASE_URL}/v1/analyze/${selectedModel}`;
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
// 			 const response = {
// 				"status" : 200, "data":{"HonestReview"
// : 
// "\"###PORTFOLIO EVALUATION REPORT\\n**Candidate:** Mohammed Mishkath  \\n**Target Role:** Senior Backend / Full-Stack Engineer (Core Platform & AI)\\n\\n---\\n\\n### 1. Strategic Alignment Score: 5/10\\n\\n#### Rationale:\\n*   **Core Strengths (The Match):** The candidate is a highly competent backend engineer with 7+ years of experience. He demonstrates deep expertise in high-throughput systems, API design, event-driven architecture (Kafka), and database optimization. His experience managing 5,000 req/sec and migrating monoliths to microservices aligns well with the \\\"Scale Infrastructure\\\" and \\\"Solve Complex Operational Problems\\\" requirements.\\n*   **Core Gaps (The Misalignment):** The JD demands a modern, lightweight, fast-shipping stack centered around **Python, FastAPI, AWS Serverless, and Supabase**. The candidate’s career is deeply rooted in the **heavy Enterprise Java/Spring Boot ecosystem** (Fintech/Telecom). While backend patterns transfer, a fast-paced startup looking for \\\"immediate shipping\\\" will view the transition cost from Java to Python/Serverless as a drag on velocity. Furthermore, his frontend (React) and AI (LLMs/Agents) experience is mostly relegated to a single personal project.\\n\\n---\\n\\n### 2. Hard Skill Gap Analysis\\n\\n| Must-Have Technical Skill (JD) | Candidate Proficiency Level | Resume Evidence / Gap Analysis |\\n| :--- | :--- | :--- |\\n| **Python / FastAPI** | **Missing** | Zero professional experience. The entire backend history is Java/Spring Boot. |\\n| **API Design & Integrations (Stripe, Twilio, etc.)** | **Medium** | Strong API design experience (Spring Cloud Gateway, REST), but lacks evidence of integrating modern SaaS/Web3/Fintech APIs like Stripe, Twilio, or Airbnb. |\\n| **AWS & Serverless Architecture** | **Low** | Mentions basic EC2 in migration context. Completely lacks serverless experience (Lambda, Gateway, DynamoDB) or Supabase. |\\n| **Event-Driven Workflows / Automation** | **High** | Successfully migrated a messaging backbone from ActiveMQ to Apache Kafka, increasing throughput by 40% (350K transactions/day). |\\n| **React / TypeScript** | **Low** | Mentions React in skills and built a personal project with React/Vite.js. No professional TypeScript experience listed. |\\n\\n---\\n\\n### 3. The \\\"Impact\\\" Audit (X-Y-Z Rewrite)\\n\\n*   **Passive Bullet 1 (Qness Software):** \\n    *   *Original:* \\\"Automated server-side data processing pipelines, cutting manual effort and infrastructure costs by 20%.\\\"\\n    *   *X-Y-Z Rewrite:* **Reduced manual data processing effort and infrastructure costs by 20%** by designing and automating server-side data processing pipelines **using Java batch processing and scheduled cron-jobs**.\\n\\n*   **Passive Bullet 2 (Sharobi Technologies):** \\n    *   *Original:* \\\"Collaborated cross-functionally to integrate NCMC (National Common Mobility Card) capabilities into CASA account frameworks, enabling seamless multi-modal transit payments for end users.\\\"\\n    *   *X-Y-Z Rewrite:* **Enabled seamless multi-modal transit payments for 500K+ daily active users** by designing and integrating NCMC capabilities into CASA account frameworks **using Java REST APIs and secure transaction protocols**.\\n\\n*   **Passive Bullet 3 (Enhancesys Technologies):** \\n    *   *Original:* \\\"Owned production reliability and troubleshooting across the platform’s API layer... cutting MTTR by 15% while sustaining 5,000 requests/second at peak load.\\\"\\n    *   *X-Y-Z Rewrite:* **Reduced MTTR by 15% while sustaining 5,000 requests/sec at peak load** by architecting a Spring Cloud Gateway with Redis caching and implementing JWT-based Spring Security.\\n\\n---\\n\\n### 4. ATS & Keyword Audit\\nThe candidate's resume will likely fail ATS screening for this specific role due to the absence of key modern tech-stack terms.\\n\\n*   **Missing Critical Keywords:** `Python`, `FastAPI`, `TypeScript`, `Serverless`, `AWS Lambda`, `Supabase`, `PostgreSQL` (only MySQL/Oracle are listed), `OpenAI`, `Stripe`, `Twilio`, `GitHub Actions` (only Jenkins is listed).\\n*   **Missing Domain Keywords:** `PropTech`, `Marketplace`, `AI Agents`, `Workflow Automation`, `Dynamic Pricing`.\\n\\n---\\n\\n### 5. The Brutal Truth (The Red Flag)\\n\\n**The Red Flag: The \\\"Enterprise Java\\\" Anchor.**  \\nTo a fast-moving, AI-driven startup, your resume reads like a traditional corporate enterprise developer. Recruiters will fear that you are accustomed to slow release cycles, heavy boilerplate code, and bureaucratic processes. They will assume you lack the \\\"bias toward action\\\" and the agility required to build rapid prototypes using lightweight tools like FastAPI, Supabase, and Serverless.\\n\\n#### The Fix:\\nYou must rebrand yourself from a \\\"Java Developer\\\" to a **\\\"Polyglot Backend Engineer.\\\"** \\n1.  **Reorder your tech stack:** Move Python, React, and SQL to the front. \\n2.  **Elevate the AI Project:** Move your \\\"Resume Analyzer\\\" personal project to the very top of your experience section, or frame it as a freelance/independent contract. Rename it to showcase **\\\"FastAPI, OpenAI API, and Supabase\\\"** (even if you have to rebuild parts of it this weekend to make it true).\\n3.  **De-emphasize Java-specific tools:** Instead of writing \\\"Spring Cloud Gateway, Hibernate, Maven,\\\" write \\\"Microservices Architecture, ORMs, CI/CD Pipelines.\\\" Focus on the *architectural concepts* rather than the Java-specific library names.\""
// ,"Suggestions"
// : 
// "\"### 1. Revised Professional Summary\\n\\n> **Senior Backend & Platform Engineer** with 7+ years of experience designing scalable backend systems, API-first architectures, and event-driven workflows. Proven track record of owning projects end-to-end—driving monolithic-to-microservices migrations that slashed cloud infrastructure costs by 20% and boosted transaction throughput by 25%. Expert in building robust APIs, integrating complex third-party ecosystems, and developing AI-powered automation workflows utilizing LLMs and modern full-stack architectures (React, Python, Java). Highly adaptable developer with a strong product mindset, biased toward rapid execution and shipping production-grade software that automates manual operations.\\n\\n---\\n\\n### 2. Keyword Integration List\\n\\nThe following high-value keywords from the Job Description have been seamlessly integrated into your summary, skills, and experience sections to maximize ATS matching:\\n\\n1. **Event-Driven Architecture** (Critical for workflow automation and Kafka/messaging systems)\\n2. **API-First Architecture** (Essential for building scalable, reusable backend services)\\n3. **AI-Powered Systems / LLM Integration** (Directly aligns with your personal project and their AI goals)\\n4. **Scalable Backend Systems** (Core requirement for building their core platform)\\n5. **Workflow Automation** (Replaces generic \\\"automation\\\" to match their operational goals)\\n6. **React & Full-Stack Development** (Highlights your ability to build user interfaces and dashboards)\\n7. **Cloud-Native Infrastructure** (Replaces generic Docker/CI-CD references to match modern cloud stacks)\\n8. **Real-Time Synchronization** (Aligned with transactional data processing and messaging backbones)\\n9. **Third-Party Integrations** (Emphasizes your ability to integrate systems like Stripe, Twilio, and partner APIs)\\n10. **Product Mindset & End-to-End Ownership** (Matches their company culture of moving fast and shipping)\\n\\n---\\n\\n### 3. Tailored Experience Section\\n\\n#### PROFESSIONAL EXPERIENCE\\n\\n**Software Engineer** | Enhancesys Technologies – Bangalore, India  \\n*June 2023 – Present*\\n\\n* **Accelerated feature delivery by 20%** by demonstrating a strong product mindset, owning projects end-to-end, and leading a 4-engineer team through rapid sprint planning, system architecture design, and high-quality code reviews.\\n* **Designed and migrated** a monolithic S-NOC platform into a highly scalable, **cloud-native microservices architecture** (Java 21, Spring Boot, Docker), improving transaction throughput by 25% and cutting annual infrastructure costs by 20%.\\n* **Optimized API-first architecture performance** to sustain 5,000 requests/second at peak load, reducing MTTR by 15% through the implementation of a Spring Cloud API Gateway, Redis caching, and real-time service health monitoring.\\n* **Architected an event-driven workflow system** using Apache Kafka, boosting real-time synchronization and data pipeline throughput by 40% (from 250K to 350K transactions/day) with zero downtime.\\n\\n**Java Developer (Contract Oracle)** | Sharobi Technologies – Kolkata, India  \\n*May 2022 – June 2023*\\n\\n* **Optimized complex database procedures** to support 500K+ daily transactions, improving end-of-day reconciliation speed by 15% and ensuring real-time synchronization across distributed financial ledger systems.\\n* **Engineered secure third-party integrations** for multi-modal transit payments (NCMC) into core banking frameworks, facilitating seamless payment processing and user guest experiences.\\n* **Automated manual operational workflows** by expanding the Generic File Upload (GEFU) data module, reducing manual data entry by 30% through automated validation and error-handling pipelines.\\n\\n**Associate Software Developer** | Qness Software – Bangalore, India  \\n*July 2019 – May 2022*\\n\\n* **Developed and shipped responsive full-stack dashboards** using **React**, improving client reporting and data visualization efficiency by 15% through optimized frontend-to-backend API integrations.\\n* **Automated server-side data processing pipelines**, reducing manual operational effort and cloud infrastructure overhead by 20%.\\n* **Built and deployed audit and compliance modules** using modern backend design patterns, strengthening system transparency and data integrity for stakeholders.\\n\\n---\\n\\n#### PERSONAL PROJECTS\\n\\n**AI-Powered Resume Analyzer & Workflow Tool**  \\n*GitHub: MDM0764/ResumeAnalyzer*  \\n* **Designed and deployed an AI-powered system** utilizing a **React** frontend and backend LLM APIs (Ollama/OpenAI-compatible) to automate document analysis, generating real-time structured suggestions and interactive chat dialogues.\\n\\n---\\n\\n### 4. ATS Optimization & Layout Strategy\\n\\nTo ensure your resume passes through ATS parsers without getting scrambled, structure your document using the following layout rules:\\n\\n* **Use Standard Section Headers:** Use simple, recognizable headings exactly as written: `PROFESSIONAL SUMMARY`, `TECHNICAL SKILLS`, `PROFESSIONAL EXPERIENCE`, `PERSONAL PROJECTS`, and `EDUCATION`.\\n* **Single-Column Format Only:** Avoid multi-column layouts, tables, text boxes, or sidebars. ATS software reads left-to-right, and columns often cause text to merge illegibly.\\n* **Clean Tech Skills Categorization:** Group your skills logically. Since they use Python/FastAPI/React but value general capability, present your tech skills clearly so they see your adaptability:\\n  * **Languages & Frameworks:** Python (FastAPI/Flask exposure), Java (Spring Boot, Spring Cloud), TypeScript, React, SQL, PL/SQL.\\n  * **Architecture & Database:** API-First Design, Event-Driven Architecture (Kafka, ActiveMQ), Microservices, PostgreSQL, MySQL, Redis.\\n  * **Cloud & DevOps:** AWS, Docker, CI/CD (GitHub Actions, Jenkins), Serverless Architecture.\\n* **No Graphics or Icons:** Remove any progress bars, star ratings for skills, or social icons. Use standard text links for your GitHub and LinkedIn profiles.\\n\\n---\\n\\n### 5. Final Strategic Advice for the Interview\\n\\n**What to emphasize:** \\nThe hiring team explicitly states, *\\\"We care more about capability than specific technologies.\\\"* Since your core background is in Java/Spring Boot rather than Python/FastAPI, **do not apologize for or hide your Java experience.** Instead, frame it as your foundation for mastering **distributed systems, high throughput, and event-driven architecture**. \\n\\nDuring the interview:\\n1. Emphasize that you have already built the exact types of systems they need: **real-time synchronization** (which you did with Kafka) and **third-party integrations** (which you did in fintech).\\n2. Position your **React** skills and your **AI-powered personal project** as proof of your full-stack capability, product mindset, and active curiosity about LLMs and workflow automation. This bridges the gap between your enterprise backend experience and their modern, fast-moving AI stack.\""
// }
			//  }
			if (response.status === 200 && response.data) {
				console.log("Upload successful:", response.data);
				navigate('/chat', {
					state: {
						analysis: response.data,
						fileName: selectedFile.name ,
						modelName: selectedModel,
						conversationId: response.data.conversationId
					}
				});
			} else {
				setError("Upload failed. Please try again.");
			}

		} catch (error) {
			console.error("Error uploading file:", error);
			setError(error.response?.data?.message || "Network error. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
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
							<option value="Deepseek">Deepseek</option>
							<option value="Gemini">Gemini</option>
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