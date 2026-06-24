

export default function Logout(){
    function Logout(){
        window.localStorage.removeItem("token")
        window.location.href = "/"
    }
    return (
        <div>
            <button className="p-4 font-white font-spaceMono cursor-pointer" onClick={Logout}> Logout</button>
        </div>
    )
}