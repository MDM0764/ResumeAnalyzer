import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import UploadPage from "./components/uploadPage.jsx"
import ChatPage from "./components/ChatPage.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
