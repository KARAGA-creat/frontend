import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Dettes from './pages/Dettes';
import Budgets from './pages/Budgets';
import Rapports from './pages/Rapports';
import Tiers from './pages/Tiers';
import Alertes from './pages/Alertes';
import RoleRoute from './utils/RoleRoute';
import Parametres from './pages/Parametres';
import Inscription from './pages/Inscription';


function PrivateRoute({ children }) {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Tous les rôles */}
<Route path="/dashboard" element={
    <PrivateRoute><Dashboard /></PrivateRoute>
} />
<Route path="/alertes" element={
    <PrivateRoute><Alertes /></PrivateRoute>
} />

{/* Admin + Gestionnaire (lecture) */}
<Route path="/transactions" element={
    <PrivateRoute>
        <RoleRoute roles={['admin', 'gestionnaire']}>
            <Transactions />
        </RoleRoute>
    </PrivateRoute>
} />
<Route path="/dettes" element={
    <PrivateRoute>
        <RoleRoute roles={['admin', 'gestionnaire']}>
            <Dettes />
        </RoleRoute>
    </PrivateRoute>
} />
<Route path="/budgets" element={
    <PrivateRoute>
        <RoleRoute roles={['admin', 'gestionnaire']}>
            <Budgets />
        </RoleRoute>
    </PrivateRoute>
} />

{/* Admin + Gestionnaire seulement */}
<Route path="/tiers" element={
    <PrivateRoute>
        <RoleRoute roles={['admin', 'gestionnaire']}>
            <Tiers />
        </RoleRoute>
    </PrivateRoute>
} />

{/* Admin  */}
<Route path="/rapports" element={
    <PrivateRoute>
        <RoleRoute roles={['admin']}>
            <Rapports />
        </RoleRoute>
    </PrivateRoute>
} />

{/* Admin seulement */}
<Route path="/parametres" element={
    <PrivateRoute>
        <RoleRoute roles={['admin']}>
            <Parametres />
        </RoleRoute>
    </PrivateRoute>
} />

    <Route path="/inscription" element={
        <Inscription />
} />
            </Routes>
        </BrowserRouter>
    );
}