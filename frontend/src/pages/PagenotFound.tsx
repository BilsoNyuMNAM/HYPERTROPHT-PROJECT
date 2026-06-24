
import { Link } from "react-router-dom";
export default function PagenotFound(){
    return(
        <div className="bg-white h-screen w-full">
            <p>OPPS PAGE NOT FOUND</p>

            <div>
                <Link to="/">
                    <button>BACK TO HOME PAGE</button>
                </Link>
            </div>
        </div>
    )
}