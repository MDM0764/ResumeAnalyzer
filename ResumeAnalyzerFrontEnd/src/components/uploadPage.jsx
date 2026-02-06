import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

const UploadPage = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [jobDescription, setJobDescription] = useState("");
	// extracted payload fields to display in dashboard
	const [suggestions, setSuggestions] = useState("");
	const [keyWords, setKeyWords] = useState("");
	const [honestReview, setHonestReview] = useState("");
	const [showDashboard, setShowDashboard] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// theme (light / dark)
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	const themeStyles = theme === "dark"
		? { background: "#121212", color: "#eee" }
		: { background: "#fff", color: "#111" };
	const navigate = useNavigate();

	const onFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const onDrop = useCallback((acceptedFiles) => {
		if (acceptedFiles && acceptedFiles.length > 0) setSelectedFile(acceptedFiles[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

	const onFileUpload = async () => {
		if (!selectedFile) {
			console.log("No file selected");
			return;
		}

		const formData = new FormData();
		formData.append("file", selectedFile); // "file" should match the @RequestParam name in Java
		// append job description if provided
		if (jobDescription && jobDescription.trim() !== "") {
			formData.append("jobDescription", jobDescription.trim());
		}

		setIsLoading(true);
		try {
			const response = await axios.post(
				"http://localhost:8080/v1/analyze/Ollama",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
// 	/*success response UI test*/		const response = { res_code: 200, payload :{ "suggestions": "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.",
// "suggestions": "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.",
// "KeyWords" : "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.",
// "suggestions": "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.",
// "HonestReview" : "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.",
// "suggestions": "Based on the job description, here are some suggested changes to make your resume more compliant=\n\n**Change 1= Highlight relevant experience**\n\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\n\n**Change 2= Emphasize technical skills**\n\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\n\n* \"Developed responsive financial dashboards using ReactJS...\"\n* \"Designed and implemented API Gateways with Springboot...\"\n* \"Streamlined data processing using Kafka...\"\n\n**Change 3= Use keywords from the job description**\n\nIncorporate keywords like \"Frontend and back-end dev,\" \"Kafka, Streaming,\" \"Microservices,\" \"CI/CD,\" and \"AWS/Azure\" to demonstrate your familiarity with these technologies.\n\n**Change 4= Highlight strong communication skills**\n\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\n\nHere's an example of how you could revise your Professional Experience section=\n\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\n\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\n\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager."
// }
// }

// /*failure response UI test*/ const response = {res_code: 500, payload: "Internal Server Error"};

			console.log("File uploaded successfully:", response.data);
			// expected response shape: { res_code: 200, payload: { suggestions: "...", KeyWords: "...", HonestReview: "..." } }
			 
			if (response.res_code === 200 && response.payload) {
				const p = response.payload;
				setSuggestions(p.suggestions || "");
				setKeyWords(p.KeyWords || p.keywords || "");
				setHonestReview(p.HonestReview || p.honestReview || "");
				setShowDashboard(true);
			} else {
				// fallback if res_code not provided but payload exists
			
				setError(response);
			}
			// navigate to chat page with full response if you want
			// navigate('/chat', { state: { analysis: resp } });
		} catch (error) {
			console.error("Error uploading file:", error);
			setError(error);
		} finally {
			setIsLoading(false);
		}
	};

	 useEffect(() => {
    if (error && error.res_code && error.payload) {
      window.alert(`Error Code: ${error.res_code}\nPayload: ${error.payload}`);
    }
  }, [error]);

	const fileData = () => {
		if (selectedFile) {
			return (
				<div>
					<h2>File Details:</h2>
					<p>File Name: {selectedFile.name}</p>
					<p>File Type: {selectedFile.type}</p>
					<p>
						Last Modified: {selectedFile.lastModified ? new Date(selectedFile.lastModified).toDateString() : "N/A"}
					</p>
				</div>
			);
		} else {
			return (
				<div>
					<br />
					<h4>Choose before Pressing the Upload button</h4>
				</div>
			);
		}
	};

	return (
		<div style={{ minHeight: "100vh", padding: 20, ...themeStyles }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h1>Mohammed Mishkath, Resume Match Analyzer</h1>
				<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Switch to Light" : "Switch to Dark"} Mode</button>
			</div>
			<h3>File Upload using React!</h3>
			<div>
				<div
					{...getRootProps()}
					style={{
						border: "2px dashed #999",
						padding: 20,
						textAlign: "center",
						cursor: "pointer",
						marginBottom: 12,
					}}
				>
					<input {...getInputProps()} />
					{isDragActive ? (
						<p>Drop the file here ...</p>
					) : selectedFile ? (
						<p>{selectedFile.name}</p>
					) : (
						<p>Drag & drop a file here, or click to select</p>
					)}
				</div>
				{fileData()}

				{selectedFile && (
					<div style={{ marginTop: 12 }}>
						<label style={{ display: "block", marginBottom: 6 }}>
							Job Description (optional):
						</label>
						<textarea
							value={jobDescription}
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the job description or role details here..."
							rows={6}
							style={{ width: "100%", padding: 8 }}
						/>
					</div>
				)}

				<div style={{ marginTop: 12 }}>
					<button onClick={onFileUpload} disabled={isLoading}>
						{isLoading ? "Uploading..." : "Upload!"}
					</button>
				</div>

				{isLoading && (
					<div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
						<div style={{textAlign: 'center', color: '#fff', padding: 20, borderRadius: 8, background: 'rgba(0,0,0,0.6)'}}>
							<img src="https://i.gifer.com/ZZ5H.gif" alt="Loading..." style={{width: 80, height: 80, display: 'block', margin: '0 auto 12px'}} />
							<div>Uploading... Please wait</div>
						</div>
					</div>
				)}

				{showDashboard && (
					<div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, borderRadius: 6 }}>
						<h2>Analysis Dashboard</h2>
						
						<div style={{ marginTop: 8 }}>
							<strong>Key Words:</strong>
							<p>{keyWords || "(no keywords)"}</p>
						</div>
						<div style={{ marginTop: 8 }}>
							<strong>Honest Review:</strong>
							<p style={{ whiteSpace: "pre-wrap" }}>{honestReview || "(no review)"}</p>
						</div>
						<div style={{ marginTop: 8 }}>
							<strong>Suggestions:</strong>
							<p style={{ whiteSpace: "pre-wrap" }}>{suggestions || "(no suggestions)"}</p>
						</div>
						<div style={{ marginTop: 10 }}>
							<button onClick={() => { setShowDashboard(false); }}>Hide Dashboard</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default UploadPage;