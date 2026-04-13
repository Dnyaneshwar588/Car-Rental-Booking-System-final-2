import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = ({ variant = "customer", embedded = false }) => {

    const {setShowLogin, axios, setToken, navigate, setUser, setIsOwner} = useAppContext()
    const isOwnerFlow = variant === "owner"

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleOwnerAccessRequest = async () => {
        if (!email) {
            toast.error('Enter your registered email first')
            return null
        }

        try {
            const { data } = await axios.post('/api/owner/request-access', { email })
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onSubmitHandler = async (event)=>{
        try {
            event.preventDefault();

            if (isOwnerFlow && state === "register") {
                toast.error('Owner signup is disabled. Contact admin to create an owner account.')
                return null
            }

            const endpoint = state === "register" ? '/api/user/register' : '/api/user/login'
            const payload = state === "register" ? {name, email, password} : {email, password}
            const {data} = await axios.post(endpoint, payload)

            if (data.success) {
                setToken(data.token)
                localStorage.setItem('token', data.token)
                axios.defaults.headers.common['Authorization'] = `${data.token}`

                const userResponse = await axios.get('/api/user/data')
                if (userResponse.data.success) {
                    const nextUser = userResponse.data.user

                    if (isOwnerFlow && nextUser.role !== 'owner') {
                        localStorage.removeItem('token')
                        setToken(null)
                        setUser(null)
                        setIsOwner(false)
                        axios.defaults.headers.common['Authorization'] = ''
                        toast.error('This account is not an owner. Use customer login.')
                        return null
                    }

                    setUser(nextUser)
                    setIsOwner(nextUser.role === 'owner')
                    navigate(isOwnerFlow ? '/owner' : '/')
                } else {
                    navigate('/')
                }

                if (!embedded) {
                    setShowLogin(false)
                }
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
        
    }

  const form = (
      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-primary">{isOwnerFlow ? "Owner" : "Customer"}</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
            </div>
            {state === "login" && (
                <p className="w-full text-right">
                    <span onClick={() => navigate('/forgot-password')} className="text-primary cursor-pointer">Forgot password?</span>
                </p>
            )}
            {!isOwnerFlow && (state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            ))}
            {isOwnerFlow && (
                <div className="w-full">
                    <p className="text-gray-500">Owner accounts are managed by admin.</p>
                    <button
                        type="button"
                        onClick={handleOwnerAccessRequest}
                        className="mt-2 inline-flex items-center justify-center border border-borderColor px-4 py-2 rounded-md text-sm text-blue-600 hover:bg-gray-50 transition"
                    >
                        Request Owner Access
                    </button>
                </div>
            )}
            {isOwnerFlow ? (
                <p>
                    Customer login? <span onClick={() => navigate('/customer/login')} className="text-primary cursor-pointer">go here</span>
                </p>
            ) : (
                <p>
                    Owner login? <span onClick={() => navigate('/owner/login')} className="text-primary cursor-pointer">go here</span>
                </p>
            )}
            <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
  )

    if (embedded) {
        return form
  }

  return (
        <div onClick={()=> setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>
            {form}
        </div>
  )
}

export default Login
