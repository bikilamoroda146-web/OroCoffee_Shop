import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}) {

    const [user, setUser] = useState(()=>{
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;

        } catch (error){
            console.error("Error loading user", error);
            return null;
        }
    })
    const [loading, setLoading] = useState(false);
    const [error , setError] = useState(null);

    function signup(email, password, name){
        try {
            setLoading(true);
            setError(null);

            //validation 
            if(!email || !password || !name){
                setError("All fields are required");
                setLoading(false);
                return {success: false, error: "All fields are required"};
            }
            // check if user already registered
            const existingUser = localStorage.getItem("registered");
            if(existingUser){
                const parsed = JSON.parse(existingUser);
                if(parsed.email === email.trim().toLowerCase()){
                    setError("User already exists");
                    setLoading(false);
                    return {success: false, error: "User already exists"};
               }
                
            }
            // create new user
            const newUser = {
                id: Date.now().toString(),
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: "",
                address: "",
                bio: "",
                profileImage: "",
                createdAt: new Date().toISOString
            }

            localStorage.setItem("registeredUser", JSON.stringify(newUser))
            localStorage.setItem("user", JSON.stringify(newUser));


            setUser(newUser);
            setLoading(false);
            
            return {success: true, user: newUser}

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "sign up failed"
            setError(errorMsg);
            setLoading(false);
            return {success: false, error: errorMsg}
        }
    }

    function signIn(email, password){
        try {
            setLoading(true)
            setError(null)

            const savedUser = localStorage.getItem("registeredUser");

            if(!savedUser){
                setError("User not found. PLease signUp first.");
                setLoading(false)
                return false;
            }

            const parsed = JSON.parse(savedUser);

            if(parsed.email === email.trim().toLowerCase() && parsed.password === password){
                localStorage.setItem("user",JSON.stringify(parsed))
                setUser(parsed);
                setLoading(false)
                return true
            }

            setError("Invalid email or password")
            setLoading(false)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "SignUp failed";
            setError(errorMsg);
            setLoading(false)

            return false
            
        }

    }


 function signOut(){
    localStorage.removeItem("user");
    setUser(null);
 }


function updateProfile(update){
    if(!user){
        return {success: false, error: "Not signed In"}
    }
    const updatedUser = {...user, ...update};
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return {success: true, user: updatedUser}
}

    const value = {
        user,
        error,
        loading,
        signIn,
        signup,
        signOut,
        updateProfile
    }


    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context;
}