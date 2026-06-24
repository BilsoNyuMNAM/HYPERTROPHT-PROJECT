

async function baseRequest({endpoint, method, data}){
    return await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: data ? JSON.stringify(data) : null //IF DATA IS PRESENT STRINGFY ELSE PUT NULL IN THE BODY
    })
}

async function Get(endpoint){
    return await baseRequest({endpoint, method:"GET"})
}

async function Post(endpoint, body){
    return await baseRequest({endpoint, method:"POST", data:body})
}


async function Delete(endpoint){
    return await baseRequest({endpoint, method:"DELETE", data:null})
}




export {Get, Post, Delete}