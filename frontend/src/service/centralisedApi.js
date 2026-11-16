 

function baseRequest({endpoint, method, data}){
    return fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: data ? JSON.stringify(data) : null //IF DATA IS PRESENT STRINGFY ELSE PUT NULL IN THE BODY
    })
}

 function Get(endpoint){
    return baseRequest({endpoint, method:"GET"})
}

function Post(endpoint, body){
    return  baseRequest({endpoint, method:"POST", data:body})
}


function Delete(endpoint){
    return  baseRequest({endpoint, method:"DELETE", data:null})
}




export {Get, Post, Delete}