import React, {useState, useRef}from 'react'
import {Navigate, useNavigate} from 'react-router-dom'
import {FiUser,FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiCamera,FiX, FiLogOut, FiGlobe} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'


function Profile() {
  const {user, signOut, updateProfile} = useAuth();
  const [isEditing, setIsediting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    profileImage: user?.profileImage || ""
  })
  const FileUpload = useRef(null);
  if(!user){
    return <Navigate to="/signin" replace />
  
  }
  function handleChange(e){
    const {name, value} = e.target;
    setFormData((prev)=>({
      ...prev, [name]: value
    }));
  }
  
function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setMessage("Please choose only an image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setMessage("Image is too large. Please choose one under 2MB");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: reader.result
    }));
    setMessage("");
  };

  reader.readAsDataURL(file);
}
  

  function handleSave(e){
    e.preventDefault();

    if(!formData.name.trim()){
      setMessage("Name is required")
      return
    }
    updateProfile(formData)
    setIsediting(false)
    setMessage("profile updated successfully!")
  }

  function handleCancel(){
    setFormData({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    profileImage: user?.profileImage || ""
    })
    setMessage("");
    setIsediting(false)
  }

  function logOut(){
    signOut();
    navigate("/")
  }


  return (
    <div className='min-h-screen bg-linear-to-b from-coffee-craem to-white py-10 px-4'>
    <div className='max-2xl mx-auto'>
      <h1 className='text-4xl font-bold text-coffee-orange mb-8 text-center'>My profile</h1>
      <div className='bg-white border border-coffee-caramel rounded-lg shadow-lg py-6'>
        <div className='flex flex-col items-center mb-3 '>
          <div className='w-24 h-24 rounded-full bg-coffee-orange text-coffee-brown flex justify-center items-center text-4xl overflow-hidden font-bold'>
            {
              formData.profileImage
              ? <img src={formData.profileImage} className='w-full h-full object-cover'/>
              : (user.name?.[0]?.toUpperCase() || <FiUser />)
            }
            </div>
            
              <h1 className=' text-2xl font-bold text-coffee-brown'>{user.name}</h1>
              <p className='text-gray-500'>{user.email}</p>
        </div>
          {
            message && (
              <p className='text-center text-green-500 font-semibold mb-4'>{message}</p>
            )
          }
          {
            isEditing ? (
              <form onSubmit={handleSave} className='space-y-4'>
                 <div className='mx-4'>
                
                  <label htmlFor="" className='block text-sm font-semibold text-coffee-brown mb-3'>profile photo</label>
                  <div className='flex items-coffee items-center gap-4'>
                    <div className='w-16 h-16 rounded-full bg-coffee-orange flex items-center justify-center text-2xl font-bold overflow-hidden'>
                      {
                         formData.profileImage 
                         ? <img src={formData.profileImage} className='w-full h-full object-cover' />
                         : (
                          user.name?.[0]?.toUpperCase() || <FiUser />
                          
                         )
                      }
                    </div>
                    <button className='flex items-center gap-2 px-4 border border-coffee-orange text-coffee-brown rounded-lg font-semibold hover:bg-coffee-cream cursor-pointer'
                    onClick={()=>FileUpload.current.click()}
                    type='button'>
                      <FiCamera /> Choose photo
                    </button>
                    <input type="file" 
                    className='hidden'
                    accept='image/*'
                    ref={FileUpload}
                    onChange={handleImage}
                    />
                    
                  </div>
            
                 
                 <div>
                 <label className='block text-sm font-semibold mb-2'>Full Name</label>
                 <input type="text" name="name"
                 value={formData.name}
                 onChange={handleChange}
                 className='w-full border border-coffee-caramel rounded-lg px-4 py-2 focus:outline-none'
                 />
                 </div>
                  <div>
                 <label className='block text-sm font-semibold mb-2'>Phone Number</label>
                 <input type="tel" name="phone"
                 value={formData.phone}
                 onChange={handleChange}
                 placeholder='(+123 456 789'
                 className='w-full border border-coffee-caramel rounded-lg px-4 py-2 focus:outline-none'
                 />
                 </div>
                  <div>
                 <label className='block text-sm font-semibold mb-2'>Address</label>
                 <textarea type="text" name="address"
                 value={formData.address}
                 onChange={handleChange}
                 placeholder='123 Main St, City, Country'
                 className='w-full border border-coffee-caramel rounded-lg px-4 py-2 focus:outline-none'
                 />
                 </div>
                  <div>
                 <label className='block text-sm font-semibold mb-2'>Bio</label>
                 <textarea type="text" name="bio"
                 value={formData.bio}
                 onChange={handleChange}
                 placeholder='Write something about yourself'
                 className='w-full border border-coffee-caramel rounded-lg px-4 py-2 focus:outline-none'
                 />
                 </div>
                 <div className='flex gap-4'>
                  <button type="submit"
                   className='flex flex-1 items-center justify-center gap-2 bg-coffee-orange text-white font-bold rounded-lg cursor-pointer py-3 hover:bg-coffee-brown '>
                    <FiSave /> Save Change
                  </button>
                   <button type="button" onClick={handleCancel}
                   className='flex flex-1 items-center justify-center gap-2 bg-coffee-orange text-white font-bold rounded-lg cursor-pointer py-3 hover:bg-coffee-brown '>
                    <FiX /> Cancel
                  </button>
                 </div>
                 </div>
              </form>
            ):(
              <div className='mx-4'>
              
                <div className='flex items-center gap-2 mb-1'>
                  <FiMail />
                  <span>{user.email}</span>
                </div>
                <div className='flex items-center gap-2 mb-1'>
                  <FiPhone />
                  <span>{user.phone || "No phone number added"}</span>
                </div>
                
                <div className='flex items-center gap-2 mb-1'>
                  <FiMapPin />
                  <span>{user.address || "No address added"}</span>
                </div>
                <div className='gap-2 mb-1'>
                  <p className='text-sm font-semibold text-coffee-brown mb-1'>Bio</p>
                  <p>{user.bio || "Bio is not added yet"}</p>
                </div>
                <button onClick={()=>setIsediting(true)}
                  className='w-full flex items-center justify-center border-coffee-orange gap-2 my-2 bg-coffee-orange text-white font-bold rounded-lg py-2 hover:bg-coffee-brown cursor-pointer
                  '>
                  <FiEdit2 /> 
                  Edit profile
                </button>
                  <button onClick={logOut}
                  className='w-full flex items-center justify-center border border-red-500 gap-2 my-2  text-red-500 font-bold rounded-lg py-2 hover:bg-coffee-brown cursor-pointer
                  '>
                Log Out
                </button>
              </div>
            )
          }
      </div>
    </div>
    </div>
  )
}

export default Profile