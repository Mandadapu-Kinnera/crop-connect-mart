import { createContext, useContext, useState, ReactNode } from "react";

type AppRole = "admin" | "user" | "farmer";

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: AppRole;
  };
}

interface AuthContextType {
  user: MockUser | null;
  session: any;
  userRole: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isApprovedFarmer: boolean;
  farmerStatus: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage (in-memory for demo)
const mockUsers: Map<string, { password: string; user: MockUser; role: AppRole; farmerStatus?: string }> = new Map();

// Add a demo admin user
mockUsers.set("admin@agrimart.com", {
  password: "admin123",
  user: {
    id: "admin-001",
    email: "admin@agrimart.com",
    user_metadata: { full_name: "Admin User", role: "admin" },
  },
  role: "admin",
});

// Add a demo farmer user
mockUsers.set("farmer@agrimart.com", {
  password: "farmer123",
  user: {
    id: "farmer-001",
    email: "farmer@agrimart.com",
    user_metadata: { full_name: "Demo Farmer", role: "farmer" },
  },
  role: "farmer",
  farmerStatus: "approved",
});

// Add a demo regular user
mockUsers.set("user@agrimart.com", {
  password: "user123",
  user: {
    id: "user-001",
    email: "user@agrimart.com",
    user_metadata: { full_name: "Demo User", role: "user" },
  },
  role: "user",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [isApprovedFarmer, setIsApprovedFarmer] = useState(false);
  const [farmerStatus, setFarmerStatus] = useState<string | null>(null);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole = "user") => {
    try {
      if (mockUsers.has(email)) {
        throw new Error("User already exists");
      }
      
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName, role },
      };
      
      mockUsers.set(email, {
        password,
        user: newUser,
        role,
        farmerStatus: role === "farmer" ? "pending" : undefined,
      });
      
      // Auto login after signup
      setUser(newUser);
      setSession({ user: newUser });
      setUserRole(role);
      
      if (role === "farmer") {
        setFarmerStatus("pending");
        setIsApprovedFarmer(false);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userData = mockUsers.get(email);
      
      if (!userData || userData.password !== password) {
        throw new Error("Invalid email or password");
      }
      
      setUser(userData.user);
      setSession({ user: userData.user });
      setUserRole(userData.role);
      
      if (userData.role === "farmer") {
        setFarmerStatus(userData.farmerStatus || "pending");
        setIsApprovedFarmer(userData.farmerStatus === "approved");
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsApprovedFarmer(false);
    setFarmerStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        signUp,
        signIn,
        signOut,
        isApprovedFarmer,
        farmerStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
