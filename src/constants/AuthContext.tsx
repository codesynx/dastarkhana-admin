import React, { createContext, useContext, useState } from "react";
import { apiInstance } from "../lib/axios";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

interface AdminUser {
    id: number;
    email: string;
    name: string | null;
    token: string;
}

interface AuthContextType {
    user: AdminUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get user from localStorage
const getStoredUser = (): AdminUser | null => {
    const token = localStorage.getItem("token");
    const adminDetails = localStorage.getItem("adminDetails");
    if (token && adminDetails) {
        try {
            return { ...JSON.parse(adminDetails), token };
        } catch (e) {
            localStorage.removeItem("token");
            localStorage.removeItem("adminDetails");
            return null;
        }
    }
    return null;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(getStoredUser());

    const login = async (email: string, password: string) => {
        try {
            const response = await apiInstance.post("/auth/loginAdmin", {
                email,
                password,
            });

            if (response.data && response.data.token && response.data.admin) {
                const { token, admin } = response.data;
                const adminData: AdminUser = { ...admin, token };
                localStorage.setItem("token", token);
                localStorage.setItem("adminDetails", JSON.stringify({id: admin.id, email: admin.email, name: admin.name}));
                setUser(adminData);
                console.log("Кіру сәтті өтті:", adminData);
            } else {
                console.error("Жауаптан токен немесе әкімші деректері табылмады");
                throw new Error("API-ден токен немесе әкімші деректері алынбады");
            }
        } catch (error) {
            console.error("Кіру сәтсіз аяқталды", error);
            throw new Error("Кіру сәтсіз аяқталды");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminDetails"); // Remove admin details on logout
        setUser(null);
    };

    // Add effect to check token validity on load (optional but good practice)
    React.useEffect(() => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
            try {
                const decodedToken: { exp: number } = jwtDecode(currentToken);
                if (decodedToken.exp * 1000 < Date.now()) {
                    // Token expired
                    logout();
                } else {
                    // Token is valid, ensure user state is set
                    if (!user) {
                         setUser(getStoredUser());
                    }
                }
            } catch (e) {
                // Invalid token
                logout();
            }
        }
    }, []);


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth тек AuthProvider ішінде қолданылуы керек");
    }
    return context;
};
