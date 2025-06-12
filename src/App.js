// EASYTRANS/frontend/src/App.js
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ClientDashboard from "./pages/client/Dashboard";
import DriverDashboard from "./pages/driver/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import 'bootstrap-icons/font/bootstrap-icons.css';


function HomePage() {
  return (
    <div className="container">
      <div className="content">
        <h1 className="title">Bienvenido a EasyTrans</h1>
        <p className="subtitle">
          Por favor inicia sesión o regístrate para continuar
        </p>
        <div className="button-wrapper">
          <Link to="/login" className="login-button">
            Iniciar sesión
          </Link>
          <Link to="/register" className="login-button">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ruta protegida para clientes */}
          <Route
            path="/cliente/*"
            element={
              <PrivateRoute allowedRoles={["cliente"]}>
                <ClientDashboard />
              </PrivateRoute>
            }
          />

          {/* Ruta protegida para conductores */}
          <Route
            path="/conductor/*"
            element={
              <PrivateRoute allowedRoles={["conductor", "driver"]}>
                <DriverDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
