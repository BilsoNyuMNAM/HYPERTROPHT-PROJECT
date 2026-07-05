import Addmesobutton from "../components/Addmeso";
import Mesocycle from "../components/Mesocycle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "boneyard-js/react";
import { Get, Delete } from "../service/centralisedApi.js";
import { Spinner } from "../components/ui/spinner";
import Deletedialog from "../../src/pages/DeleteDialog";
import { useState } from "react";

function Allmesocycle() {
    const queryClient = useQueryClient();
    async function fetchMesocycle() {
        const response = await Get("/mesoCycle/all");
        if (!response.ok) {
            throw new Error(`Failed to fetch mesocycles: ${response.status}`)
        }
        const data = await response.json();
        return data;
    }
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { data, isLoading } = useQuery({
        queryKey: ["mesocycles"],
        queryFn: fetchMesocycle,
    });

    async function handleDeleteMesocycle(mesocycleId: number) {
        const response = await Delete(`/mesoCycle/${mesocycleId}`);
        if (!response.ok) {
            console.error("Failed to delete mesocycle");
            throw new Error("Failed to delete mesocycle");
        }
    }

    const { isPending, mutate } = useMutation({
        mutationFn: handleDeleteMesocycle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mesocycles"] });
        },
    });

    return (
        
        <Skeleton name="allmesocycle" loading={isLoading}>
            {
                showDeleteDialog && (
                    <Deletedialog
                        onConfirm={() => {
                            if (deleteId !== null) {
                                mutate(deleteId);
                                setShowDeleteDialog(false);
                                setDeleteId(null);
                            }
                        }}
                        onCancel={() => {
                            setShowDeleteDialog(false);
                            setDeleteId(null);
                        }}
                    />
                )
            }
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: "#0f0f0f",
                    color: "#ffffff",
                    fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "900px",
                        margin: "0 auto",
                        padding: "0 40px",
                    }}
                >
                  
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "28px 0",
                            borderBottom: "1px solid #1e1e1e",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                color: "#ffffff",
                            }}
                        >
                            Mesocycles
                        </p>
                        <Addmesobutton />
                    </div>

                 
                    <div style={{ paddingTop: "56px", paddingBottom: "48px" }}>
                        <p
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                                color: "#3f3f46",
                                marginBottom: "16px",
                                fontWeight: 500,
                            }}
                        >
                            Training
                        </p>
                        <h1
                            style={{
                                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                                fontWeight: 700,
                                lineHeight: 0.9,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            <span style={{ color: "#ffffff", display: "block" }}>Your</span>
                            <span style={{ color: "#2a2a2a", display: "block" }}>Mesocycles</span>
                        </h1>
                    </div>

                   
                    {isLoading ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "64px 0",
                            }}
                        >
                            <Spinner className="w-7 h-7 text-white" />
                        </div>
                    ) : (
                        <Mesocycle
                            mesocycle={data?.data || []}
                            onDelete={(id) => {
                                setDeleteId(id);
                                setShowDeleteDialog(true);
                            }}
                            isPending={isPending}
                        />
                    )}
                </div>
            </div>
        </Skeleton>
         
        
        
    );
}

export default Allmesocycle;
