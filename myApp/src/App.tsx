import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import Home from "./pages/Home";
import ProjectSelection from "./pages/projectSelection";
import Workplace from "./pages/workspace";

// 1. Clerk Publishable Key Validation
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env file.");
}

/**
 * UserSync Component
 * Automatically syncs Clerk user data to MongoDB upon successful login.
 */
function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncWithMongo = async () => {
      // Only sync if Clerk is loaded and a user session exists
      if (isLoaded && user) {
        console.log("🛰️ Syncing user with MongoDB...");
        try {
          const response = await fetch("http://localhost:5000/api/sync-user", {
            method: "PUT", // Changed to PUT to match the updated 'Update or Insert' logic
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
            }),
          });
          const data = await response.json();
          console.log("📥 MongoDB Sync Response:", data);
        } catch (err) {
          console.error("❌ MongoDB Sync Network Error:", err);
        }
      }
    };

    syncWithMongo();
  }, [user, isLoaded]);

  return null;
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {/* Mounting UserSync inside SignedIn ensures it only 
          attempts to fetch tokens/sync when a user is active.
      */}
      <SignedIn>
        <UserSync />
      </SignedIn>

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Protected Project Selection */}
        <Route 
          path="/select-project" 
          element={
            <SignedIn>
              <ProjectSelection />
            </SignedIn>
          } 
        />

        {/* Protected Workplace with ID */}
        <Route 
          path="/workplace/:projectId" 
          element={
            <SignedIn>
              <Workplace />
            </SignedIn>
          } 
        />
        
        {/* Protected General Workplace Route */}
        <Route
          path="/workplace"
          element={
            <>
              <SignedIn>
                <Workplace />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  );
}