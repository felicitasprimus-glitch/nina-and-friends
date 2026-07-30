import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import { ContentProvider } from "./hooks/useContent";
import AdminPage from "./pages/AdminPage";
import SeitePage from "./pages/SeitePage";
import {
  CategoryPage,
  DetailPage,
  FavoritesPage,
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  SearchPage,
} from "./pages/pages";

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin-Bereich: eigene Ansicht ohne App-Navigation */}
          <Route path="/admin" element={<AdminPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/suche" element={<SearchPage />} />
            <Route path="/favoriten" element={<FavoritesPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/benachrichtigungen" element={<NotificationsPage />} />
            <Route path="/bereich/:slug" element={<CategoryPage />} />
            <Route path="/inhalt/:id" element={<DetailPage />} />
            <Route path="/seite/:slug" element={<SeitePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}
