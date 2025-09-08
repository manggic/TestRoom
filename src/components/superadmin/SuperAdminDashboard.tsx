import { getAllOrg } from "@/services/organizationService";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
    Mail,
    User,
    Phone,
    CalendarFold,
    House,
    MapPinHouse,
    ChartPie,
} from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
function SuperAdminDashboard() {
    const [orgs, setOrgs] = useState([]);

    const navigate = useNavigate();
    useEffect(() => {
        const fetchAllOrg = async () => {
            const response = await getAllOrg();

            setOrgs(response?.data || []);
        };

        fetchAllOrg();
    }, []);
    return (
        <div>
            <div className="min-h-screen px-4 py-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
                <h1 className="text-xl sm:text-2xl font-bold my-4">
                    SuperAdmin Dashboard
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orgs?.map((org) => {
                        const {
                            org_name,
                            email,
                            owner_name,
                            contact_number,
                            request_status,
                            state,
                            city,
                            created_at,
                            id,
                        } = org || {};
                        return (
                            <Card className="bg-white dark:bg-zinc-800 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                                <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                                    {org_name}
                                </h2>
                                <div className="grid grid-cols-1 gap-3 text-gray-800 dark:text-gray-300 text-sm">
                                    <div className="flex items-center gap-2">
                                        {" "}
                                        <Mail size={20} /> Email: {email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {" "}
                                        <User size={20} />
                                        Owner Name: {owner_name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={20} />
                                        Contact Number: {contact_number}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {" "}
                                        <ChartPie size={20} />
                                        Request Status: {request_status}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {" "}
                                        <House size={20} />
                                        State: {state}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPinHouse size={20} />
                                        City: {city}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {" "}
                                        <CalendarFold size={20} /> Created At:{" "}
                                        {formatDate(created_at)}
                                    </div>
                                </div>

                                <Button
                                    onClick={() =>
                                        navigate(`/superadmin/org/${id}`)
                                    }
                                    className="cursor-pointer"
                                >
                                    More Details
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SuperAdminDashboard;
