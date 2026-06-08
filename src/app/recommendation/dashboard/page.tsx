"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_URL } from "@/config/constant";

const Dashboard = () => {
    const router = useRouter();

    useEffect(() => {
        router.push(APP_URL.RECOMMENDATION);
    }, [router]);

    return null; 
};

export default Dashboard;