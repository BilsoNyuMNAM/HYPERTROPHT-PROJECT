
import Addmesobutton from "../components/Addmeso";
import Mesocycle from "../components/Mesocycle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from 'boneyard-js/react';
import { Get, Delete } from "../service/centralisedApi.js";
function Allmesocycle(){
    const queryClient = useQueryClient();
    async function fetchMesocycle(){
        const response = await Get("/mesoCycle/all");
        if (!response.ok) {
            throw new Error(`Failed to fetch mesocycles: ${response.status}`)
        }
        const data = await response.json();
        return data;
        
    } 

    const {data, isLoading} = useQuery({ 
        queryKey: ['mesocycles'],
        queryFn: fetchMesocycle
    })

    async function handleDeleteMesocycle(mesocycleId: number) {
            const response = await Delete(`/mesoCycle/${mesocycleId}`)

            if (!response.ok) {
                console.error("Failed to delete mesocycle")
                throw new Error("Failed to delete mesocycle")
            }
    }

    const{isPending, mutate }  = useMutation({
        mutationFn: handleDeleteMesocycle,
         onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['mesocycles'] })
        }
        
    })

    return (
        <Skeleton name="allmesocycle" loading={isLoading} >
            <div className="px-10 w-full min-h-screen bg-[#0a0a0a] text-white">
                <div className="w-full max-w-5xl mx-auto">

                    
                    <div className="flex justify-between items-center py-7 border-b border-[#161616]">
                        <h1
                            className="text-[15px] font-bold tracking-[0.25em] uppercase text-white"
                            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                        >
                            Mesocycles
                        </h1>
                        
                        <Addmesobutton />
                    </div>

                
                    <div className="pt-14 pb-12">
                        <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#555] mb-5">
                            Training
                        </p>
                        <h2
                            className="text-[88px] leading-[0.88] font-bold"
                            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                        >
                            <span className="text-white block">Your</span>
                            <span className="text-[#2a2a2a] block">Mesocycles</span>
                        </h2>
                    </div>

                    <div className="flex flex-col">
                        <Mesocycle
                            mesocycle={data?.data || []} 
                            onDelete={mutate}
                            isPending={isPending}
                        />
                    </div>

                </div>
            </div>
        </Skeleton>
)
}


export default Allmesocycle;
