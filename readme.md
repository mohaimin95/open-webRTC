# WebRTC React Vite Project

This project implements a simple WebRTC-based video communication system using **React + Vite**.

---

## 📌 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or later) installed
- **npm** or **yarn** installed

---

## 🚀 Setup & Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-repo/webrtc-react-vite.git
   cd webrtc-react-vite
   ```

2. **Install dependencies**:
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Run the development server**:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open the app**:
   - The app will be available at `http://localhost:5173` (or another port if assigned by Vite).

---

## 📡 How to Make a WebRTC Connection

### 1️⃣ Open Two Tabs or Browsers
- Open the WebRTC app in **two separate browser windows/tabs**.
- These will act as **Peer 1** and **Peer 2**.

### 2️⃣ Create an Offer (on Peer 1)
- Click **"Create Offer"** on Peer 1.
- Copy the generated **Offer SDP** from the textarea.
- Paste it into the **Offer field** of Peer 2.

### 3️⃣ Create an Answer (on Peer 2)
- Click **"Create Answer"** on Peer 2.
- Copy the generated **Answer SDP** from the textarea.
- Paste it into the **Answer field** of Peer 1.

### 4️⃣ Complete the Connection (on Peer 1)
- Click **"Add Answer"** on Peer 1.
- If successful, both peers should now see each other's video streams!

---

## 🔧 Troubleshooting

- Ensure your browser has **camera and microphone access enabled**.
- If no video appears, check the browser console for any **WebRTC errors**.
- Ensure both peers are using the same **offer/answer exchange**.
- If using **different networks**, you may need to set up a **TURN server**.

---

## 📝 License
This project is open-source and free to use.

---

Enjoy coding! 🚀

