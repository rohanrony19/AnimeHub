import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JikanAnimeDetails from "./pages/JikanAnimeDetails";
import EpisodePage from "./pages/EpisodePage";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Watchlist from "./pages/Watchlist";
import ContinueWatching from "./pages/ContinueWatching";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import WatchPage from "./pages/WatchPage";
import GenrePage from "./pages/GenrePage";
import SearchPage from "./pages/SearchPage";
import DatabaseAnimeDetails from "./pages/DatabaseAnimeDetails";
import DatabaseWatchPage from "./pages/DatabaseWatchPage";
import ResetPassword from "./pages/ResetPassword";
import PopularPage from "./pages/PopularPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/jikan/:id" element={<JikanAnimeDetails />} />
      <Route path="/episode/:id" element={<EpisodePage />} />
      <Route path="/watch/:animeId/:episodeId" element={<WatchPage />} />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/db/watch/:animeId/:episodeId?"
        element={<DatabaseWatchPage />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/genre/:genreId/:genreName" element={<GenrePage />} />
      <Route path="/search/:keyword" element={<SearchPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/popular" element={<PopularPage />} />
      <Route path="/anime/:id" element={<DatabaseAnimeDetails />} />
      <Route
        path="/watchlist"
        element={
          <ProtectedRoute>
            <Watchlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/continue-watching"
        element={
          <ProtectedRoute>
            <ContinueWatching />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
