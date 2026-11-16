export default function copySessionData(sessiondata: any) {
    return {
        ...sessiondata,
        sessionexercise: sessiondata.sessionexercise.map((element: any) => ({
            ...element,
            set: element.set.map((eachset: any) => ({ ...eachset })),
        })),
        feedback:[]
    }
}
